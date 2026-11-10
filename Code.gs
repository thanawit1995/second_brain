/**
 * ============================================================================
 * SECOND BRAIN AUTO-SYNC & GITHUB PUSH PIPELINE (v4.1 - Live + GitHub Dual Sync)
 * ระบบดึงข้อมูลจาก 00_MASTER_LOG_DB & โฟลเดอร์ weekly_work แล้ว Push ขึ้น GitHub JSON อัตโนมัติ
 * พร้อมรองรับการกดปุ่ม "🔄 ซิงค์" บนหน้าเว็บเพื่อสั่งอัปเดต GitHub ทันที (doGet)
 * ============================================================================
 */

const MASTER_DB_DOC_ID = '1YfVLmthxbEobQolf4ejXpSw91NBYiade2OatBMjeaO8'; // 00_MASTER_LOG_DB
const WEEKLY_FOLDER_ID = '1D-oCpEx6JXGSpf2qEpx-x4BBvibJgoTN'; // โฟลเดอร์ weekly_work
const MASTER_JSON_FILE_ID = '1Uh-qSzVbyW_vxH3wEmYF_1ip0ZigwBC_'; // 00_MASTER_DATA.json ใน Drive

const GITHUB_OWNER = 'thanawit1995';
const GITHUB_REPO  = 'second_brain';
const GITHUB_BRANCH = 'main';
const GITHUB_FILE_PATH = '00_MASTER_DATA.json';

/**
 * Web App Endpoint: เมื่อกดปุ่ม "🔄 ซิงค์" บนหน้าเว็บแอป
 * จะดึงข้อมูลสดจาก Google Docs + สั่ง Push อัปเดต 00_MASTER_DATA.json ขึ้น GitHub ทันที
 */
function doGet(e) {
  const isForce = e && e.parameter && (e.parameter.force === '1' || e.parameter.nocache);
  const fullDb = buildFullDatabasePayload();

  if (isForce) {
    try {
      pushPayloadToGitHub(fullDb);
    } catch (err) {
      Logger.log('GitHub push warning during doGet: ' + err);
    }
  }

  return ContentService
    .createTextOutput(JSON.stringify(fullDb))
    .setMimeType(ContentService.MimeType.JSON);
}

/**
 * Time-Driven Trigger Function: ตรวจสอบทั้ง 00_MASTER_LOG_DB และไฟล์ล่าสุดใน weekly_work
 */
function checkAndSyncToGitHub() {
  const docFile = DriveApp.getFileById(MASTER_DB_DOC_ID);
  let combinedSignature = docFile.getLastUpdated().toISOString();

  const latestWeeklyFile = getLatestWeeklyFileInFolder();
  if (latestWeeklyFile) {
    combinedSignature += '|' + latestWeeklyFile.getName() + ':' + latestWeeklyFile.getLastUpdated().toISOString();
  }

  const props = PropertiesService.getScriptProperties();
  const lastSynced = props.getProperty('LAST_SYNCED_SIGNATURE');

  if (lastSynced === combinedSignature) {
    Logger.log('ยังไม่มีการแก้ไขใหม่ใน 00_MASTER_LOG_DB หรือ weekly_work (' + combinedSignature + ')');
    return;
  }

  const success = pushUpdatedJsonToGitHub();
  if (success) {
    props.setProperty('LAST_SYNCED_SIGNATURE', combinedSignature);
    Logger.log('ซิงก์ข้อมูลขึ้น GitHub Pages สำเร็จเรียบร้อย! (' + combinedSignature + ')');
  } else {
    Logger.log('เกิดข้อผิดพลาดในการ Push ขึ้น GitHub กรุณาตรวจสอบ GITHUB_TOKEN ใน Script Properties');
  }
}

function pushUpdatedJsonToGitHub() {
  const fullDb = buildFullDatabasePayload();
  return pushPayloadToGitHub(fullDb);
}

function buildFullDatabasePayload() {
  let fullDb = {};
  try {
    const baseJsonStr = DriveApp.getFileById(MASTER_JSON_FILE_ID).getBlob().getDataAsString('UTF-8');
    fullDb = JSON.parse(baseJsonStr);
  } catch (e) {
    fullDb = { metadata: {}, config: {}, note_inbox: [] };
  }

  const liveData = extractAllDataFromMasterDoc();

  fullDb.metadata = {
    title: "00_MASTER_DATA (Second Brain Master Database)",
    owner: "นพ.ธนวิชญ์",
    last_updated: liveData.last_updated,
    schema_version: "5.0-AutoSync-PWA",
    architecture: "GitHub-Native Static JSON + Direct Live API Fallback"
  };
  fullDb.brief_log = liveData.brief_log;
  fullDb.project_board = liveData.project_board;
  fullDb.stock_master = liveData.stock_master;
  fullDb.watchlist = liveData.watchlist;
  fullDb.email_digest = liveData.email_digest;

  if (liveData.weekly_meta) {
    fullDb.weekly_meta = liveData.weekly_meta;
    fullDb.weekly_doc_url = liveData.weekly_meta.doc_url || '';
    fullDb.w42_doc_url = liveData.weekly_meta.doc_url || '';
  }
  if (liveData.weekly_living_schedule && liveData.weekly_living_schedule.length > 0) {
    fullDb.weekly_living_schedule = liveData.weekly_living_schedule;
    fullDb.w42_living_schedule = liveData.weekly_living_schedule;
  }
  if (liveData.weekly_summary_3x3) {
    fullDb.weekly_summary_3x3 = liveData.weekly_summary_3x3;
    fullDb.w42_summary_3x3 = liveData.weekly_summary_3x3;
  }

  if (liveData.note_inbox_recent && liveData.note_inbox_recent.length > 0) {
    if (!fullDb.note_inbox) fullDb.note_inbox = [];
    const existingFiles = new Set(fullDb.note_inbox.map(x => x.source_file));
    liveData.note_inbox_recent.forEach(item => {
      if (item.source_file && !existingFiles.has(item.source_file)) {
        fullDb.note_inbox.unshift(item);
      }
    });
  }

  return fullDb;
}

function pushPayloadToGitHub(fullDb) {
  const token = PropertiesService.getScriptProperties().getProperty('GITHUB_TOKEN');
  if (!token) {
    Logger.log('ERROR: ยังไม่ได้ตั้งค่า GITHUB_TOKEN ใน Script Properties');
    return false;
  }

  const apiUrl = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + GITHUB_FILE_PATH;
  const headers = {
    'Authorization': 'Bearer ' + token.trim(),
    'Accept': 'application/vnd.github+json',
    'User-Agent': 'Google-Apps-Script-AutoSync',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  let sha = null;
  try {
    const getRes = UrlFetchApp.fetch(apiUrl + '?ref=' + GITHUB_BRANCH, { method: 'get', headers: headers, muteHttpExceptions: true });
    if (getRes.getResponseCode() === 200) {
      sha = JSON.parse(getRes.getContentText()).sha;
    } else {
      Logger.log('GET GitHub file status: ' + getRes.getResponseCode() + ' ' + getRes.getContentText());
    }
  } catch (e) {
    Logger.log('Get SHA warning: ' + e);
  }

  const jsonOutput = JSON.stringify(fullDb, null, 2);
  const newContentBase64 = Utilities.base64Encode(jsonOutput, Utilities.Charset.UTF_8);
  const lastUpd = (fullDb.metadata && fullDb.metadata.last_updated) ? fullDb.metadata.last_updated : '';
  const putPayload = {
    message: '⚡ Auto-sync from Google Docs (' + lastUpd + ') [skip ci]',
    content: newContentBase64,
    branch: GITHUB_BRANCH
  };
  if (sha) putPayload.sha = sha;

  const putRes = UrlFetchApp.fetch(apiUrl, {
    method: 'put',
    headers: headers,
    contentType: 'application/json',
    payload: JSON.stringify(putPayload),
    muteHttpExceptions: true
  });

  const code = putRes.getResponseCode();
  if (code !== 200 && code !== 201) {
    Logger.log('PUT GitHub failed (' + code + '): ' + putRes.getContentText());
  }
  return (code === 200 || code === 201);
}

function getLatestWeeklyFileInFolder() {
  try {
    const folder = DriveApp.getFolderById(WEEKLY_FOLDER_ID);
    const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
    let latestFile = null;
    let latestTitle = '';
    while (files.hasNext()) {
      const f = files.next();
      const fname = f.getName();
      if (/^\d{4}-\d{2}-\d{2}.*Weekly-Work/i.test(fname)) {
        if (fname > latestTitle) {
          latestTitle = fname;
          latestFile = f;
        }
      }
    }
    return latestFile;
  } catch (e) {
    return null;
  }
}

function extractAllDataFromMasterDoc() {
  const doc = DocumentApp.openById(MASTER_DB_DOC_ID);
  const body = doc.getBody();
  const tables = body.getTables();

  let briefLog = [];
  let projectBoard = [];
  let stockMaster = [];
  let watchlist = [];
  let noteInboxRecent = [];
  let emailDigest = [];

  for (let i = 0; i < tables.length; i++) {
    const tbl = tables[i];
    if (tbl.getNumRows() < 2) continue;

    let tblSampleText = '';
    for (let r = 0; r < Math.min(tbl.getNumRows(), 4); r++) {
      tblSampleText += ' ' + tbl.getRow(r).getText().toLowerCase();
    }

    let maxRows = 0;
    if (tblSampleText.includes('source_file') || tblSampleText.includes('file_name')) {
      maxRows = 25;
    } else if (tblSampleText.includes('thread_id') || tblSampleText.includes('digest_batch') || tblSampleText.includes('subject')) {
      maxRows = 35;
    }

    const parsed = parseDocTable(tbl, maxRows);
    if (!parsed.length) continue;
    const sample = parsed[0];

    if ('am_work' in sample || 'am_volume' in sample || 'pm_work' in sample) {
      briefLog = parsed;
    } else if ('proj_id' in sample || 'project_id' in sample) {
      projectBoard = parsed;
    } else if ('verdict' in sample && 'ticker' in sample) {
      stockMaster = parsed;
    } else if ('criteria_summary' in sample || 'watchlist_status' in sample || ('ticker' in sample && 'score' in sample)) {
      watchlist = parsed;
    } else if ('source_file' in sample || 'file_name' in sample) {
      noteInboxRecent = parsed;
    } else if ('thread_id' in sample || 'digest_batch' in sample || 'sender' in sample) {
      emailDigest = parsed;
    }
  }

  if (emailDigest.length > 0) {
    const batches = emailDigest.map(e => e.digest_batch || e.date || '').filter(Boolean).sort();
    const latestBatch = batches.length ? batches[batches.length - 1] : '';
    if (latestBatch) {
      emailDigest = emailDigest.filter(e => (e.digest_batch || e.date) === latestBatch);
    }
    emailDigest = emailDigest.map(e => ({
      thread_id: e.thread_id || '',
      date: e.date || '',
      time: e.time || '',
      digest_batch: e.digest_batch || e.date || '',
      category: e.category || 'ทั่วไป',
      sender: e.sender || '-',
      subject: e.subject || '-',
      summary: e.summary || '-',
      gmail_url: e.thread_id ? ('https://mail.google.com/mail/u/0/#all/' + e.thread_id) : (e.gmail_url || 'https://mail.google.com/mail/u/0/#inbox')
    }));
  }

  const weeklyData = extractLatestWeeklyData(briefLog);

  return {
    last_updated: Utilities.formatDate(new Date(), 'Asia/Bangkok', 'yyyy-MM-dd HH:mm:ss'),
    brief_log: briefLog,
    project_board: projectBoard,
    stock_master: stockMaster,
    watchlist: watchlist,
    note_inbox_recent: noteInboxRecent,
    email_digest: emailDigest,
    weekly_meta: weeklyData.meta,
    weekly_living_schedule: weeklyData.schedule,
    weekly_summary_3x3: weeklyData.summary3x3
  };
}

function parseDocTable(table, maxRowsToRead) {
  const numRows = table.getNumRows();
  if (numRows < 2) return [];

  let headerRowIndex = -1;
  let headers = [];
  for (let r = 0; r < Math.min(numRows, 4); r++) {
    const row = table.getRow(r);
    const rowHeaders = [];
    let nonEmptyCount = 0;
    for (let c = 0; c < row.getNumCells(); c++) {
      const rawH = row.getCell(c).getText().trim();
      const cleanH = rawH.replace(/[*`\\]/g, '').trim().toLowerCase();
      rowHeaders.push(cleanH);
      if (cleanH !== '') nonEmptyCount++;
    }
    if (nonEmptyCount >= 2) {
      headerRowIndex = r;
      headers = rowHeaders;
      break;
    }
  }

  if (headerRowIndex === -1) return [];

  let startRow = headerRowIndex + 1;
  if (maxRowsToRead && (numRows - startRow) > (maxRowsToRead + 5)) {
    startRow = numRows - maxRowsToRead;
  }

  const results = [];
  for (let r = startRow; r < numRows; r++) {
    const row = table.getRow(r);
    const obj = {};
    let hasValue = false;
    for (let c = 0; c < headers.length && c < row.getNumCells(); c++) {
      const headerKey = headers[c];
      if (!headerKey) continue;
      const cell = row.getCell(c);
      let val = cell.getText().trim();
      if ((headerKey === 'doc_url' || headerKey === 'screen_doc_ref') && val && val !== '-') {
        val = extractLinkFromCell(cell, val);
      }
      if (val !== '') hasValue = true;
      obj[headerKey] = val;
    }
    if (hasValue) results.push(obj);
  }
  return results;
}

function extractLinkFromCell(cell, rawText) {
  if (!rawText || rawText === '-' || rawText === 'ไม่มี') return '';
  const mdMatch = rawText.match(/\((https?:\/\/[^\s\)]+)\)/);
  if (mdMatch) return mdMatch[1];
  const urlMatch = rawText.match(/(https?:\/\/[^\s\]]+)/);
  if (urlMatch) return urlMatch[1];

  try {
    const numChildren = cell.getNumChildren();
    for (let i = 0; i < numChildren; i++) {
      const child = cell.getChild(i);
      if (child.getType() === DocumentApp.ElementType.PARAGRAPH) {
        const textObj = child.asParagraph().editAsText();
        const u = textObj.getLinkUrl(0);
        if (u) return u;
        const len = textObj.getText().length;
        if (len > 2) {
          const uMid = textObj.getLinkUrl(Math.floor(len / 2));
          if (uMid) return uMid;
        }
      }
    }
  } catch (e) {}
  return rawText;
}

function cleanDocValue(str) {
  if (!str) return '';
  return String(str).replace(/\*\*/g, '').replace(/\\-/g, '-').replace(/\\_/g, '_').trim();
}

function formatShortThaiDay(dayLabelText, isoDate) {
  const dayNames = ['อา.', 'จ.', 'อ.', 'พ.', 'พฤ.', 'ศ.', 'ส.'];
  const monthNames = ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'ต.ค.', 'พ.ย.', 'ธ.ค.'];
  if (isoDate && /^\d{4}-\d{2}-\d{2}$/.test(isoDate)) {
    const parts = isoDate.split('-').map(Number);
    const dt = new Date(parts[0], parts[1] - 1, parts[2]);
    return dayNames[dt.getDay()] + ' ' + parts[2] + ' ' + monthNames[parts[1] - 1];
  }
  return dayLabelText;
}

function toShortThaiDateRange(rangeStr) {
  if (!rangeStr) return '';
  return rangeStr.replace(/^ระหว่างวันที่\s*/, '')
    .replace(/มกราคม/g, 'ม.ค.').replace(/กุมภาพันธ์/g, 'ก.พ.').replace(/มีนาคม/g, 'มี.ค.')
    .replace(/เมษายน/g, 'เม.ย.').replace(/พฤษภาคม/g, 'พ.ค.').replace(/มิถุนายน/g, 'มิ.ย.')
    .replace(/กรกฎาคม/g, 'ก.ค.').replace(/สิงหาคม/g, 'ส.ค.').replace(/กันยายน/g, 'ก.ย.')
    .replace(/ตุลาคม/g, 'ต.ค.').replace(/พฤศจิกายน/g, 'พ.ย.').replace(/ธันวาคม/g, 'ธ.ค.')
    .replace(/\s*25\d\d/g, '').trim();
}

function extractLatestWeeklyData(briefLog) {
  try {
    let docId = null;
    let docUrl = '';
    let latestTitle = '';

    // 1. ตรวจสอบไฟล์ล่าสุดจากโฟลเดอร์ weekly_work เป็นอันดับแรก เพื่อให้เช้าวันจันทร์ขึ้นสัปดาห์ใหม่ทันที
    const latestFile = getLatestWeeklyFileInFolder();
    if (latestFile) {
      docId = latestFile.getId();
      latestTitle = latestFile.getName();
      docUrl = 'https://docs.google.com/document/d/' + docId + '/edit';
    }

    // 2. Fallback จากแถวล่าสุดของ BRIEF_LOG หากไม่พบในโฟลเดอร์
    if (!docId && briefLog && briefLog.length > 0) {
      for (let i = briefLog.length - 1; i >= 0; i--) {
        const u = briefLog[i].doc_url || '';
        const m = u.match(/\/d\/([a-zA-Z0-9_-]+)/);
        if (m) {
          docId = m[1];
          docUrl = 'https://docs.google.com/document/d/' + docId + '/edit';
          break;
        }
      }
    }

    if (!docId) return { meta: null, schedule: [], summary3x3: null };

    const wDoc = DocumentApp.openById(docId);
    latestTitle = latestTitle || wDoc.getName();
    const body = wDoc.getBody();
    const fullText = body.getText();
    const wTables = body.getTables();
    const schedule = [];

    const wMatch = latestTitle.match(/W(\d+)/i);
    const weekCode = wMatch ? ('W' + wMatch[1]) : 'Weekly';

    let targetTable = null;
    for (let i = 0; i < wTables.length; i++) {
      const tbl = wTables[i];
      if (tbl.getNumRows() > 1) {
        const headerText = tbl.getRow(0).getText().toLowerCase();
        if (headerText.includes('วัน') || headerText.includes('ภาระงาน') || headerText.includes('am_vol') || headerText.includes('am_work')) {
          targetTable = tbl;
          break;
        }
      }
    }
    if (!targetTable && wTables.length > 0) targetTable = wTables[0];

    if (targetTable) {
      for (let r = 1; r < targetTable.getNumRows(); r++) {
        const row = targetTable.getRow(r);
        if (row.getNumCells() >= 8) {
          const dayLabelText = cleanDocValue(row.getCell(0).getText());
          const dateMatch = dayLabelText.match(/(\d{4}-\d{2}-\d{2})/);
          const isoDate = dateMatch ? dateMatch[1] : '';
          const shortDay = formatShortThaiDay(dayLabelText, isoDate);
          const isWeekend = dayLabelText.includes('วันหยุด') || dayLabelText.includes('เสาร์') || dayLabelText.includes('อาทิตย์') || r >= 6;

          let amWork = cleanDocValue(row.getCell(1).getText());
          if (!amWork || amWork === '-') amWork = isWeekend ? 'วันหยุดสุดสัปดาห์' : '-';

          let amVol = cleanDocValue(row.getCell(2).getText()) || '-';
          let pmWork = cleanDocValue(row.getCell(3).getText());
          if (!pmWork || pmWork === '-') pmWork = isWeekend ? 'วันหยุดสุดสัปดาห์' : '-';

          let pmVol = cleanDocValue(row.getCell(4).getText()) || '-';
          const otText = cleanDocValue(row.getCell(5).getText()) || 'ไม่มี';
          const totVol = cleanDocValue(row.getCell(6).getText()) || '-';
          const issueAct = cleanDocValue(row.getCell(7).getText()) || '-';

          schedule.push({
            date: isoDate,
            day_label: dayLabelText,
            short_day: shortDay,
            am_work: amWork,
            am_volume: amVol,
            pm_work: pmWork,
            pm_volume: pmVol,
            overtime: otText,
            ot_volume: (otText === 'ไม่มี' || otText === '-') ? '-' : otText,
            total: totVol,
            issue_action: issueAct,
            doc_url: docUrl
          });
        }
      }
    }

    let rangeShort = '';
    const rangeMatch = fullText.match(/ระหว่างวันที่\s*([^\)\n|]+)/);
    if (rangeMatch) rangeShort = toShortThaiDateRange(rangeMatch[1]);

    const meta = {
      week_code: weekCode,
      week_num: weekCode,
      doc_id: docId,
      doc_title: latestTitle,
      doc_url: docUrl,
      date_range: rangeShort,
      date_range_short: rangeShort,
      header_title: 'สัปดาห์นี้ (' + weekCode + (rangeShort ? ': ' + rangeShort : '') + ')'
    };

    let summary3x3 = null;
    if (fullText.includes('3 Bottlenecks') && fullText.includes('3 Systems Wins')) {
      summary3x3 = parse3x3FromText(fullText, latestTitle, meta);
    }

    return { meta: meta, schedule: schedule, summary3x3: summary3x3 };
  } catch (e) {
    return { meta: null, schedule: [], summary3x3: null };
  }
}

function parse3x3FromText(text, docTitle, meta) {
  try {
    const parseSection = function(startKeyword, endKeyword) {
      const startIdx = text.indexOf(startKeyword);
      if (startIdx === -1) return [];
      const endIdx = endKeyword ? text.indexOf(endKeyword, startIdx) : text.length;
      const firstNewline = text.indexOf('\n', startIdx);
      if (firstNewline === -1 || (endIdx !== -1 && firstNewline >= endIdx)) return [];
      const sub = (endIdx !== -1) ? text.substring(firstNewline + 1, endIdx) : text.substring(firstNewline + 1);
      const lines = sub.split('\n');
      const items = [];
      for (let i = 0; i < lines.length; i++) {
        let line = lines[i].trim();
        if (!line || line.includes('3 Bottlenecks') || line.includes('3 Systems Wins') || line.includes('3 Next Actions')) continue;
        const raw = line.replace(/^(\d+[\.\)]\s*|[-•✦▸]\s*)+/, '').trim();
        if (raw.length < 8 || /^\(.*\)$/.test(raw) || raw.includes('รอประมวลผล')) continue;
        const colonIdx = raw.indexOf(':');
        if (colonIdx !== -1) {
          items.push({ title: raw.substring(0, colonIdx).replace(/\*/g, '').trim(), desc: raw.substring(colonIdx + 1).replace(/\*/g, '').trim() });
        } else if (raw.length > 15) {
          items.push({ title: raw.replace(/\*/g, '').trim(), desc: '' });
        }
      }
      return items.slice(0, 3);
    };

    return {
      week_code: meta ? (meta.week_code || meta.week_num) : '',
      doc_url: meta ? meta.doc_url : '',
      title: 'สรุปประเด็นสำคัญประจำสัปดาห์แบบ 3x3 (The 3x3 Core Summary)',
      subtitle: docTitle + ' • สังเคราะห์จาก Living Weekly File',
      bottlenecks: parseSection('3 Bottlenecks', '3 Systems Wins'),
      wins: parseSection('3 Systems Wins', '3 Next Actions'),
      actions: parseSection('3 Next Actions', 'เอกสารนี้จัดทำ')
    };
  } catch(e) {
    return null;
  }
}

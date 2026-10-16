/**
 * ============================================================================
 * SECOND BRAIN AUTO-SYNC & LIVE API (Google Apps Script v3)
 * เชื่อมต่อเอกสารฐานข้อมูล 00_MASTER_LOG_DB (รวมสรุปอีเมลประจำวัน) เข้ากับ GitHub Pages
 * ============================================================================
 * รองรับการทำงาน 2 โหมดควบคู่กัน:
 *   โหมดที่ 1 (Live Pull API - แนะนำ):
 *     - กด Deploy > New deployment > Web app (Execute as: Me, Who has access: Anyone)
 *     - นำ Web App URL ไปวางในแท็บ "🔄 ตั้งค่า" บนเว็บแอป SecondBrain ครั้งเดียวจบ!
 *     - ทุกครั้งที่เปิดแอป หน้าเว็บจะดึงข้อมูลสดจาก 00_MASTER_LOG_DB (รวมสรุปอีเมล 19:00 น.) ทันที
 *
 *   โหมดที่ 2 (Auto-Push ไปยัง GitHub Pages อัตโนมัติ):
 *     - ใส่ค่า GITHUB_TOKEN ด้านล่าง แล้วตั้ง Trigger ให้รัน checkAndSyncToGitHub ทุก 15 นาที
 * ============================================================================
 */

const MASTER_DB_DOC_ID = '1YfVLmthxbEobQolf4ejXpSw91NBYiade2OatBMjeaO8'; // 00_MASTER_LOG_DB
const WEEKLY_FOLDER_ID = '1D-oCpEx6JXGSpf2qEpx-x4BBvibJgoTN'; // โฟลเดอร์ weekly_work
const MASTER_JSON_FILE_ID = '1Uh-qSzVbyW_vxH3wEmYF_1ip0ZigwBC_'; // 00_MASTER_DATA.json ใน Drive

const GITHUB_OWNER = 'thanawit1995';
const GITHUB_REPO  = 'second_brain';
const GITHUB_BRANCH = 'main';
const GITHUB_FILE_PATH = '00_MASTER_DATA.json';
const GITHUB_TOKEN = 'YOUR_GITHUB_PAT_TOKEN';

function doGet(e) {
  const payload = extractAllDataFromMasterDoc();
  return ContentService
    .createTextOutput(JSON.stringify(payload))
    .setMimeType(ContentService.MimeType.JSON);
}

function checkAndSyncToGitHub() {
  const docFile = DriveApp.getFileById(MASTER_DB_DOC_ID);
  const lastModified = docFile.getLastUpdated().toISOString();
  const props = PropertiesService.getScriptProperties();
  const lastSynced = props.getProperty('LAST_SYNCED_TIMESTAMP');

  if (lastSynced === lastModified) {
    Logger.log('ยังไม่มีการแก้ไขใหม่ใน 00_MASTER_LOG_DB (Last modified: ' + lastModified + ')');
    return;
  }

  pushUpdatedJsonToGitHub();
  props.setProperty('LAST_SYNCED_TIMESTAMP', lastModified);
  Logger.log('ซิงก์ข้อมูลขึ้น GitHub Pages สำเร็จเรียบร้อย!');
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
    const parsed = parseDocTable(tables[i]);
    if (!parsed.length) continue;
    const sample = parsed[0];
    if ('am_work' in sample) briefLog = parsed;
    else if ('proj_id' in sample) projectBoard = parsed;
    else if ('verdict' in sample) stockMaster = parsed;
    else if ('criteria_summary' in sample) watchlist = parsed;
    else if ('source_file' in sample) noteInboxRecent = parsed;
    else if ('thread_id' in sample || 'digest_batch' in sample) emailDigest = parsed;
  }

  // กรองเฉพาะอีเมลของรอบวันล่าสุดเท่านั้น (ไม่เก็บข้อมูลวันเก่า)
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
      category: e.category || 'อื่นๆ',
      sender: e.sender || '-',
      subject: e.subject || '-',
      summary: e.summary || '-',
      gmail_url: e.thread_id ? ('https://mail.google.com/mail/u/0/#all/' + e.thread_id) : (e.gmail_url || 'https://mail.google.com/mail/u/0/#inbox')
    }));
  }

  const w42Schedule = extractLatestWeeklySchedule();

  return {
    last_updated: DriveApp.getFileById(MASTER_DB_DOC_ID).getLastUpdated().toLocaleString('th-TH'),
    brief_log: briefLog,
    project_board: projectBoard,
    stock_master: stockMaster,
    watchlist: watchlist,
    note_inbox_recent: noteInboxRecent,
    email_digest: emailDigest,
    w42_living_schedule: w42Schedule
  };
}

function parseDocTable(table) {
  const numRows = table.getNumRows();
  if (numRows < 2) return [];
  const headers = [];
  const headerRow = table.getRow(0);
  for (let c = 0; c < headerRow.getNumCells(); c++) {
    headers.push(headerRow.getCell(c).getText().trim().replace(/\\_/g, '_'));
  }

  const results = [];
  for (let r = 1; r < numRows; r++) {
    const row = table.getRow(r);
    const obj = {};
    let hasValue = false;
    for (let c = 0; c < headers.length && c < row.getNumCells(); c++) {
      const val = row.getCell(c).getText().trim().replace(/\\_/g, '_');
      if (val !== '') hasValue = true;
      obj[headers[c]] = val;
    }
    if (hasValue) results.push(obj);
  }
  return results;
}

function extractLatestWeeklySchedule() {
  try {
    const folder = DriveApp.getFolderById(WEEKLY_FOLDER_ID);
    const files = folder.getFilesByType(MimeType.GOOGLE_DOCS);
    let latestFile = null;
    let latestTitle = '';
    while (files.hasNext()) {
      const f = files.next();
      if (f.getName() > latestTitle) {
        latestTitle = f.getName();
        latestFile = f;
      }
    }
    if (!latestFile) return [];
    const wDoc = DocumentApp.openById(latestFile.getId());
    const wTables = wDoc.getBody().getTables();
    if (wTables.length === 0) return [];
    const t = wTables[0];
    const schedule = [];
    for (let r = 1; r < t.getNumRows(); r++) {
      const row = t.getRow(r);
      if (row.getNumCells() >= 8) {
        schedule.push({
          day_label: row.getCell(0).getText().trim(),
          am_work: row.getCell(1).getText().trim(),
          am_volume: row.getCell(2).getText().trim(),
          pm_work: row.getCell(3).getText().trim(),
          pm_volume: row.getCell(4).getText().trim(),
          overtime: row.getCell(5).getText().trim(),
          total: row.getCell(6).getText().trim(),
          issue_action: row.getCell(7).getText().trim()
        });
      }
    }
    return schedule;
  } catch (e) {
    return [];
  }
}

function pushUpdatedJsonToGitHub() {
  const baseJsonStr = DriveApp.getFileById(MASTER_JSON_FILE_ID).getBlob().getDataAsString('UTF-8');
  const fullDb = JSON.parse(baseJsonStr);
  const liveData = extractAllDataFromMasterDoc();

  fullDb.metadata.last_updated = liveData.last_updated;
  fullDb.brief_log = liveData.brief_log;
  fullDb.project_board = liveData.project_board;
  fullDb.stock_master = liveData.stock_master;
  fullDb.watchlist = liveData.watchlist;
  fullDb.email_digest = liveData.email_digest; // เขียนทับเฉพาะของวันนี้ ไม่เก็บของเก่า
  if (liveData.w42_living_schedule.length) {
    fullDb.w42_living_schedule = liveData.w42_living_schedule;
  }

  const existingFiles = new Set(fullDb.note_inbox.map(x => x.source_file));
  liveData.note_inbox_recent.forEach(item => {
    if (!existingFiles.has(item.source_file)) {
      fullDb.note_inbox.unshift(item);
    }
  });

  const apiUrl = 'https://api.github.com/repos/' + GITHUB_OWNER + '/' + GITHUB_REPO + '/contents/' + GITHUB_FILE_PATH;
  const headers = {
    'Authorization': 'Bearer ' + GITHUB_TOKEN,
    'Accept': 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28'
  };

  let sha = null;
  const getRes = UrlFetchApp.fetch(apiUrl + '?ref=' + GITHUB_BRANCH, {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  });
  if (getRes.getResponseCode() === 200) {
    sha = JSON.parse(getRes.getContentText()).sha;
  }

  const newContentBase64 = Utilities.base64Encode(JSON.stringify(fullDb, null, 2), Utilities.Charset.UTF_8);
  const putPayload = {
    message: 'Auto-sync from 00_MASTER_LOG_DB (' + liveData.last_updated + ')',
    content: newContentBase64,
    branch: GITHUB_BRANCH
  };
  if (sha) putPayload.sha = sha;

  UrlFetchApp.fetch(apiUrl, {
    method: 'put',
    headers: headers,
    contentType: 'application/json',
    payload: JSON.stringify(putPayload),
    muteHttpExceptions: true
  });
}
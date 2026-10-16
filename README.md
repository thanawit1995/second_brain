# 🧠 Second Brain WebApp Dashboard & Living Master Log

ระบบฐานข้อมูลกลางและแดชบอร์ดงานเวชศาสตร์ครอบครัว งานพัฒนาระบบปฐมภูมิ ทะเบียนวิเคราะห์หุ้น สรุปอีเมลประจำวัน และคลังเอกสาร Inbox  
ออกแบบสไตล์ **Mobile-First Progressive Web App (PWA)** รองรับการทำงานแบบ Offline 100% พร้อมเชื่อมต่อฐานข้อมูลสดผ่าน Google Apps Script

![PWA Badge](https://img.shields.io/badge/PWA-Ready-0f4c81?style=for-the-badge&logo=pwa)
![Mobile First](https://img.shields.io/badge/Design-Mobile--First-0d9488?style=for-the-badge)
![GitHub Pages](https://img.shields.io/badge/Host-GitHub_Pages-22c55e?style=for-the-badge&logo=github)
![Offline Supported](https://img.shields.io/badge/Offline-Supported-6366f1?style=for-the-badge)

---

## 🌟 ฟีเจอร์หลัก (Key Features)

1. **🏥 คลินิก (Clinical & Living Weekly W42)**
   - **W42 Living Schedule:** ตารางภาระงานสะสมประจำสัปดาห์ (12–18 ต.ค. 2569) แสดงยอดผู้ป่วยเช้า/บ่าย/เวรนอกเวลา และประเด็นปัญหาหน้างาน
   - **🎯 สรุปประเด็นสำคัญประจำสัปดาห์แบบ 3x3 (The 3x3 Core Summary):**
     - 🚧 **3 Bottlenecks:** ปัญหาล็อกสิทธิ์ Google Sheets (แก้ไขสำเร็จ), ผู้ป่วยนอกเช้าหนาแน่น (รพ.สต.ตาลเตี้ย/OPD Fammed), และภาระงานบ่ายหลากหลายมิติ
     - 🏆 **3 Systems Wins:** สถาปัตยกรรม Living Weekly & Master Log (SYS-001), สื่อออกกำลังกายผู้สูงอายุ (GER-001) & Webapp ยาเด็ก (PED-001), และคุณภาพการบริบาลผู้ป่วยระยะท้าย/เชิงรุก (PAL-001, HW-001)
     - 🚀 **3 Next Actions:** ยกร่าง Triage Criteria & Nurse-Led Protocol (PC-003), ส่งมอบร่างสื่อออกกำลังกายผู้สูงอายุฉบับสมบูรณ์ (GER-001), และเปิดไฟล์ Living Weekly W43 ล่วงหน้า
   - **Brief_Log ประวัติภาระงาน:** ค้นหา กรองตามคลินิกเช้า/บ่าย และจัดเรียงข้อมูลแบบ Interactive
2. **🚀 ระบบ (Project Board)**
   - กระดานติดตามโครงการพัฒนาระบบปฐมภูมิ (DM-001, GER-001, PED-001) พร้อมแสดงสถานะ ผู้เกี่ยวข้อง คอขวด และกำหนดส่ง
3. **📈 หุ้น (Stock Master & Watchlist)**
   - ทะเบียนวิเคราะห์หุ้นเชิงลึก (SET, mai, US, ETF) ครอบคลุม Valuation, Fair Value, Entry Zone, Thesis, Catalyst และ Risk
   - กระดาน Watchlist หุ้นที่ผ่านการคัดกรองเบื้องต้นเพื่อรอ Deep Dive
4. **📧 เมล (Daily Email Digest)**
   - แดชบอร์ดสรุปอีเมลสำคัญประจำวันรอบ 19:00 น. แยกตามหมวดหมู่อัตโนมัติ (สิ่งที่ต้องดำเนินการ, ธุรกรรม, ข่าวสารวิชาการ, ความปลอดภัย)
5. **📥 โน้ต (04_Inbox-Notes Library)**
   - คลังค้นหาเอกสารวิชาการ Notability กว่า 200+ ฉบับ พร้อมระบบตัวกรองหมวดหมู่และระบบแบ่งหน้า (Pagination)
6. **📱 Progressive Web App (PWA)**
   - ไอคอนแบบ Clean 3D Matte (ดีไซน์ที่ 4)
   - ติดตั้งลงหน้าจอโฮมมือถือได้เสมือนแอปจริง (Add to Home Screen)
   - ใช้งานได้แม้อยู่ในพื้นที่ไม่มีสัญญาณอินเทอร์เน็ต (Service Worker Offline Cache)

---

## 🚀 วิธีนำขึ้นโฮสต์บน GitHub Pages (ภายใน 2 นาที)

### วิธีที่ 1: อัปโหลดผ่านเว็บเบราว์เซอร์ (ง่ายที่สุด ไม่ต้องใช้คอมมานด์ไลน์)
1. ไปที่ [GitHub](https://github.com) แล้วเข้าสู่ระบบ
2. กดปุ่ม **New Repository** (หรือเครื่องหมาย `+` มุมขวาบน)
3. ตั้งชื่อ Repository เช่น `second-brain` และเลือกให้เป็น **Public** จากนั้นกด **Create repository**
4. แตกไฟล์ `second-brain-webapp.zip` ในเครื่องของคุณ
5. ในหน้า Repository บน GitHub กดปุ่ม **Add file** &rarr; **Upload files**
6. ลากไฟล์ทั้งหมด (ตรวจดูให้แน่ใจว่าไฟล์ `index.html` อยู่ที่โฟลเดอร์หลัก root) แล้วกดปุ่มสีเขียว **Commit changes**
7. ไปที่เมนู **Settings** ด้านบนของ Repository &rarr; เมนูด้านซ้ายเลือก **Pages**
8. ตรงหัวข้อ **Build and deployment**:
   - **Source:** Deploy from a branch
   - **Branch:** เลือก `main` และโฟลเดอร์ `/ (root)` &rarr; กด **Save**
9. รอประมาณ 1–2 นาที GitHub จะสร้างลิงก์เว็บไซต์ให้ เช่น:
   ```
   https://<username>.github.io/second-brain/
   ```
   เปิดใช้งานและบันทึกลงหน้าจอมือถือได้ทันที!

---

### วิธีที่ 2: ใช้คำสั่ง Git Command Line
```bash
# 1. แตกไฟล์ zip และเข้าไปในโฟลเดอร์
cd second-brain-webapp

# 2. เริ่มต้น git และเพิ่มไฟล์ทั้งหมด
git init
git add .
git commit -m "feat: release Second Brain WebApp Dashboard v3.0"

# 3. เชื่อมต่อกับ GitHub Repository ของคุณ
git branch -M main
git remote add origin https://github.com/<your-username>/<your-repo-name>.git

# 4. Push ไฟล์ขึ้น GitHub
git push -u origin main
```
หลังจาก Push เสร็จแล้ว ให้ไปเปิด GitHub Pages ในแท็บ Settings &rarr; Pages ตามขั้นตอนด้านบน

---

## 📲 วิธีติดตั้งเป็นแอปบนหน้าจอมือถือ (Add to Home Screen)

### 🍎 iPhone / iPad (Safari)
1. เปิดลิงก์ GitHub Pages บน Safari
2. กดปุ่ม **แชร์ (Share ⬆️)** ด้านล่าง
3. เลื่อนลงมาเลือก **"เพิ่มไปยังหน้าจอโฮม" (Add to Home Screen ➕)**
4. กด **เพิ่ม (Add)** มุมขวาบน

### 🤖 Android (Chrome)
1. เปิดลิงก์ GitHub Pages บน Chrome
2. กดปุ่มเมนู **จุดสามจุด (⋮)** มุมขวาบน
3. เลือก **"ติดตั้งแอป" (Install app)** หรือ **"เพิ่มลงในหน้าจอหลัก"**

---

## 🔄 การเชื่อมต่อข้อมูลสดกับ Google Apps Script (Auto-Sync)

หากต้องการให้หน้าเว็บดึงข้อมูลสดจากเอกสาร `00_MASTER_LOG_DB` โดยตรง:
1. นำโค้ดในไฟล์ `google_apps_script_sync.js` ไปวางในโปรเจกต์ [Google Apps Script](https://script.google.com)
2. กด **Deploy** &rarr; **New deployment** &rarr; เลือกประเภท **Web app**
3. ตั้งค่า:
   - **Execute as:** Me (ฉัน)
   - **Who has access:** Anyone (ทุกคน)
4. คัดลอก Web App URL ที่ได้ (ขึ้นต้นด้วย `https://script.google.com/macros/s/.../exec`)
5. เปิดหน้าเว็บ Second Brain &rarr; ไปที่แท็บ **"🔄 ตั้งค่า"** &rarr; วาง URL ในช่อง Google Apps Script &rarr; กด **"บันทึก & ซิงก์ข้อมูลสดทันที"**

---

## 📁 โครงสร้างไฟล์ในแพ็กเกจ (Package File Structure)

```text
├── index.html                   # ไฟล์หลักของเว็บแอปพลิเคชัน (HTML, CSS, JS, Embedded Data)
├── 00_MASTER_DATA.json          # ฐานข้อมูลกลางฉบับสมบูรณ์ (JSON Backup)
├── manifest.json                # Web App Manifest สำหรับติดตั้ง PWA
├── sw.js                        # Service Worker สำหรับระบบแคช Offline
├── icon-192.png                 # ไอคอน PWA ขนาด 192x192 (Clean 3D Matte)
├── icon-512.png                 # ไอคอน PWA ขนาด 512x512 (Clean 3D Matte)
├── apple-touch-icon.png         # ไอคอนสำหรับหน้าจอโฮม iOS Safari (180x180)
├── favicon.png                  # Favicon ขนาด 32x32 สำหรับแท็บเบราว์เซอร์
├── favicon.ico                  # Favicon มาตรฐาน
├── google_apps_script_sync.js   # สคริปต์ Backend สำหรับ Google Apps Script Web App
├── .gitignore                   # การตั้งค่าละเว้นไฟล์ชั่วคราวสำหรับ Git
└── README.md                    # เอกสารแนะนำการติดตั้งและใช้งานฉบับนี้
```

---
*จัดทำขึ้นสำหรับระบบ Second Brain กลุ่มงานเวชศาสตร์ครอบครัว โรงพยาบาลสุโขทัย*

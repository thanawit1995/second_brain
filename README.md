# Second Brain WebApp (GitHub-Native JSON Architecture)

ระบบฐานข้อมูลกลางและแดชบอร์ดส่วนบุคคลสำหรับ นพ.ธนวิชญ์
เปลี่ยนผ่านสู่สถาปัตยกรรม **GitHub-Native Static JSON over CDN** เต็มรูปแบบ

## คุณสมบัติเด่น (Features):
- ⚡ **ความเร็วระดับเสี้ยววินาที:** โหลดและซิงก์ข้อมูลตรงจาก `./00_MASTER_DATA.json` ในเวลาไม่ถึง 0.1 วินาที (เร็วกว่าเดิม 100 เท่า)
- 🛡️ **หมดปัญหาการเชื่อมต่อ:** ตัดปัญหา CORS, ปัญหา Google Apps Script Timeout, และปัญหาหลายบัญชี Google ตีกันในเบราว์เซอร์มือถือ
- 📱 **รองรับ PWA 100%:** เปิดใช้งานได้ทั้งบน Desktop, iPad, iPhone, Android พร้อมโหมด Offline
- 📋 **ข้อมูลครบถ้วนทุกมิติ:**
  - 🩺 คลินิก: ข้อมูลสรุปสะสม 40+ วัน, ตารางสัปดาห์นี้ W45, สรุปประเด็น 3x3
  - 🚀 ระบบ: กระดานติดตาม 7 โครงการพัฒนาระบบปฐมภูมิ
  - 📈 หุ้น: 16 หุ้น Deep Dive + 16 หุ้น Watchlist
  - 📧 เมล: สรุปและแจ้งเตือนอีเมลประจำวัน พร้อมลิงก์ตรงสู่ Gmail
  - 📝 โน้ต: กล่องสืบค้นโน้ต 726+ ไฟล์แบบ Instant Search

## วิธีนำขึ้น GitHub Pages:
1. แตกไฟล์ ZIP นี้ลงในโฟลเดอร์ Repository `second_brain` บนเครื่องของคุณ
2. อัปโหลด (Commit & Push) ไฟล์ทั้งหมดขึ้น Branch `main`
3. ไปที่ GitHub Repository > **Settings** > **Pages** ตรวจสอบว่า Source เป็น `Deploy from a branch` (Branch: `main`, Folder: `/ (root)`)
4. เปิดแดชบอร์ดผ่าน GitHub Pages ของคุณได้ทันที!

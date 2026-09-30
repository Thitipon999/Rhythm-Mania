# ✈ Rhythm Mania
เกมจังหวะแนวสนามบิน (Vanilla JS + Canvas + WebAudio) เล่นได้ทั้ง PC และมือถือ (ติดตั้งเป็นแอปได้แบบ PWA)

## 1) ตั้งค่าฐานข้อมูลกลาง (ให้ทุกเครื่องใช้บัญชี/เพลง/Leaderboard ร่วมกัน)
GitHub Pages เป็นเว็บสถิตจึงเก็บข้อมูลกลางเองไม่ได้ เราใช้ Firebase Realtime Database (ฟรี):
1. เข้า https://console.firebase.google.com → Add project
2. Build → **Realtime Database** → Create Database → เลือกโลเคชัน (แนะนำ Singapore) → เริ่มแบบ test mode
3. แท็บ **Rules** วางแล้วกด Publish (test mode หมดอายุใน 30 วัน จึงต้องตั้งแบบนี้):
   `{ "rules": { ".read": true, ".write": true } }`
4. คัดลอก URL ของฐานข้อมูล (ขึ้นต้น https://...firebasedatabase.app) ไปใส่ใน `js/config.js` ช่อง `DB_URL`
5. Commit/push ขึ้น GitHub

ถ้าไม่ตั้งค่า เกมจะรันแบบออฟไลน์ (ข้อมูลอยู่ในเบราว์เซอร์เครื่องนั้นเท่านั้น)

> ข้อควรรู้ด้านความปลอดภัย: Rules แบบเปิดหมดทำให้ใครก็ตามที่รู้ URL แก้ข้อมูลได้ และรหัส STAFF ตรวจฝั่งเบราว์เซอร์ เหมาะกับเกมเล่นกันในกลุ่มเพื่อน/งานอีเวนต์ ไม่เหมาะกับข้อมูลสำคัญ อย่าใช้รหัสผ่านเดียวกับที่อื่น

## 2) ขึ้น GitHub Pages
อัปโหลดไฟล์ข้างในโฟลเดอร์นี้ไป root ของ repo (ให้ index.html อยู่ชั้นนอกสุด) → Settings → Pages → Deploy from a branch → main / (root)

## 3) มือถือ
เปิดลิงก์บนมือถือ แล้วเลือก "เพิ่มไปยังหน้าจอโฮม" (iOS: Share → Add to Home Screen, Android: เมนู ⋮ → Install app) แนะนำเล่นแนวนอน

## STAFF: เพิ่มเพลง
ปุ่ม STAFF มุมขวาบน รหัส `2026` (เปลี่ยนที่ `ADMIN_PASS` ใน js/admin.js) → "เพิ่ม/แก้เพลง" → เลือกไฟล์ `.osz` จาก osu!mania → ตรวจชื่อ/Level → กด ③ เผยแพร่

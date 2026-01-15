# KanbanPro - ระบบจัดการงานที่ทันสมัย

KanbanPro เป็นแอปพลิเคชันจัดการงาน (Task Management) ที่ออกแบบมาเพื่อเพิ่มประสิทธิภาพในการทำงานด้วยอินเตอร์เฟซที่สวยงาม ใช้งานง่าย และมาพร้อมกับฟีเจอร์การวิเคราะห์ข้อมูลที่ครบครัน รวมถึงผู้ช่วย AI อัจฉริยะ

## ✨ ฟีเจอร์หลัก (Main Features)

*   **🤖 AI Assistant (Gemini Powered)**:
    *   **Text-to-Action**: สร้าง (Create), แก้ไข (Edit), หรือย้าย (Move) งานได้ง่ายๆ ผ่านการพิมพ์แชท
    *   **Data Analysis**: สอบถามข้อมูลสรุป, หางานที่เกินกำหนด (Overdue), หรือวิเคราะห์ภาพรวมโปรเจกต์
    *   **Board Control**: สั่งสร้าง Widget สำหรับแสดงผลข้อมูลเฉพาะด้านได้ทันที
*   **🏔️ Epic Management**: จัดกาลำดับชั้นของงานแบบ Epic เพื่อแบ่งหมวดหมู่โปรเจกต์ขนาดใหญ่
*   **📋 Kanban Board**: ระบบลากและวาง (Drag-and-drop) เพื่อจัดการสถานะของงานได้อย่างอิสระ
*   **📊 Dashboard & Analytics**: แดชบอร์ดสรุปภาพรวมของงาน พร้อมกราฟเชิงวิเคราะห์จาก ECharts
*   **📅 Timeline View**: มุมมองไทม์ไลน์ช่วยให้เห็นลำดับเวลาและกำหนดการของงานแต่ละชิ้นได้อย่างชัดเจน
*   **🔍 Advanced Filtering**: ระบบกรองข้อมูลงานตามหมวดหมู่ (Category), สปรินต์ (Sprint) หรือความสำคัญ
*   **🧪 Unit Testing**: ระบบทดสอบระดับหน่วย (Unit Test) ครอบคลุมฟังก์ชันหลัก มั่นใจในความถูกต้องของโปรแกรม
*   **📥 Smart Import**: ระบบนำเข้าข้อมูลงานอัจฉริยะที่สามารถระบุวันที่เริ่มและกำหนดส่งได้โดยอัตโนมัติ
*   **🌓 Dark/Light Mode**: รองรับการปรับเปลี่ยนธีมมืดและสว่างตามความต้องการของผู้ใช้งาน

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

*   **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
*   **UI Framework**: [Ant Design](https://ant.design/)
*   **AI**: [Google Generative AI SDK](https://www.npmjs.com/package/@google/generative-ai) (Gemini Models)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Components & Icons**: [Lucide React](https://lucide.dev/), [dnd-kit](https://dndkit.com/)
*   **Testing**: [Vitest](https://vitest.dev/), [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
*   **Charts**: [Apache ECharts](https://echarts.apache.org/)

## 🛠️ การใช้งานเบื้องต้น (Usage Guide)

### 🤖 การใช้งาน AI Assistant
1.  คลิกที่ปุ่มแชทมุมขวาล่างเพื่อเปิดหน้าต่าง AI Assistant
2.  ใส่ API Key ของ Google Gemini (หากยังไม่ได้ตั้งค่าใน `.env`)
3.  ลองพิมพ์คำสั่ง เช่น:
    *   "สร้างงานใหม่ชื่อ 'Design Login Page' ให้หน่อย"
    *   "สรุปงานทั้งหมดที่ต้องส่งวันนี้"
    *   "สร้าง Epic สำหรับโปรเจกต์เว็บไซต์ใหม่"

### การเพิ่มและจัดการงาน
1.  คลิกปุ่ม **"+ New Task"** เพื่อสร้างงานใหม่
2.  ใส่รายละเอียดงาน เช่น ชื่อ, หมวดหมู่, สปรินต์ และวันที่
3.  ลากและวางการ์ดในหน้า **Board** เพื่อเปลี่ยนสถานะ (To Do, In Progress, Done)

### การดูภาพรวมและไทม์ไลน์
*   คลิกแถบ **"Dashboard"** เพื่อดูสถิติและกราฟวิเคราะห์งานทั้งหมด
*   คลิกแถบ **"Timeline"** เพื่อดูตารางเวลาของแต่ละงาน

### การนำเข้าและส่งออกข้อมูล
*   **Import**: คลิกปุ่ม "Import" เพื่อนำเข้าข้อมูลงานโดยการวางข้อความ
*   **Export to AI**: ในหน้า Dashboard คลิกปุ่ม "Export to AI" เพื่อคัดลอกข้อความสรุปงานทั้งหมดไปใช้ในโปรแกรม AI

## 🧪 การทดสอบ (Testing)

รันการทดสอบทั้งหมด (Watch Mode):
```bash
npm run test
```

รันการทดสอบและดูรายงานความครอบคลุม (Coverage Report):
```bash
npm run test:coverage
```

## 💻 สำหรับนักพัฒนา (Development)

การตั้งค่า Environment Variables:
สร้างไฟล์ `.env` ที่ root ของโปรเจกต์และเพิ่มค่าดังนี้:
```env
VITE_GOOGLE_AI_API_KEY=your_api_key_here
```

ติดตั้ง Dependencies:
```bash
npm install
```

รันแอปพลิเคชันในโหมด Development:
```bash
npm run dev
```

สร้าง Build สำหรับ Production:
```bash
npm run build
```

---
พัฒนาร่วมกับระบบจัดการงานที่ชาญฉลาด เพื่อประสิทธิภาพสูงสุดในทุกโปรเจกต์ของคุณ


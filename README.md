# KanbanPro - ระบบจัดการงานที่ทันสมัย

KanbanPro เป็นแอปพลิเคชันจัดการงาน (Task Management) ที่ออกแบบมาเพื่อเพิ่มประสิทธิภาพในการทำงานด้วยอินเตอร์เฟซที่สวยงาม ใช้งานง่าย และมาพร้อมกับฟีเจอร์การวิเคราะห์ข้อมูลที่ครบครัน

## ✨ ฟีเจอร์หลัก (Main Features)

*   **📋 Kanban Board**: ระบบลากและวาง (Drag-and-drop) เพื่อจัดการสถานะของงานได้อย่างอิสระ
*   **📊 Dashboard & Analytics**: แดชบอร์ดสรุปภาพรวมของงาน พร้อมกราฟเชิงวิเคราะห์จาก ECharts
*   **📅 Timeline View**: มุมมองไทม์ไลน์ช่วยให้เห็นลำดับเวลาและกำหนดการของงานแต่ละชิ้นได้อย่างชัดเจน
*   **🔍 Advanced Filtering**: ระบบกรองข้อมูลงานตามหมวดหมู่ (Category), สปรินต์ (Sprint) หรือความสำคัญ
*   **🤖 AI-ready Export**: ฟีเจอร์ส่งออกข้อมูลในรูปแบบที่พร้อมสำหรับนำไปใช้งานต่อกับ AI (ChatGPT/Claude)
*   **📥 Smart Import**: ระบบนำเข้าข้อมูลงานอัจฉริยะที่สามารถระบุวันที่เริ่มและกำหนดส่งได้โดยอัตโนมัติ
*   **🌓 Dark/Light Mode**: รองรับการปรับเปลี่ยนธีมมืดและสว่างตามความต้องการของผู้ใช้งาน

## 🚀 เทคโนโลยีที่ใช้ (Tech Stack)

*   **Core**: [React 19](https://react.dev/), [TypeScript](https://www.typescriptlang.org/), [Vite](https://vitejs.dev/)
*   **State Management**: [Zustand](https://zustand-demo.pmnd.rs/)
*   **Styling**: [Tailwind CSS](https://tailwindcss.com/)
*   **Components & Icons**: [Lucide React](https://lucide.dev/), [dnd-kit](https://dndkit.com/)
*   **Charts**: [Apache ECharts](https://echarts.apache.org/)

## 🛠️ การใช้งานเบื้องต้น (Usage Guide)

### การเพ่ิมและจัดการงาน
1.  คลิกปุ่ม **"+ New Task"** เพื่อสร้างงานใหม่
2.  ใส่รายละเอียดงาน เช่น ชื่อ, หมวดหมู่, สปรินต์ และวันที่
3.  ลากและวางการ์ดในหน้า **Board** เพื่อเปลี่ยนสถานะ (To Do, In Progress, Done)

### การดูภาพรวมและไทม์ไลน์
*   คลิกแถบ **"Dashboard"** เพื่อดูสถิติและกราฟวิเคราะห์งานทั้งหมด
*   คลิกแถบ **"Timeline"** เพื่อดูตารางเวลาของแต่ละงาน

### การนำเข้าและส่งออกข้อมูล
*   **Import**: คลิกปุ่ม "Import" เพื่อนำเข้าข้อมูลงานโดยการวางข้อความ
*   **Export to AI**: ในหน้า Dashboard คลิกปุ่ม "Export to AI" เพื่อคัดลอกข้อความสรุปงานทั้งหมดไปใช้ในโปรแกรม AI

## 💻 สำหรับนักพัฒนา (Development)

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


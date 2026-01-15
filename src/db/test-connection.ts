
import { neon, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;


// Environment variables are loaded via --env-file=.env

const dbUrl = process.env.VITE_DATABASE_URL;

if (!dbUrl) {
    console.error("❌ Error: VITE_DATABASE_URL is missing.");
    process.exit(1);
}

const sql = neon(dbUrl);

async function testConnection() {
    const testId = `test-${Date.now()}`;
    console.log("🔄 Testing Database Connection...");

    try {
        // 1. Create (Insert)
        console.log("1. Insert Test Task...");
        const inserted = await sql`
            INSERT INTO tasks (id, title, status, description)
            VALUES (${testId}, 'DB Connection Test', 'todo', 'Temporary test record')
            RETURNING id, title;
        `;
        
        if (inserted.length > 0 && inserted[0].id === testId) {
            console.log("   ✅ Insert Successful:", inserted[0]);
        } else {
            throw new Error("Insert failed to return data");
        }

        // 2. Read (Select)
        console.log("2. Verify Data...");
        const selected = await sql`SELECT * FROM tasks WHERE id = ${testId}`;
        if (selected.length === 1) {
            console.log("   ✅ Read Successful. Found record.");
        } else {
            throw new Error("Read failed. Record not found.");
        }

        // 3. Rollback (Delete)
        console.log("3. Rollback (Delete)...");
        await sql`DELETE FROM tasks WHERE id = ${testId}`;
        
        // 4. Verify Deletion
        const check = await sql`SELECT * FROM tasks WHERE id = ${testId}`;
        if (check.length === 0) {
            console.log("   ✅ Rollback Successful. Record deleted.");
        } else {
            throw new Error("Delete failed. Record still exists.");
        }

        console.log("\n🎉 Database Connection Verified! Read/Write operation is healthy.");

    } catch (error) {
        console.error("\n❌ Connection Test Failed:", error);
    }
}

testConnection();

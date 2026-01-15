import { Pool, neonConfig } from '@neondatabase/serverless';
import ws from 'ws';
neonConfig.webSocketConstructor = ws;
import * as dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Load env vars
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function setupDatabase() {
    const dbUrl = process.env.VITE_DATABASE_URL;
    if (!dbUrl) {
        console.error("❌ VITE_DATABASE_URL is not defined in .env");
        process.exit(1);
    }

    console.log("Connecting to Database via Pool...");
    const pool = new Pool({ connectionString: dbUrl });

    try {
        console.log("Reading schema.sql...");
        const schemaPath = path.join(__dirname, 'schema.sql');
        const schemaSql = fs.readFileSync(schemaPath, 'utf8');

        const statements = schemaSql.split(';')
            .map(s => s.trim())
            .filter(s => s.length > 0);

        console.log(`Found ${statements.length} statements.`);

        for (const statement of statements) {
            console.log(`Executing: ${statement.substring(0, 50)}...`);
            await pool.query(statement);
        }

        console.log("✅ Database initialized successfully!");
        console.log("- Created 'tasks' table");
        console.log("- Created 'epics' table");
        console.log("- Created 'filters' table");
        
        await pool.end();

    } catch (error) {
        console.error("❌ Setup Failed:", error);
        await pool.end();
    }
}

setupDatabase();

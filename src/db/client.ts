
import { neon } from '@neondatabase/serverless';

const databaseUrl = import.meta.env.VITE_DATABASE_URL;

if (!databaseUrl && typeof window === 'undefined') {
    // Only warn on server-side/build time checks, allow it to be empty initially
}

export const sql = neon(databaseUrl || 'postgresql://placeholder');

export const checkConnection = async () => {
    try {
        const result = await sql`SELECT version()`;
        return { success: true, version: result[0].version };
    } catch (error) {
        return { success: false, error };
    }
};

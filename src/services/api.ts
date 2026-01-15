
import { sql } from "../db/client";
import type { Task, Epic, SavedFilter, TaskStatus, TaskCategory } from "../types";

export const api = {
    // --- TASKS ---
    getTasks: async (): Promise<Task[]> => {
        try {
            const rows = await sql`SELECT * FROM tasks ORDER BY order_index ASC, created_at DESC`;
            return rows.map(row => ({
                id: row.id,
                title: row.title,
                description: row.description || "",
                status: row.status as TaskStatus,
                category: row.category as TaskCategory,
                sprint: row.sprint || "Backlog",
                dueDate: row.due_date,
                startDate: row.start_date,
                assignees: row.assignees || [],
                subtasks: row.subtasks || [],
                epicId: row.epic_id || undefined,
                createdAt: Number(row.created_at),
            }));
        } catch (err) {
            console.error("Error fetching tasks:", err);
            return [];
        }
    },

    createTask: async (task: Task) => {
        await sql`
            INSERT INTO tasks (
                id, title, description, status, category, sprint, 
                due_date, start_date, assignees, subtasks, epic_id, created_at
            ) VALUES (
                ${task.id}, ${task.title}, ${task.description}, ${task.status}, 
                ${task.category}, ${task.sprint}, ${task.dueDate}, ${task.startDate || null}, 
                ${JSON.stringify(task.assignees)}, ${JSON.stringify(task.subtasks)}, 
                ${task.epicId || null}, ${task.createdAt}
            )
        `;
    },

    updateTask: async (id: string, updates: Partial<Task>) => {
        // Individual update queries for cleanliness (and safety with tagged templates)
        // In a real app with 'pg' or a query builder, we would construct a single dynamic query.
        const promises = [];
        
        if (updates.title !== undefined) promises.push(sql`UPDATE tasks SET title = ${updates.title} WHERE id = ${id}`);
        if (updates.status !== undefined) promises.push(sql`UPDATE tasks SET status = ${updates.status} WHERE id = ${id}`);
        if (updates.description !== undefined) promises.push(sql`UPDATE tasks SET description = ${updates.description} WHERE id = ${id}`);
        if (updates.category !== undefined) promises.push(sql`UPDATE tasks SET category = ${updates.category} WHERE id = ${id}`);
        if (updates.dueDate !== undefined) promises.push(sql`UPDATE tasks SET due_date = ${updates.dueDate} WHERE id = ${id}`);
        if (updates.startDate !== undefined) promises.push(sql`UPDATE tasks SET start_date = ${updates.startDate} WHERE id = ${id}`);
        if (updates.epicId !== undefined) promises.push(sql`UPDATE tasks SET epic_id = ${updates.epicId} WHERE id = ${id}`);
        if (updates.subtasks !== undefined) promises.push(sql`UPDATE tasks SET subtasks = ${JSON.stringify(updates.subtasks)} WHERE id = ${id}`);
        
        await Promise.all(promises);
    },

    deleteTask: async (id: string) => {
        await sql`DELETE FROM tasks WHERE id = ${id}`;
    },

    // --- EPICS ---
    getEpics: async (): Promise<Epic[]> => {
        try {
            const rows = await sql`SELECT * FROM epics`;
            return rows.map(row => ({
                id: row.id,
                title: row.title,
                color: row.color,
                status: row.status as any,
                startDate: row.start_date,
                dueDate: row.due_date
            }));
        } catch (err) {
            console.error("Error fetching epics:", err);
            return [];
        }
    },

    createEpic: async (epic: Epic) => {
        await sql`
            INSERT INTO epics (id, title, color, status, start_date, due_date)
            VALUES (${epic.id}, ${epic.title}, ${epic.color}, ${epic.status}, ${epic.startDate || null}, ${epic.dueDate || null})
        `;
    },

    updateEpic: async (id: string, updates: Partial<Epic>) => {
        const promises = [];
        if (updates.title !== undefined) promises.push(sql`UPDATE epics SET title = ${updates.title} WHERE id = ${id}`);
        if (updates.color !== undefined) promises.push(sql`UPDATE epics SET color = ${updates.color} WHERE id = ${id}`);
        if (updates.startDate !== undefined) promises.push(sql`UPDATE epics SET start_date = ${updates.startDate} WHERE id = ${id}`);
        if (updates.dueDate !== undefined) promises.push(sql`UPDATE epics SET due_date = ${updates.dueDate} WHERE id = ${id}`);
        
        await Promise.all(promises);
    },

    deleteEpic: async (id: string) => {
        await sql`DELETE FROM epics WHERE id = ${id}`;
    },

    // --- FILTERS ---
    getFilters: async (): Promise<SavedFilter[]> => {
        try {
            const rows = await sql`SELECT * FROM filters`;
            return rows.map(row => ({
                id: row.id,
                name: row.name,
                criteria: row.criteria // JSONB automatically parsed
            }));
        } catch (err) {
            console.error("Error fetching filters:", err);
            return [];
        }
    },

    createFilter: async (filter: SavedFilter) => {
        await sql`
            INSERT INTO filters (id, name, criteria)
            VALUES (${filter.id}, ${filter.name}, ${JSON.stringify(filter.criteria)})
        `;
    },

    deleteFilter: async (id: string) => {
        await sql`DELETE FROM filters WHERE id = ${id}`;
    }
};

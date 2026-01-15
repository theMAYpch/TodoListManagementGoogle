
-- Tasks Table (Stores Tasks and Subtasks via ref_id)
CREATE TABLE IF NOT EXISTS tasks (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    status TEXT NOT NULL,       -- todo, doing, review, done
    category TEXT,              -- Feature, Bug, etc.
    priority TEXT,              -- (Optional if we decide to keep it in DB schema alongside category)
    sprint TEXT,
    due_date TEXT,
    start_date TEXT,
    assignees JSONB,           -- Array of strings
    subtasks JSONB,            -- (Optional: Can store subtasks as JSON OR use ref_id logic)
    ref_id TEXT,               -- Self-reference for Subtasks (1:n)
    epic_id TEXT,              -- Foreign Key to Epics (1:n)
    filter_id TEXT,            -- Foreign Key to Filters (1:n per user request)
    created_at BIGINT,
    order_index INTEGER
);

-- Epics Table
CREATE TABLE IF NOT EXISTS epics (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    color TEXT,
    status TEXT,
    start_date TEXT,
    due_date TEXT
);

-- Filters Table
CREATE TABLE IF NOT EXISTS filters (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    criteria JSONB             -- Stores the filter logic (search, categories, etc.)
);

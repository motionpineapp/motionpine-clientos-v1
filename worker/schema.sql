-- MotionPine ClientOS - D1 Database Schema
-- This schema creates all tables with proper relationships and indexes

-- ============================================================================
-- USERS TABLE (Authentication & Profiles)
-- ============================================================================
CREATE TABLE IF NOT EXISTS users (
    email TEXT PRIMARY KEY,  -- Email is the unique identifier (lowercase)
    id TEXT NOT NULL,        -- UUID for display purposes
    name TEXT NOT NULL,
    role TEXT NOT NULL CHECK(role IN ('admin', 'client')),
    company TEXT,
    avatar TEXT,
    password_hash TEXT NOT NULL,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);

-- ============================================================================
-- CLIENTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS clients (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    company TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'inactive',
    account_status TEXT NOT NULL CHECK(account_status IN ('pending', 'setup_initiated', 'active', 'expired')) DEFAULT 'pending',
    total_projects INTEGER DEFAULT 0,
    total_revenue REAL DEFAULT 0,
    joined_at TEXT NOT NULL,
    avatar TEXT,
    magic_token TEXT,
    token_expiry INTEGER,
    token_used_at INTEGER,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_clients_email ON clients(email);
CREATE INDEX IF NOT EXISTS idx_clients_status ON clients(status);
CREATE INDEX IF NOT EXISTS idx_clients_account_status ON clients(account_status);

-- ============================================================================
-- PROJECTS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS projects (
    id TEXT PRIMARY KEY,
    title TEXT NOT NULL,
    client_id TEXT NOT NULL,
    client_name TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('todo', 'in-progress', 'completed')) DEFAULT 'todo',
    created_at TEXT NOT NULL,
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_projects_client_id ON projects(client_id);
CREATE INDEX IF NOT EXISTS idx_projects_status ON projects(status);

-- ============================================================================
-- CHATS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS chats (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    title TEXT NOT NULL,
    last_message TEXT,
    last_message_ts INTEGER,
    unread_count INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chats_client_id ON chats(client_id);

-- ============================================================================
-- CHAT MESSAGES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS chat_messages (
    id TEXT PRIMARY KEY,
    chat_id TEXT NOT NULL,
    user_id TEXT NOT NULL,
    text TEXT NOT NULL,
    ts INTEGER NOT NULL,
    sender_name TEXT,
    sender_avatar TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (chat_id) REFERENCES chats(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_chat_messages_chat_id ON chat_messages(chat_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_ts ON chat_messages(ts);

-- ============================================================================
-- EXPENSES TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS expenses (
    id TEXT PRIMARY KEY,
    item TEXT NOT NULL,
    cost REAL NOT NULL,
    date TEXT NOT NULL,
    assigned_to TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (assigned_to) REFERENCES team_members(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_assigned_to ON expenses(assigned_to);

-- ============================================================================
-- SUBSCRIPTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS subscriptions (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    price REAL NOT NULL,
    billing_cycle TEXT NOT NULL CHECK(billing_cycle IN ('monthly', 'yearly')),
    next_billing_date TEXT NOT NULL,
    status TEXT NOT NULL CHECK(status IN ('active', 'inactive', 'cancelled')) DEFAULT 'active',
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_subscriptions_status ON subscriptions(status);

-- ============================================================================
-- TEAM MEMBERS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS team_members (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    role TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    status TEXT NOT NULL CHECK(status IN ('active', 'inactive')) DEFAULT 'inactive',
    joined_at TEXT NOT NULL,
    avatar TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_team_members_email ON team_members(email);
CREATE INDEX IF NOT EXISTS idx_team_members_status ON team_members(status);

-- ============================================================================
-- SERVICE TYPES TABLE (Pines Credit System)
-- ============================================================================
CREATE TABLE IF NOT EXISTS service_types (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    pine_cost INTEGER NOT NULL,
    category TEXT CHECK(category IN ('reels', 'ads', 'longform')),
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_service_types_category ON service_types(category);
CREATE INDEX IF NOT EXISTS idx_service_types_active ON service_types(is_active);

-- ============================================================================
-- PINE PACKAGES TABLE (Credit Purchase Options)
-- ============================================================================
CREATE TABLE IF NOT EXISTS pine_packages (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    pine_count INTEGER NOT NULL,
    price_per_pine REAL NOT NULL,
    total_price REAL NOT NULL,
    stripe_price_id TEXT,
    is_featured INTEGER DEFAULT 0,
    is_active INTEGER DEFAULT 1,
    sort_order INTEGER DEFAULT 0,
    created_at INTEGER DEFAULT (unixepoch()),
    updated_at INTEGER DEFAULT (unixepoch())
);

CREATE INDEX IF NOT EXISTS idx_pine_packages_active ON pine_packages(is_active);

-- ============================================================================
-- PINE TRANSACTIONS TABLE
-- ============================================================================
CREATE TABLE IF NOT EXISTS pine_transactions (
    id TEXT PRIMARY KEY,
    client_id TEXT NOT NULL,
    type TEXT NOT NULL CHECK(type IN ('usage', 'purchase', 'refund')),
    amount REAL NOT NULL,
    description TEXT NOT NULL,
    date TEXT NOT NULL,
    project_id TEXT,
    stripe_payment_id TEXT,
    notes TEXT,
    created_at INTEGER DEFAULT (unixepoch()),
    FOREIGN KEY (client_id) REFERENCES clients(id) ON DELETE CASCADE,
    FOREIGN KEY (project_id) REFERENCES projects(id) ON DELETE SET NULL
);

CREATE INDEX IF NOT EXISTS idx_pine_transactions_client_id ON pine_transactions(client_id);
CREATE INDEX IF NOT EXISTS idx_pine_transactions_date ON pine_transactions(date);

-- ============================================================================
-- SYSTEM SETTINGS TABLE (Singleton)
-- ============================================================================
CREATE TABLE IF NOT EXISTS system_settings (
    id INTEGER PRIMARY KEY CHECK (id = 1), -- Enforce singleton row
    company_name TEXT DEFAULT 'MotionPine',
    logo_url TEXT,
    favicon_url TEXT,
    meta_title TEXT DEFAULT 'MotionPine ClientOS',
    meta_description TEXT DEFAULT 'Client Management System',
    updated_at INTEGER DEFAULT (unixepoch())
);

-- Insert default settings if not exists
INSERT OR IGNORE INTO system_settings (id, company_name, meta_title, meta_description) 
VALUES (1, 'MotionPine', 'MotionPine ClientOS', 'Client Management System');

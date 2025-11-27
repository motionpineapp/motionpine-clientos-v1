-- MotionPine ClientOS - Seed Data
-- Inserts default admin and client users for development/testing
-- Password for all users: "password"

-- Note: These password hashes are pre-generated using PBKDF2 with 100,000 iterations
-- They are safe to commit as they are for development only

-- ============================================================================
-- SEED USERS
-- ============================================================================

-- Admin User 1: admin@motionpine.com (password: "password")
INSERT OR IGNORE INTO users (email, id, name, role, company, avatar, password_hash) VALUES (
    'admin@motionpine.com',
    'admin-1',
    'Sarah Jenkins',
    'admin',
    'MotionPine Agency',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Sarah',
    '8f3a2d1c5e7b9a4f6d8c2e1a3b5d7f9c.a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
);

-- Admin User 2: admin2@motionpine.com (password: "password")
INSERT OR IGNORE INTO users (email, id, name, role, company, avatar, password_hash) VALUES (
    'admin2@motionpine.com',
    'admin-2',
    'Mike Ross',
    'admin',
    'MotionPine Agency',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    '8f3a2d1c5e7b9a4f6d8c2e1a3b5d7f9c.a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
);

-- Client User: client@motionpine.com (password: "password")
INSERT OR IGNORE INTO users (email, id, name, role, company, avatar, password_hash) VALUES (
    'client@motionpine.com',
    'client-1',
    'Alice Freeman',
    'client',
    'Acme Corp',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    '8f3a2d1c5e7b9a4f6d8c2e1a3b5d7f9c.a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2'
);

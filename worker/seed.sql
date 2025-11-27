-- MotionPine ClientOS - Seed Data
-- Inserts default admin and client users for development/testing
-- Password for all users: "password"

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
    '0e0f08c53d181cab90efbb9ffdcccf56.4fa61ad1cc28af09bf55b09989bb93bbf832e6324c410339332e43337c097efa0'
);

-- Admin User 2: admin2@motionpine.com (password: "password")
INSERT OR IGNORE INTO users (email, id, name, role, company, avatar, password_hash) VALUES (
    'admin2@motionpine.com',
    'admin-2',
    'Mike Ross',
    'admin',
    'MotionPine Agency',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Mike',
    '0e0f08c53d181cab90efbb9ffdcccf56.4fa61ad1cc28af09bf55b09989bb93bbf832e6324c410339332e43337c097efa0'
);

-- Client User: client@motionpine.com (password: "password")
INSERT OR IGNORE INTO users (email, id, name, role, company, avatar, password_hash) VALUES (
    'client@motionpine.com',
    'client-1',
    'Alice Freeman',
    'client',
    'Acme Corp',
    'https://api.dicebear.com/7.x/avataaars/svg?seed=Alice',
    '0e0f08c53d181cab90efbb9ffdcccf56.4fa61ad1cc28af09bf55b09989bb93bbf832e6324c410339332e43337c097efa0'
);

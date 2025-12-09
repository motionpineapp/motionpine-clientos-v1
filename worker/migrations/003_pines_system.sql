-- ============================================================================
-- PINES SYSTEM MIGRATION - 003
-- Adds service types catalog and pine packages for credit-based services
-- ============================================================================

-- ============================================================================
-- SERVICE TYPES TABLE (Video Editing Services with Pine Costs)
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
-- SEED SERVICE TYPES
-- ============================================================================
INSERT OR IGNORE INTO service_types (id, name, description, pine_cost, category, sort_order) VALUES
('creative-caption', 'Creative Caption Reel', 'Includes creative captions + 2 slides of graphics or animation', 1, 'reels', 1),
('daily-vlog', 'Daily VLOG Reel', 'Quick turnaround vlog-style editing', 1, 'reels', 2),
('basic-caption-2x', '2 Basic Caption Reels', 'Two simple caption reels bundled', 1, 'reels', 3),
('motion-graphics', 'Motion Graphics Reel', 'Typography, collage style, or animated elements', 2, 'reels', 4),
('ugc-dtc-ad', 'UGC / DTC Ad', 'User-generated content style ad for ecommerce', 2, 'ads', 5),
('premium-reel', 'Premium Reel', 'Extra design flair, custom motion, advanced graphics, creative flow', 3, 'reels', 6),
('ai-powered-ad', 'AI-Powered Video Ad', 'AI-generated UGC, heavy motion graphics, scripting support, advanced storytelling', 4, 'ads', 7),
('podcast-60', 'Podcast Edit (60 min)', 'Multi-cam or single-cam, audio cleanup, pacing, graphic overlays', 6, 'longform', 8),
('vsl', 'Video Sales Letter', '60-180 sec VSL with proprietary formulas, revisions, conversion-focused storytelling', 10, 'longform', 9),
('longform-video', 'Long-Form Video (10-12 min)', 'Brand storytelling, thought leadership, case studies with motion graphics', 16, 'longform', 10);

-- ============================================================================
-- SEED PINE PACKAGES
-- ============================================================================
INSERT OR IGNORE INTO pine_packages (id, name, pine_count, price_per_pine, total_price, is_featured, sort_order) VALUES
('starter', 'Starter', 10, 30.00, 300.00, 0, 1),
('popular', 'Popular', 100, 27.00, 2700.00, 1, 2),
('best-value', 'Best Value', 180, 25.00, 4500.00, 0, 3);

-- ============================================================================
-- ALTER EXISTING TABLES
-- ============================================================================

-- Add pines-related columns to projects table
-- Note: SQLite doesn't support ADD COLUMN IF NOT EXISTS, so we use a transaction
-- These should be run manually if they fail due to column already existing

-- For projects table:
-- ALTER TABLE projects ADD COLUMN service_type_id TEXT REFERENCES service_types(id);
-- ALTER TABLE projects ADD COLUMN pines_charged INTEGER DEFAULT 0;
-- ALTER TABLE projects ADD COLUMN brief TEXT;
-- ALTER TABLE projects ADD COLUMN reference_links TEXT;

-- For pine_transactions table:
-- ALTER TABLE pine_transactions ADD COLUMN project_id TEXT REFERENCES projects(id);
-- ALTER TABLE pine_transactions ADD COLUMN stripe_payment_id TEXT;
-- ALTER TABLE pine_transactions ADD COLUMN notes TEXT;

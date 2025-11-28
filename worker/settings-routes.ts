import { Hono } from "hono";
import { ok, bad, isStr } from './core-utils';

interface Env {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
}

export interface SystemSettings {
    company_name: string;
    logo_url: string | null;
    favicon_url: string | null;
    meta_title: string;
    meta_description: string;
}

export function settingsRoutes(app: Hono<{ Bindings: Env }>) {

    // GET /api/settings - Public endpoint
    app.get('/api/settings', async (c) => {
        try {
            const settings = await c.env.DB.prepare('SELECT * FROM system_settings WHERE id = 1').first<SystemSettings>();

            if (!settings) {
                // Return defaults if DB is empty (fallback)
                return ok(c, {
                    company_name: 'MotionPine',
                    logo_url: null,
                    favicon_url: null,
                    meta_title: 'MotionPine ClientOS',
                    meta_description: 'Client Management System'
                });
            }

            return ok(c, settings);
        } catch (error) {
            console.error('Failed to fetch settings:', error);
            // Fallback to defaults on error to prevent app crash
            return ok(c, {
                company_name: 'MotionPine',
                logo_url: null,
                favicon_url: null,
                meta_title: 'MotionPine ClientOS',
                meta_description: 'Client Management System'
            });
        }
    });

    // PUT /api/settings - Admin only (TODO: Add auth middleware check if not global)
    app.put('/api/settings', async (c) => {
        try {
            const data = await c.req.json<Partial<SystemSettings>>();

            // Validate inputs (basic)
            if (data.company_name && !isStr(data.company_name)) return bad(c, 'Invalid company name');

            // Fetch current settings to check for old files
            const currentSettings = await c.env.DB.prepare('SELECT * FROM system_settings WHERE id = 1').first<SystemSettings>();

            if (currentSettings) {
                const { deleteFileFromUrl } = await import('./file-utils');

                // Check Logo
                if (data.logo_url !== undefined && data.logo_url !== currentSettings.logo_url) {
                    if (currentSettings.logo_url) {
                        await deleteFileFromUrl(currentSettings.logo_url, c.env.R2_BUCKET);
                    }
                }

                // Check Favicon
                if (data.favicon_url !== undefined && data.favicon_url !== currentSettings.favicon_url) {
                    if (currentSettings.favicon_url) {
                        await deleteFileFromUrl(currentSettings.favicon_url, c.env.R2_BUCKET);
                    }
                }
            }

            await c.env.DB.prepare(`
                INSERT INTO system_settings (id, company_name, logo_url, favicon_url, meta_title, meta_description, updated_at)
                VALUES (1, ?, ?, ?, ?, ?, unixepoch())
                ON CONFLICT(id) DO UPDATE SET
                    company_name = COALESCE(?1, company_name),
                    logo_url = COALESCE(?2, logo_url),
                    favicon_url = COALESCE(?3, favicon_url),
                    meta_title = COALESCE(?4, meta_title),
                    meta_description = COALESCE(?5, meta_description),
                    updated_at = unixepoch()
            `).bind(
                data.company_name || null,
                data.logo_url === undefined ? null : data.logo_url, // Handle explicit null vs undefined
                data.favicon_url === undefined ? null : data.favicon_url,
                data.meta_title || null,
                data.meta_description || null
            ).run();

            // Fetch updated settings to return
            const updated = await c.env.DB.prepare('SELECT * FROM system_settings WHERE id = 1').first();
            return ok(c, updated);

        } catch (error) {
            console.error('Failed to update settings:', error);
            return bad(c, 'Failed to update settings');
        }
    });
}

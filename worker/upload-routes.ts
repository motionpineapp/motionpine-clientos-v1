import { Hono } from 'hono';
import { v4 as uuidv4 } from 'uuid';

interface Env {
    DB: D1Database;
    R2_BUCKET: R2Bucket;
}

export function uploadRoutes(app: Hono<{ Bindings: Env }>) {

    // Upload file endpoint
    app.post('/api/upload', async (c) => {
        try {
            const formData = await c.req.formData();
            const file = formData.get('file') as File;

            if (!file) {
                return c.json({ success: false, error: 'No file provided' }, 400);
            }

            // Validate file size (max 10MB)
            const maxSize = 10 * 1024 * 1024; // 10MB
            if (file.size > maxSize) {
                return c.json({ success: false, error: 'File too large (max 10MB)' }, 400);
            }

            // Validate file type
            const allowedTypes = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp',
                'application/pdf',
                'application/msword',
                'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
                'application/vnd.ms-excel',
                'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
            ];

            if (!allowedTypes.includes(file.type)) {
                return c.json({
                    success: false,
                    error: 'Invalid file type. Allowed: images, PDF, Word, Excel'
                }, 400);
            }

            // Generate unique filename
            const ext = file.name.split('.').pop() || 'bin';
            const filename = `${uuidv4()}.${ext}`;
            const key = `uploads/${filename}`;

            // Upload to R2
            await c.env.R2_BUCKET.put(key, file.stream(), {
                httpMetadata: {
                    contentType: file.type,
                },
                customMetadata: {
                    originalName: file.name,
                    uploadedAt: new Date().toISOString(),
                    size: file.size.toString(),
                },
            });

            // Construct public URL (you'll need to replace with your actual R2 public URL)
            // For now, we'll use the internal path
            const url = `/api/files/${key}`;

            return c.json({
                success: true,
                data: {
                    url,
                    key,
                    filename,
                    originalName: file.name,
                    size: file.size,
                    type: file.type,
                },
            });
        } catch (error) {
            console.error('Upload error:', error);
            return c.json({ success: false, error: 'Upload failed' }, 500);
        }
    });

    // Get/download file
    app.get('/api/files/:key{.+}', async (c) => {
        try {
            const key = c.req.param('key');

            const object = await c.env.R2_BUCKET.get(key);

            if (!object) {
                return c.json({ success: false, error: 'File not found' }, 404);
            }

            const headers = new Headers();
            object.writeHttpMetadata(headers);
            headers.set('etag', object.httpEtag);
            headers.set('Cache-Control', 'public, max-age=31536000, immutable');

            return new Response(object.body, { headers });
        } catch (error) {
            console.error('File retrieval error:', error);
            return c.json({ success: false, error: 'Failed to retrieve file' }, 500);
        }
    });

    // Delete file
    app.delete('/api/files/:key{.+}', async (c) => {
        try {
            const key = c.req.param('key');

            await c.env.R2_BUCKET.delete(key);

            return c.json({ success: true, message: 'File deleted successfully' });
        } catch (error) {
            console.error('File deletion error:', error);
            return c.json({ success: false, error: 'Failed to delete file' }, 500);
        }
    });

    // List uploaded files (admin only - add auth middleware later)
    app.get('/api/files', async (c) => {
        try {
            const prefix = c.req.query('prefix') || 'uploads/';
            const limit = parseInt(c.req.query('limit') || '100');

            const listed = await c.env.R2_BUCKET.list({
                prefix,
                limit: Math.min(limit, 1000)
            });

            const files = listed.objects.map(obj => ({
                key: obj.key,
                size: obj.size,
                uploaded: obj.uploaded,
                customMetadata: obj.customMetadata,
            }));

            return c.json({
                success: true,
                data: {
                    files,
                    truncated: listed.truncated,
                    cursor: listed.cursor
                }
            });
        } catch (error) {
            console.error('File listing error:', error);
            return c.json({ success: false, error: 'Failed to list files' }, 500);
        }
    });
}

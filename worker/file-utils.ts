
export async function deleteFileFromUrl(url: string | null, bucket: R2Bucket) {
    if (!url) return;
    try {
        // Extract key from URL
        // URL format: /api/files/uploads/filename.ext
        let key = url;
        if (url.includes('/api/files/')) {
            key = url.split('/api/files/')[1];
        }

        if (key) {
            await bucket.delete(key);
            console.log(`Deleted file: ${key}`);
        }
    } catch (error) {
        console.error('Failed to delete file:', error);
    }
}

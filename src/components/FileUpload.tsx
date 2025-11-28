import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { Loader2, Upload, X, File } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FileUploadProps {
    onUploadComplete?: (url: string, fileData: UploadedFile) => void;
    accept?: string;
    maxSize?: number; // in MB
    className?: string;
    showPreview?: boolean;
}

interface UploadedFile {
    url: string;
    key: string;
    filename: string;
    originalName: string;
    size: number;
    type: string;
}

export function FileUpload({
    onUploadComplete,
    accept = 'image/*,.pdf,.doc,.docx,.xls,.xlsx',
    maxSize = 10,
    className,
    showPreview = true
}: FileUploadProps) {
    const [uploading, setUploading] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);
    const [uploadedFile, setUploadedFile] = useState<UploadedFile | null>(null);

    const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate size
        if (file.size > maxSize * 1024 * 1024) {
            toast.error(`File too large (max ${maxSize}MB)`);
            return;
        }

        // Show preview for images
        if (showPreview && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => setPreview(e.target?.result as string);
            reader.readAsDataURL(file);
        }

        // Upload
        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);

            const res = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Upload failed');
            }

            const response = await res.json();
            const fileData = response.data as UploadedFile;

            setUploadedFile(fileData);
            toast.success('File uploaded successfully!');
            onUploadComplete?.(fileData.url, fileData);
        } catch (error: any) {
            toast.error(error.message || 'Upload failed');
            setPreview(null);
        } finally {
            setUploading(false);
        }
    };

    const clearPreview = () => {
        setPreview(null);
        setUploadedFile(null);
    };

    const formatFileSize = (bytes: number): string => {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    };

    return (
        <div className={cn('space-y-4', className)}>
            <div className="flex items-center gap-4">
                <div className="relative flex-1">
                    <Input
                        type="file"
                        accept={accept}
                        onChange={handleFileChange}
                        disabled={uploading}
                        className="cursor-pointer"
                    />
                    {uploading && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2">
                            <Loader2 className="h-5 w-5 animate-spin text-primary" />
                        </div>
                    )}
                </div>
            </div>

            {showPreview && preview && (
                <div className="relative inline-block">
                    <img
                        src={preview}
                        alt="Preview"
                        className="max-w-xs max-h-64 rounded-lg border border-gray-200 shadow-sm"
                    />
                    <Button
                        size="icon"
                        variant="destructive"
                        className="absolute top-2 right-2 h-8 w-8"
                        onClick={clearPreview}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}

            {uploadedFile && !preview && (
                <div className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg bg-gray-50">
                    <File className="h-8 w-8 text-gray-400" />
                    <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                            {uploadedFile.originalName}
                        </p>
                        <p className="text-xs text-gray-500">
                            {formatFileSize(uploadedFile.size)}
                        </p>
                    </div>
                    <Button
                        size="icon"
                        variant="ghost"
                        className="h-8 w-8"
                        onClick={clearPreview}
                    >
                        <X className="h-4 w-4" />
                    </Button>
                </div>
            )}
        </div>
    );
}

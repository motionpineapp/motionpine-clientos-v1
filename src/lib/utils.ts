import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"


export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function getFileUrl(path?: string) {
  if (!path) return undefined;
  if (path.startsWith('http')) return path;

  // If it's a relative API path, prepend the API URL
  if (path.startsWith('/api/')) {
    const baseUrl = import.meta.env.VITE_API_URL || '';
    return `${baseUrl}${path}`;
  }

  return path;
}

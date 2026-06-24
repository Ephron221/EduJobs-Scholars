// Use the same API URL as the rest of the app
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5002/api';
// Derive the origin (e.g., https://your-backend.vercel.app) by removing '/api'
const API_ORIGIN = API_URL.replace(/\/api\/?$/, '');

export const getAssetUrl = (url?: string): string | undefined => {
  if (!url) return undefined;

  // Handle cases where the backend might have stored absolute localhost URLs in the database
  let cleanUrl = url;
  if (url.includes('localhost:5002')) {
    cleanUrl = url.replace(/https?:\/\/localhost:5002/g, '');
  }

  // If it's now a relative path (starts with /uploads or similar)
  if (!/^(https?:)?\/\//i.test(cleanUrl) && !cleanUrl.startsWith('blob:') && !cleanUrl.startsWith('data:')) {
    const normalized = cleanUrl.replace(/\\/g, '/');
    const uploadsIndex = normalized.indexOf('/uploads/');
    
    if (uploadsIndex >= 0) {
      return `${API_ORIGIN}${normalized.slice(uploadsIndex)}`;
    }
    return `${API_ORIGIN}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
  }

  // If it's already a full external URL (like Cloudinary or S3), return it as is
  return cleanUrl;
};

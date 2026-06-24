const API_ORIGIN = 'http://localhost:5002';

export const getAssetUrl = (url?: string): string | undefined => {
  if (!url) return undefined;
  if (/^(https?:)?\/\//i.test(url) || url.startsWith('blob:') || url.startsWith('data:')) {
    return url;
  }
  const normalized = url.replace(/\\/g, '/');
  const uploadsIndex = normalized.indexOf('/uploads/');
  if (uploadsIndex >= 0) {
    return `${API_ORIGIN}${normalized.slice(uploadsIndex)}`;
  }
  return `${API_ORIGIN}${normalized.startsWith('/') ? normalized : `/${normalized}`}`;
};

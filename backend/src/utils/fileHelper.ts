/**
 * Utility to get the file URL from multer file object
 * Works with both local storage and Cloudinary storage
 */
export const getFileUrl = (file: Express.Multer.File | undefined, isPdf: boolean = false): string | undefined => {
  if (!file) return undefined;

  const cloudinaryFile = file as any;

  // 1. Check for Cloudinary-specific properties FIRST
  // Cloudinary storage engines usually put the URL in secure_url or path
  if (cloudinaryFile.secure_url) return cloudinaryFile.secure_url;
  if (cloudinaryFile.url) return cloudinaryFile.url;
  
  // 2. If path is already a full URL (common in newer multer-storage-cloudinary versions)
  if (cloudinaryFile.path && /^https?:\/\//i.test(cloudinaryFile.path)) {
    return cloudinaryFile.path;
  }

  // 3. Fallback to local storage path (Development only)
  if (file.filename) {
    const destination = (file as any).destination || '';
    const folder = isPdf || destination.replace(/\\/g, '/').endsWith('/documents') ? 'documents' : 'images';
    return `/uploads/${folder}/${file.filename}`;
  }

  return undefined;
};

/**
 * Utility to get file URLs from multiple multer file objects
 */
export const getFileUrls = (files: Express.Multer.File[] | undefined): { file: string; isPdf: boolean }[] => {
  if (!files || !Array.isArray(files)) return [];

  return files.map((file) => {
    const isPdf = file.mimetype === 'application/pdf' || file.filename?.endsWith('.pdf') || file.originalname?.endsWith('.pdf');
    const url = getFileUrl(file, isPdf);
    return { file: url || '', isPdf };
  });
};

/**
 * Utility to get the file URL from multer file object
 * Works with both local storage and Cloudinary storage
 */
export const getFileUrl = (file: Express.Multer.File | undefined, isPdf: boolean = false): string | undefined => {
  if (!file) return undefined;

  // Cloudinary storage provides 'path' property with full URL
  if ((file as any).path) {
    return (file as any).path;
  }

  // Local storage fallback (for development)
  if (file.filename) {
    const folder = isPdf ? 'documents' : 'images';
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
    const isPdf = file.mimetype === 'application/pdf' || file.filename?.endsWith('.pdf');
    const url = getFileUrl(file, isPdf);
    return { file: url || '', isPdf };
  });
};

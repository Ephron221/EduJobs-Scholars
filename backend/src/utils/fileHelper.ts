/**
 * Utility to get the file URL from multer file object
 * Works with both local storage and Cloudinary storage
 */
export const getFileUrl = (file: Express.Multer.File | undefined, isPdf: boolean = false): string | undefined => {
  if (!file) return undefined;

  // Cloudinary storage can expose secure_url/url/path depending on adapter version.
  const cloudinaryFile = file as Express.Multer.File & {
    secure_url?: string;
    url?: string;
    path?: string;
  };
  // Local storage fallback (for development)
  if (file.filename) {
    const destination = (file as Express.Multer.File & { destination?: string }).destination || '';
    const folder = isPdf || destination.replace(/\\/g, '/').endsWith('/documents') ? 'documents' : 'images';
    return `/uploads/${folder}/${file.filename}`;
  }

  if (cloudinaryFile.secure_url) return cloudinaryFile.secure_url;
  if (cloudinaryFile.url) return cloudinaryFile.url;
  if (cloudinaryFile.path && /^https?:\/\//i.test(cloudinaryFile.path)) {
    return cloudinaryFile.path;
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

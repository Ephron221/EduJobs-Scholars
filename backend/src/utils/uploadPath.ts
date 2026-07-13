import cloudinary from '../config/cloudinary';

const USE_CLOUDINARY = process.env.NODE_ENV === 'production' || process.env.CLOUDINARY_CLOUD_NAME;

export const deleteUploadedFile = async (fileUrl: string): Promise<void> => {
  try {
    if (!fileUrl) return;

    // Local file — nothing to delete via Cloudinary
    if (!fileUrl.startsWith('http')) return;

    if (!USE_CLOUDINARY) return;

    // Cloudinary URL format:
    // https://res.cloudinary.com/{cloud}/image/upload/v123/{folder}/{public_id}.ext
    // https://res.cloudinary.com/{cloud}/raw/upload/{folder}/{public_id}.pdf
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    if (uploadIndex === -1) return;

    // Skip optional version segment (e.g. "v1234567890")
    let sliceFrom = uploadIndex + 1;
    if (/^v\d+$/.test(urlParts[sliceFrom])) sliceFrom++;

    const isPdf = fileUrl.toLowerCase().endsWith('.pdf');
    const resourceType = isPdf ? 'raw' : 'image';

    // For raw resources the public_id includes the extension; for images it does not
    const publicIdWithExt = urlParts.slice(sliceFrom).join('/');
    const publicId = isPdf
      ? publicIdWithExt                                                          // keep .pdf
      : (publicIdWithExt.lastIndexOf('.') > 0
          ? publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.'))
          : publicIdWithExt);                                                    // strip extension

    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
  }
};


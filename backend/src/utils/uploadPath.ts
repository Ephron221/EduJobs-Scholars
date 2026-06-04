import cloudinary from '../config/cloudinary';

const USE_CLOUDINARY = process.env.NODE_ENV === 'production' || process.env.CLOUDINARY_CLOUD_NAME;

export const deleteUploadedFile = async (fileUrl: string): Promise<void> => {
  try {
    if (!USE_CLOUDINARY || !fileUrl) return;

    // Extract public_id from Cloudinary URL
    // URL format: https://res.cloudinary.com/{cloud_name}/image/upload/{public_id}
    const urlParts = fileUrl.split('/');
    const uploadIndex = urlParts.indexOf('upload');
    
    if (uploadIndex === -1) return;

    // Get everything after 'upload/' and remove extension
    const publicIdWithExt = urlParts.slice(uploadIndex + 1).join('/');
    const publicId = publicIdWithExt.substring(0, publicIdWithExt.lastIndexOf('.')) || publicIdWithExt;

    // Determine resource type (raw for PDFs, image for others)
    const isPdf = fileUrl.toLowerCase().includes('.pdf');
    const resourceType = isPdf ? 'raw' : 'image';

    // Delete from Cloudinary
    await cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
  } catch (error) {
    console.error('Error deleting file from Cloudinary:', error);
    // Don't throw - silently fail for cleanup operations
  }
};


import path from 'path';
import fs from 'fs';

const uploadsRoot = path.resolve(process.cwd(), 'uploads');

export const deleteUploadedFile = (fileUrl: string): void => {
  try {
    const urlPath = new URL(fileUrl).pathname.replace(/^\/+/, '');
    const filePath = path.resolve(process.cwd(), urlPath);

    if (!filePath.startsWith(`${uploadsRoot}${path.sep}`)) return;
    if (fs.existsSync(filePath)) fs.unlinkSync(filePath);
  } catch {
    // Ignore malformed URLs and missing local files.
  }
};

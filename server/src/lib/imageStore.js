import multer from 'multer';
import mongoose from 'mongoose';
import Upload from '../models/Upload.js';

// Vercel serverless functions cap request/response bodies at ~4.5 MB,
// so keep uploaded images comfortably under that ceiling.
const MAX_FILE_SIZE = 4 * 1024 * 1024;

const allowedMimeTypes = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
]);

// Images are kept in MongoDB (see models/Upload.js), so multer only needs
// to buffer the file in memory — it never touches the disk.
export const uploadImage = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: MAX_FILE_SIZE },
  fileFilter: (_req, file, callback) => {
    if (allowedMimeTypes.has(file.mimetype)) return callback(null, true);
    callback(new Error('Only JPG, PNG, WEBP, GIF, or AVIF images can be uploaded.'));
  },
});

const UPLOAD_PREFIX = '/api/uploads/';

// True only for URLs this app owns — e.g. /api/uploads/<objectId>.
// External URLs (YouTube thumbnails, pasted links) return false.
export function isManagedUpload(url = '') {
  if (typeof url !== 'string' || !url.startsWith(UPLOAD_PREFIX)) return false;
  return mongoose.Types.ObjectId.isValid(url.slice(UPLOAD_PREFIX.length));
}

// Persists a multer file in MongoDB and returns the URL to serve it from.
export async function saveUpload(file) {
  if (!file || !file.buffer) return '';
  const doc = await Upload.create({
    data: file.buffer,
    contentType: file.mimetype || 'application/octet-stream',
    size: file.size || file.buffer.length,
  });
  return `${UPLOAD_PREFIX}${doc._id}`;
}

// Removes a stored image given its serve URL. Safely ignores external URLs.
export async function deleteUpload(url) {
  if (!isManagedUpload(url)) return;
  const id = url.slice(UPLOAD_PREFIX.length);
  await Upload.findByIdAndDelete(id).catch(() => {});
}

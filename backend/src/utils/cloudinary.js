/**
 * cloudinary.js — Cloudinary v2 SDK configuration + upload helpers
 */
import { v2 as cloudinary } from 'cloudinary';
import streamifier from 'streamifier';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key:    process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure:     true,
});

/**
 * Upload a buffer to Cloudinary and return the result.
 * @param {Buffer} buffer  - file buffer from multer
 * @param {string} folder  - cloudinary folder path e.g. 'sewingcircle/events'
 * @param {object} opts    - extra cloudinary upload options
 */
export function uploadBuffer(buffer, folder, opts = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder, ...opts },
      (err, result) => {
        if (err) return reject(err);
        resolve(result);
      }
    );
    streamifier.createReadStream(buffer).pipe(stream);
  });
}

/**
 * Delete a resource from Cloudinary by public_id.
 */
export async function deleteResource(publicId, resourceType = 'image') {
  return cloudinary.uploader.destroy(publicId, { resource_type: resourceType });
}

export default cloudinary;

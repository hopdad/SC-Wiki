import {getSupabase} from './supabase';

const BUCKET = 'wiki-uploads';

const IMAGE_TYPES = ['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml'];
const DOC_TYPES = [
  'application/pdf',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'text/csv',
];
const ALLOWED_TYPES = [...IMAGE_TYPES, ...DOC_TYPES];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

/**
 * Validate a file before upload.
 * @returns {string|null} Error message, or null if valid.
 */
export function validateFile(file) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return `File type "${file.type || 'unknown'}" is not supported. Allowed: images (PNG, JPEG, GIF, WebP, SVG) and documents (PDF, Word, Excel, CSV).`;
  }
  if (file.size > MAX_FILE_SIZE) {
    return `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Maximum size is 10 MB.`;
  }
  return null;
}

/**
 * Upload a file to Supabase Storage.
 * Files are stored under: uploads/{userId}/{timestamp}-{filename}
 * @returns {Promise<{path: string, publicUrl: string, isImage: boolean}>}
 */
export async function uploadFile(file, userId) {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase is not available');

  const validationError = validateFile(file);
  if (validationError) throw new Error(validationError);

  const safeName = file.name.replace(/[^a-zA-Z0-9._-]/g, '_');
  const filePath = `uploads/${userId}/${Date.now()}-${safeName}`;

  const {error} = await supabase.storage
    .from(BUCKET)
    .upload(filePath, file, {
      cacheControl: '3600',
      upsert: false,
    });

  if (error) throw new Error(`Upload failed: ${error.message}`);

  const {data: urlData} = supabase.storage
    .from(BUCKET)
    .getPublicUrl(filePath);

  return {
    path: filePath,
    publicUrl: urlData.publicUrl,
    isImage: IMAGE_TYPES.includes(file.type),
  };
}

/**
 * Generate a markdown snippet for an uploaded file.
 */
export function toMarkdown({publicUrl, isImage}, fileName) {
  if (isImage) {
    return `![${fileName}](${publicUrl})`;
  }
  return `[${fileName}](${publicUrl})`;
}

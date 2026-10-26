
const fs = require('fs');
const path = require('path');

// Use the configured storage location if provided.
// On Vercel, use /tmp because the deployed application directory is not writable.
// Locally, use the project's storage directory.
const STORAGE_ROOT = process.env.STORAGE_ROOT
  ? path.resolve(process.env.STORAGE_ROOT)
  : process.env.VERCEL
    ? '/tmp/storage'
    : path.join(__dirname, '..', '..', 'storage');

// Keep original videos and photos in separate directories.
// This makes file management easier and allows each type to be migrated
// independently to an object-storage service such as S3.
const UPLOAD_DIR = path.join(STORAGE_ROOT, 'uploads');
const PHOTO_DIR = path.join(STORAGE_ROOT, 'photos');

// Store video posters and photo thumbnails together.
// These derived images are served through posters.routes.js using the
// same access rules as their corresponding original assets.
const POSTER_DIR = path.join(STORAGE_ROOT, 'posters');

// The React client builds to client/dist.
// If the production build is unavailable, fall back to the legacy public/
// directory so a fresh checkout can still serve the existing frontend.
const CLIENT_DIST = path.join(__dirname, '..', '..', 'client', 'dist');
const LEGACY_PUBLIC = path.join(__dirname, '..', '..', 'public');

const PUBLIC_DIR = process.env.PUBLIC_DIR
  ? path.resolve(process.env.PUBLIC_DIR)
  : fs.existsSync(path.join(CLIENT_DIST, 'index.html'))
    ? CLIENT_DIST
    : LEGACY_PUBLIC;

// Create all storage directories before other modules use them.
// Multer may resolve its upload destination when modules are loaded,
// so these directories must exist before the application handles requests.
function ensureDirs() {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
  fs.mkdirSync(PHOTO_DIR, { recursive: true });
  fs.mkdirSync(POSTER_DIR, { recursive: true });
}

// Run directory initialization when this module is loaded.
ensureDirs();

/**
 * Return the directory containing the original file for an asset.
 * Photos use PHOTO_DIR; other asset types use UPLOAD_DIR.
 */
function sourceDirFor(kind) {
  return kind === 'photo' ? PHOTO_DIR : UPLOAD_DIR;
}

/**
 * Construct the full filesystem path for an asset using its storage key.
 * Centralizing this logic makes future storage changes easier.
 */
function sourcePathFor(asset) {
  return path.join(sourceDirFor(asset.kind), asset.storageKey);
}

// Export the paths and helper functions for use by the rest of the application.
module.exports = {
  STORAGE_ROOT,
  UPLOAD_DIR,
  PHOTO_DIR,
  POSTER_DIR,
  PUBLIC_DIR,
  ensureDirs,
  sourceDirFor,
  sourcePathFor,
};

import { randomUUID } from 'node:crypto';
import { existsSync, mkdirSync } from 'node:fs';
import { extname, join } from 'node:path';
import { BadRequestException } from '@nestjs/common';
import { diskStorage } from 'multer';

/** Absolute directory where uploaded images are written. */
export const UPLOAD_DIR = join(process.cwd(), 'apps/api/uploads');

/**
 * Public route prefix the files are served under. Kept under `/api` so the
 * admin app's Vite dev proxy (`/api` → :3000) forwards image requests too.
 */
export const UPLOAD_ROUTE_PREFIX = '/api/uploads';

const MAX_BYTES = 5 * 1024 * 1024; // 5 MB
const ALLOWED_MIME = /^image\/(jpeg|png|webp|gif|avif)$/;

// multer's diskStorage does NOT create the destination — ensure it exists once at load.
if (!existsSync(UPLOAD_DIR)) {
  mkdirSync(UPLOAD_DIR, { recursive: true });
}

type MulterFile = { originalname: string; mimetype: string };
type FileNameCb = (error: Error | null, filename: string) => void;
type FileFilterCb = (error: Error | null, acceptFile: boolean) => void;

/** Inline multer config for the food-image upload route (no global MulterModule needed). */
export const imageMulterOptions = {
  storage: diskStorage({
    destination: UPLOAD_DIR,
    filename: (_req: unknown, file: MulterFile, cb: FileNameCb) =>
      cb(null, `${randomUUID()}${extname(file.originalname).toLowerCase()}`),
  }),
  limits: { fileSize: MAX_BYTES },
  fileFilter: (_req: unknown, file: MulterFile, cb: FileFilterCb) => {
    if (ALLOWED_MIME.test(file.mimetype)) cb(null, true);
    else
      cb(
        new BadRequestException(
          'Only JPEG, PNG, WebP, GIF or AVIF images are allowed.',
        ),
        false,
      );
  },
};

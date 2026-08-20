import { DeleteObjectCommand, PutObjectCommand } from '@aws-sdk/client-s3';
import { randomUUID } from 'node:crypto';
import { env } from '@/config/env';
import { r2Client } from '@/config/r2';
import { HttpError } from '@/utils/httpError';

const MIME_TO_EXT: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/avif': 'avif',
};

export const uploadService = {
  async uploadImage(file: Express.Multer.File, folder = 'menu'): Promise<{ url: string; key: string }> {
    const ext = MIME_TO_EXT[file.mimetype];
    if (!ext) {
      throw new HttpError(400, `Unsupported image type: ${file.mimetype}`);
    }

    const key = `${folder}/${randomUUID()}.${ext}`;

    await r2Client.send(
      new PutObjectCommand({
        Bucket: env.r2.bucket,
        Key: key,
        Body: file.buffer,
        ContentType: file.mimetype,
        CacheControl: 'public, max-age=31536000, immutable',
      }),
    );

    return {
      key,
      url: `${env.r2.publicUrl}/${key}`,
    };
  },

  async deleteImage(key: string): Promise<void> {
    await r2Client.send(
      new DeleteObjectCommand({
        Bucket: env.r2.bucket,
        Key: key,
      }),
    );
  },

  keyFromUrl(url?: string): string | undefined {
    if (!url) return undefined;
    const prefix = env.r2.publicUrl + '/';
    return url.startsWith(prefix) ? url.slice(prefix.length) : undefined;
  },
};

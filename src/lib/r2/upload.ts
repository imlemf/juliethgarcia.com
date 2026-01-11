import { PutObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client } from './client';
import { createId } from '@paralleldrive/cuid2';

/**
 * Generate a presigned URL for uploading a file to R2
 * @param fileName - Original file name
 * @param contentType - MIME type of the file
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Object with presigned URL and file key
 */
export async function generatePresignedUploadUrl(
  fileName: string,
  contentType: string,
  expiresIn: number = 3600
): Promise<{ uploadUrl: string; fileKey: string }> {
  const client = getR2Client();
  const bucketName = process.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME environment variable is not set');
  }

  // Generate unique file key to avoid collisions
  const fileExtension = fileName.split('.').pop();
  const fileKey = `products/${createId()}.${fileExtension}`;

  const command = new PutObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
    ContentType: contentType,
  });

  const uploadUrl = await getSignedUrl(client, command, { expiresIn });

  return {
    uploadUrl,
    fileKey,
  };
}

/**
 * Validate file type for uploads
 * @param contentType - MIME type to validate
 * @returns boolean
 */
export function isValidFileType(contentType: string): boolean {
  const allowedTypes = [
    // Documents
    'application/pdf',
    'application/zip',
    'application/x-zip-compressed',
    // Images
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    // Videos
    'video/mp4',
    'video/quicktime',
    // Audio
    'audio/mpeg',
    'audio/wav',
    // Archives
    'application/x-rar-compressed',
    'application/x-7z-compressed',
    // Office
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ];

  return allowedTypes.includes(contentType);
}

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';
import { getR2Client } from './client';

/**
 * Generate a presigned URL for downloading a file from R2
 * @param fileKey - The S3/R2 object key
 * @param expiresIn - URL expiration time in seconds (default: 3600 = 1 hour)
 * @returns Presigned URL string
 */
type R2Runtime = { env: { R2_ACCOUNT_ID?: string; R2_ACCESS_KEY_ID?: string; R2_SECRET_ACCESS_KEY?: string; R2_BUCKET_NAME?: string } };

export async function generatePresignedDownloadUrl(
  fileKey: string,
  runtime: R2Runtime,
  expiresIn: number = 3600
): Promise<string> {
  const client = getR2Client(runtime);
  const bucketName = runtime.env.R2_BUCKET_NAME;

  if (!bucketName) {
    throw new Error('R2_BUCKET_NAME environment variable is not set');
  }

  const command = new GetObjectCommand({
    Bucket: bucketName,
    Key: fileKey,
  });

  const presignedUrl = await getSignedUrl(client, command, { expiresIn });
  return presignedUrl;
}

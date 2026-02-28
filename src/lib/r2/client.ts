import { S3Client } from '@aws-sdk/client-s3';

export function getR2Client(runtime: { env: { R2_ACCOUNT_ID?: string; R2_ACCESS_KEY_ID?: string; R2_SECRET_ACCESS_KEY?: string } }): S3Client {
  const accountId = runtime.env.R2_ACCOUNT_ID;
  const accessKeyId = runtime.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = runtime.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error('R2 credentials not configured. Please set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, and R2_SECRET_ACCESS_KEY environment variables.');
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId,
      secretAccessKey,
    },
  });
}

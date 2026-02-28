import { Resend } from 'resend';

export function getResend(runtime: { env: { RESEND_API_KEY?: string } }): Resend {
  const apiKey = runtime.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error('RESEND_API_KEY is not configured');
  }
  return new Resend(apiKey);
}

export function getEmailFrom(runtime: { env: { EMAIL_FROM?: string } }): string {
  return runtime.env.EMAIL_FROM || 'noreply@yourdomain.com';
}

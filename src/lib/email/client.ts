import { Resend } from 'resend';

let resendInstance: Resend | null = null;

export function getResend(): Resend {
  if (!resendInstance) {
    if (!import.meta.env.RESEND_API_KEY) {
      throw new Error('RESEND_API_KEY is not configured');
    }
    resendInstance = new Resend(import.meta.env.RESEND_API_KEY);
  }
  return resendInstance;
}

export const EMAIL_FROM = import.meta.env.EMAIL_FROM || 'noreply@yourdomain.com';

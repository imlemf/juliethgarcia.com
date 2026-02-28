import { render } from '@react-email/render';
import { getResend, EMAIL_FROM } from './client';
import JeylaPurchaseConfirmationEmail from '@/templates/jeyla/emails/purchase-confirmation';

interface SendPurchaseEmailParams {
  to: string;
  siteName?: string;
  productName: string;
  productDescription?: string;
  purchaseCode: string;
  downloadToken: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  maxDownloads: number;
  isRegistered?: boolean;
}

export async function sendPurchaseEmail({
  to,
  siteName = 'Julieth Garcia',
  productName,
  productDescription,
  purchaseCode,
  downloadToken,
  amount,
  currency,
  expiresAt,
  maxDownloads,
  isRegistered,
}: SendPurchaseEmailParams) {
  try {
    const appUrl = import.meta.env.PUBLIC_APP_URL || 'http://localhost:4321';
    const downloadUrl = `${appUrl}/downloads/${downloadToken}`;

    // Render email template
    const emailHtml = await render(
      JeylaPurchaseConfirmationEmail({
        siteName,
        productName,
        productDescription,
        buyerEmail: to,
        purchaseCode,
        downloadToken,
        downloadUrl,
        amount,
        currency,
        expiresAt,
        maxDownloads,
        isRegistered,
      })
    );

    // Send email via Resend
    const resend = getResend();
    const response = await resend.emails.send({
      from: EMAIL_FROM,
      to,
      subject: `¡Tu compra de "${productName}" está lista!`,
      html: emailHtml,
    });

    console.log('Purchase email sent successfully:', response);
    return response;
  } catch (error) {
    console.error('Error sending purchase email:', error);
    throw error;
  }
}

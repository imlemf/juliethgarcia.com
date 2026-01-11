import { render } from '@react-email/render';
import { getResend, EMAIL_FROM } from './client';
import PurchaseConfirmationEmail from './templates/purchase-confirmation';

interface SendPurchaseEmailParams {
  to: string;
  productName: string;
  productDescription?: string;
  purchaseCode: string;
  downloadToken: string;
  amount: number;
  currency: string;
  expiresAt: Date;
  maxDownloads: number;
}

export async function sendPurchaseEmail({
  to,
  productName,
  productDescription,
  purchaseCode,
  downloadToken,
  amount,
  currency,
  expiresAt,
  maxDownloads,
}: SendPurchaseEmailParams) {
  try {
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const downloadUrl = `${appUrl}/download/${downloadToken}`;

    // Render email template
    const emailHtml = await render(
      PurchaseConfirmationEmail({
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

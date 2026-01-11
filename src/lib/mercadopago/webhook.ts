/**
 * Validate Mercado Pago webhook signature using Web Crypto API (edge-compatible)
 * @param xSignature - x-signature header from the webhook
 * @param xRequestId - x-request-id header from the webhook
 * @param dataId - data.id from the query params
 * @returns Promise<boolean> indicating if signature is valid
 */
export async function validateWebhookSignature(
  xSignature: string,
  xRequestId: string,
  dataId: string
): Promise<boolean> {
  const secret = process.env.MERCADOPAGO_WEBHOOK_SECRET;

  if (!secret) {
    console.error('MERCADOPAGO_WEBHOOK_SECRET is not configured');
    return false;
  }

  try {
    // Parse x-signature header
    // Format: "ts=1234567890,v1=hash_value"
    const parts = xSignature.split(',');
    const tsPart = parts.find((p) => p.startsWith('ts='));
    const hashPart = parts.find((p) => p.startsWith('v1='));

    if (!tsPart || !hashPart) {
      console.error('Invalid x-signature format');
      return false;
    }

    const ts = tsPart.split('=')[1];
    const receivedHash = hashPart.split('=')[1];

    // Build manifest string
    // Format: "id:{dataId};request-id:{xRequestId};ts:{ts};"
    const manifest = `id:${dataId};request-id:${xRequestId};ts:${ts};`;

    // Calculate HMAC SHA256 using Web Crypto API
    const encoder = new TextEncoder();
    const keyData = encoder.encode(secret);
    const messageData = encoder.encode(manifest);

    const cryptoKey = await crypto.subtle.importKey(
      'raw',
      keyData,
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );

    const signature = await crypto.subtle.sign('HMAC', cryptoKey, messageData);

    // Convert to hex string
    const hashArray = Array.from(new Uint8Array(signature));
    const expectedHash = hashArray.map((b) => b.toString(16).padStart(2, '0')).join('');

    // Compare hashes
    return expectedHash === receivedHash;
  } catch (error) {
    console.error('Error validating webhook signature:', error);
    return false;
  }
}

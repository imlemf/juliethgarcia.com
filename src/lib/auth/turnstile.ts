interface TurnstileResponse {
  success: boolean;
  'error-codes'?: string[];
  challenge_ts?: string;
  hostname?: string;
}

export async function validateTurnstile(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Skip Turnstile validation in development
    if (import.meta.env.DEV) {
      console.log('Skipping Turnstile validation in development mode');
      return { success: true };
    }

    const secretKey = import.meta.env.TURNSTILE_SECRET_KEY;

    if (!secretKey) {
      console.error('TURNSTILE_SECRET_KEY is not configured');
      return {
        success: false,
        error: 'Turnstile is not properly configured.',
      };
    }

    console.log('Validating Turnstile token...');

    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: secretKey,
        response: token,
      }),
    });

    if (!response.ok) {
      console.error('Turnstile API error:', response.status, response.statusText);
      return {
        success: false,
        error: 'Failed to verify anti-bot challenge.',
      };
    }

    const data = await response.json() as TurnstileResponse;

    console.log('Turnstile validation response:', {
      success: data.success,
      errorCodes: data['error-codes'],
    });

    if (!data.success) {
      const errorCodes = data['error-codes'] || [];
      console.error('Turnstile validation failed:', errorCodes);
      return {
        success: false,
        error: 'Bot detection failed. Please try again.',
      };
    }

    return { success: true };
  } catch (error) {
    console.error('Turnstile validation error:', error);
    return {
      success: false,
      error: 'Failed to verify anti-bot challenge.',
    };
  }
}

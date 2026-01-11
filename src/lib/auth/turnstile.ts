export async function validateTurnstile(token: string): Promise<{ success: boolean; error?: string }> {
  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        secret: process.env.TURNSTILE_SECRET_KEY,
        response: token,
      }),
    });

    const data = await response.json() as { success: boolean };

    if (!data.success) {
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

import { ZodError } from 'zod';

/**
 * Standard error responses for API endpoints
 */
export class ApiError extends Error {
  constructor(
    public statusCode: number,
    message: string,
    public details?: any
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/**
 * Handle errors in API routes with consistent formatting
 */
export function handleApiError(error: unknown): Response {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return new Response(
      JSON.stringify({
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      }),
      {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return new Response(
      JSON.stringify({
        error: error.message,
        ...(error.details && { details: error.details }),
      }),
      {
        status: error.statusCode,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    return new Response(
      JSON.stringify({
        error: error.message || 'An unexpected error occurred',
      }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  // Unknown errors
  return new Response(
    JSON.stringify({
      error: 'An unexpected error occurred',
    }),
    {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

/**
 * Common error responses
 */
export const ErrorResponses = {
  unauthorized: () => new ApiError(401, 'Unauthorized'),
  forbidden: (message = 'Forbidden') => new ApiError(403, message),
  notFound: (resource = 'Resource') => new ApiError(404, `${resource} not found`),
  badRequest: (message = 'Bad request') => new ApiError(400, message),
  conflict: (message = 'Conflict') => new ApiError(409, message),
  tooManyRequests: (retryAfter?: number) =>
    new ApiError(429, 'Too many requests', { retryAfter }),
  internalError: (message = 'Internal server error') => new ApiError(500, message),
} as const;

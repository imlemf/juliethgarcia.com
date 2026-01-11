import { NextResponse } from 'next/server';
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
export function handleApiError(error: unknown): NextResponse {
  console.error('API Error:', error);

  // Zod validation errors
  if (error instanceof ZodError) {
    return NextResponse.json(
      {
        error: 'Validation failed',
        details: error.errors.map((err) => ({
          field: err.path.join('.'),
          message: err.message,
        })),
      },
      { status: 400 }
    );
  }

  // Custom API errors
  if (error instanceof ApiError) {
    return NextResponse.json(
      {
        error: error.message,
        ...(error.details && { details: error.details }),
      },
      { status: error.statusCode }
    );
  }

  // Generic errors
  if (error instanceof Error) {
    return NextResponse.json(
      {
        error: error.message || 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }

  // Unknown errors
  return NextResponse.json(
    {
      error: 'An unexpected error occurred',
    },
    { status: 500 }
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

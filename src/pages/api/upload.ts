import type { APIRoute } from 'astro';
import { generatePresignedUploadUrl, isValidFileType } from '@/lib/r2/upload';
import { z } from 'zod';

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
  folder: z.string().optional().default('products'),
});

// POST /api/upload - Generate presigned upload URL (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;

    // Check if user is admin
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const body = await request.json();

    // Validate input
    const validationResult = uploadRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Invalid input',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const { fileName, contentType, folder } = validationResult.data;

    // Validate file type
    if (!isValidFileType(contentType)) {
      return new Response(JSON.stringify({ error: 'File type not allowed' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate presigned upload URL
    const { uploadUrl, fileKey } = await generatePresignedUploadUrl(fileName, contentType, 3600, folder);

    return new Response(
      JSON.stringify({
        uploadUrl,
        fileKey,
        fileName,
      }),
      {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return new Response(JSON.stringify({ error: 'Failed to generate upload URL' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

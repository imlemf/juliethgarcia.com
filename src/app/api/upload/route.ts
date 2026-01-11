import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { generatePresignedUploadUrl, isValidFileType } from '@/lib/r2/upload';
import { z } from 'zod';

export const runtime = 'edge';

const uploadRequestSchema = z.object({
  fileName: z.string().min(1, 'File name is required'),
  contentType: z.string().min(1, 'Content type is required'),
});

// POST /api/upload - Generate presigned upload URL (admin only)
export async function POST(request: NextRequest) {
  try {
    const session = await auth();

    // Check if user is admin
    if (!session || session.user.role !== 'admin') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();

    // Validate input
    const validationResult = uploadRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const { fileName, contentType } = validationResult.data;

    // Validate file type
    if (!isValidFileType(contentType)) {
      return NextResponse.json(
        { error: 'File type not allowed' },
        { status: 400 }
      );
    }

    // Generate presigned upload URL
    const { uploadUrl, fileKey } = await generatePresignedUploadUrl(
      fileName,
      contentType
    );

    return NextResponse.json(
      {
        uploadUrl,
        fileKey,
        fileName,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error generating upload URL:', error);
    return NextResponse.json(
      { error: 'Failed to generate upload URL' },
      { status: 500 }
    );
  }
}

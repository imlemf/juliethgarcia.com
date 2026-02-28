import type { APIRoute } from 'astro';
import { uploadToImageKit } from '@/lib/imagekit';

const ACCEPTED_IMAGE_TYPES = ['image/webp', 'image/jpeg'];
const MAX_IMAGE_SIZE = 512 * 1024; // 512KB

// POST /api/recipes/upload-image - Upload recipe image to ImageKit (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;
    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();
    const imageFile = formData.get('image') as File | null;

    if (!imageFile || imageFile.size === 0) {
      return new Response(JSON.stringify({ error: 'Imagen requerida' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!ACCEPTED_IMAGE_TYPES.includes(imageFile.type)) {
      return new Response(JSON.stringify({ error: 'Solo se permiten imágenes JPG o WebP' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (imageFile.size > MAX_IMAGE_SIZE) {
      return new Response(JSON.stringify({ error: 'La imagen no puede superar 512KB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const result = await uploadToImageKit(imageFile, locals.runtime as any, '/recipes');

    return new Response(JSON.stringify({ imageUrl: result.url, imageFileId: result.fileId }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error uploading recipe image:', error);
    return new Response(JSON.stringify({ error: 'Error al subir imagen' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

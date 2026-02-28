import type { APIRoute } from 'astro';
import { eq, count } from 'drizzle-orm';
import { getDb, products } from '@/lib/db';
import { getProductById, updateProduct } from '@/lib/db/queries/products';
import { updateProductSchema } from '@/lib/validations/products';
import { createId } from '@paralleldrive/cuid2';
import { uploadToImageKit, deleteFromImageKit } from '@/lib/imagekit';

const MAX_ACTIVE_PRODUCTS = 15;

// GET /api/products/[id] - Get product by ID
export const GET: APIRoute = async ({ params, locals }) => {
  try {
    const { id } = params;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);
    const product = await getProductById(db, id);

    if (!product) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ product }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching product:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch product' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// PATCH /api/products/[id] - Update product (admin only)
export const PATCH: APIRoute = async ({ params, request, locals }) => {
  try {
    const { id } = params;
    const user = locals.user;

    if (!id) {
      return new Response(JSON.stringify({ error: 'Product ID is required' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const db = getDb(locals.runtime);

    const existingProduct = await getProductById(db, id);
    if (!existingProduct) {
      return new Response(JSON.stringify({ error: 'Product not found' }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const contentType = request.headers.get('content-type') || '';
    let updateData: Record<string, any>;

    if (contentType.includes('multipart/form-data')) {
      const formData = await request.formData();
      const file = formData.get('file') as File | null;
      const imageFile = formData.get('image') as File | null;

      updateData = {
        name: formData.get('name') as string,
        slug: formData.get('slug') as string,
        description: formData.get('description') as string,
        price: Number(formData.get('price')),
        currency: formData.get('currency') as string,
        isActive: formData.get('isActive') !== 'false',
      };

      // Upload new image if provided
      if (imageFile && imageFile.size > 0) {
        // Delete old image from ImageKit if exists
        if (existingProduct.imageFileId) {
          await deleteFromImageKit(existingProduct.imageFileId, locals.runtime as any);
        }

        const result = await uploadToImageKit(imageFile, locals.runtime as any);
        updateData.imageUrl = result.url;
        updateData.imageFileId = result.fileId;
        updateData.imageProvider = 'imagekit';
      }

      // Upload new file if provided
      if (file && file.size > 0) {
        if (file.type !== 'application/pdf') {
          return new Response(JSON.stringify({ error: 'Solo se permiten archivos PDF' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }
        if (file.size > 5 * 1024 * 1024) {
          return new Response(JSON.stringify({ error: 'El archivo no puede superar 5MB' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          });
        }

        const fileExtension = file.name.split('.').pop();
        const fileKey = `products/${createId()}.${fileExtension}`;

        const r2Bucket = (locals.runtime.env as any).R2_BUCKET as R2Bucket;
        const fileBuffer = await file.arrayBuffer();
        await r2Bucket.put(fileKey, fileBuffer, {
          httpMetadata: { contentType: file.type },
          customMetadata: { originalName: file.name },
        });

        // Delete old file
        await r2Bucket.delete(existingProduct.fileKey);

        updateData.fileKey = fileKey;
        updateData.fileName = file.name;
        updateData.fileSize = file.size;
      }
    } else {
      updateData = await request.json();
    }

    const validationResult = updateProductSchema.safeParse(updateData);
    if (!validationResult.success) {
      return new Response(
        JSON.stringify({
          error: 'Datos inválidos',
          details: validationResult.error.errors,
        }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // Check active products limit when activating
    if (validationResult.data.isActive === true && !existingProduct.isActive) {
      const [{ count: activeCount }] = await db
        .select({ count: count() })
        .from(products)
        .where(eq(products.isActive, true));

      if (activeCount >= MAX_ACTIVE_PRODUCTS) {
        return new Response(
          JSON.stringify({ error: `Solo puedes tener máximo ${MAX_ACTIVE_PRODUCTS} productos activos` }),
          { status: 400, headers: { 'Content-Type': 'application/json' } }
        );
      }
    }

    const product = await updateProduct(db, id, validationResult.data);

    return new Response(JSON.stringify({ product }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error updating product:', error);
    return new Response(JSON.stringify({ error: 'Error al actualizar el producto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};


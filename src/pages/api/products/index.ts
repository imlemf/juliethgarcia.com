import type { APIRoute } from 'astro';
import { eq, count } from 'drizzle-orm';
import { getDb, products } from '@/lib/db';
import { getAllProducts, createProduct } from '@/lib/db/queries/products';
import { createProductSchema } from '@/lib/validations/products';
import { createId } from '@paralleldrive/cuid2';
import { uploadToImageKit } from '@/lib/imagekit';

const MAX_ACTIVE_PRODUCTS = 15;

// GET /api/products - List all products
export const GET: APIRoute = async ({ request, locals }) => {
  try {
    const url = new URL(request.url);
    const showInactive = url.searchParams.get('showInactive') === 'true';

    // Get user from middleware (Better Auth session)
    const user = locals.user;
    const isAdmin = user?.role === 'admin';

    // Only admins can see inactive products
    const onlyActive = !showInactive || !isAdmin;

    const db = getDb(locals.runtime);
    const products = await getAllProducts(db, onlyActive);

    return new Response(JSON.stringify({ products }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error fetching products:', error);
    return new Response(JSON.stringify({ error: 'Failed to fetch products' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

// POST /api/products - Create new product (admin only)
export const POST: APIRoute = async ({ request, locals }) => {
  try {
    const user = locals.user;

    if (!user || user.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const formData = await request.formData();

    const file = formData.get('file') as File | null;
    if (!file || file.size === 0) {
      return new Response(JSON.stringify({ error: 'El archivo es requerido' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Validate file type and size
    if (file.type !== 'application/pdf') {
      return new Response(JSON.stringify({ error: 'Solo se permiten archivos PDF' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return new Response(JSON.stringify({ error: 'El archivo no puede superar 5MB' }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Generate file key
    const fileExtension = file.name.split('.').pop();
    const fileKey = `products/${createId()}.${fileExtension}`;

    // Upload image to ImageKit if provided
    const imageFile = formData.get('image') as File | null;
    let imageUrl: string | undefined;
    let imageFileId: string | undefined;
    let imageProvider: string | undefined;

    if (imageFile && imageFile.size > 0) {
      const result = await uploadToImageKit(imageFile, locals.runtime as any);
      imageUrl = result.url;
      imageFileId = result.fileId;
      imageProvider = 'imagekit';
    }

    // Build and validate product data
    const isActive = formData.get('isActive') !== 'false';
    const productData = {
      name: formData.get('name') as string,
      slug: formData.get('slug') as string,
      description: formData.get('description') as string,
      price: Number(formData.get('price')),
      currency: formData.get('currency') as string,
      imageUrl,
      imageFileId,
      imageProvider,
      isActive,
      fileKey,
      fileName: file.name,
      fileSize: file.size,
    };

    const validationResult = createProductSchema.safeParse(productData);
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

    // Check active products limit
    const db = getDb(locals.runtime);
    if (isActive) {
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

    // Upload file to R2 using binding
    const r2Bucket = (locals.runtime.env as any).R2_BUCKET as R2Bucket;
    const fileBuffer = await file.arrayBuffer();
    await r2Bucket.put(fileKey, fileBuffer, {
      httpMetadata: { contentType: file.type },
      customMetadata: { originalName: file.name },
    });

    // Create product record
    const product = await createProduct(db, validationResult.data);

    return new Response(JSON.stringify({ product }), {
      status: 201,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error creating product:', error);
    return new Response(JSON.stringify({ error: 'Error al crear el producto' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

import type { APIRoute } from 'astro';
import { getDb } from '@/lib/db';
import { getProductById } from '@/lib/db/queries/products';

export const GET: APIRoute = async ({ params, locals }) => {
  const user = locals.user;
  if (!user || user.role !== 'admin') {
    return new Response(JSON.stringify({ error: 'Unauthorized' }), {
      status: 401,
      headers: { 'Content-Type': 'application/json' },
    });
  }

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

  const r2Bucket = (locals.runtime.env as any).R2_BUCKET as R2Bucket;
  const object = await r2Bucket.get(product.fileKey);

  if (!object) {
    return new Response(JSON.stringify({ error: 'File not found in storage' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  return new Response(object.body, {
    headers: {
      'Content-Type': object.httpMetadata?.contentType || 'application/octet-stream',
      'Content-Disposition': `attachment; filename="${product.fileName}"`,
    },
  });
};

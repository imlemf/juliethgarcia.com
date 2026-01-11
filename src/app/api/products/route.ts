import { NextRequest, NextResponse } from 'next/server';
import { auth } from '@/lib/auth/auth';
import { getDb } from '@/lib/db';
import { getAllProducts, createProduct } from '@/lib/db/queries/products';
import { createProductSchema } from '@/lib/validations/products';

export const runtime = 'edge';

// GET /api/products - List all products
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const showInactive = searchParams.get('showInactive') === 'true';

    // Get session to check if user is admin
    const session = await auth();
    const isAdmin = session?.user?.role === 'admin';

    // Only admins can see inactive products
    const onlyActive = !showInactive || !isAdmin;

    const db = getDb((request as any).env?.DB);
    const products = await getAllProducts(db, onlyActive);

    return NextResponse.json({ products }, { status: 200 });
  } catch (error) {
    console.error('Error fetching products:', error);
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}

// POST /api/products - Create new product (admin only)
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
    const validationResult = createProductSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid input', details: validationResult.error.errors },
        { status: 400 }
      );
    }

    const db = getDb((request as any).env?.DB);

    // Create product
    const product = await createProduct(db, validationResult.data);

    return NextResponse.json({ product }, { status: 201 });
  } catch (error) {
    console.error('Error creating product:', error);
    return NextResponse.json(
      { error: 'Failed to create product' },
      { status: 500 }
    );
  }
}

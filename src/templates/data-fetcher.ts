import { eq, desc } from 'drizzle-orm';
import type { DbClient } from '@/lib/db';
import { products, recipes, recipeCategories, blogs, blogCategories, siteLinks } from '@/db/schema';
import { getTemplateConfigValue } from '@/lib/db/queries/template-configs';
import { getRecipeWithDetailsBySlug } from '@/lib/db/queries/recipes';
import { getPurchaseById, updatePurchase, getOrCreatePurchase, getPurchasesByUserIdOrEmail } from '@/lib/db/queries/purchases';
import { createDownloadLink, getDownloadLinksByPurchaseId } from '@/lib/db/queries/downloads';
import { getProductById } from '@/lib/db/queries/products';
import { getUserByEmail } from '@/lib/db/queries/users';
import { generatePurchaseCode } from '@/lib/utils/generate-code';
import { generateDownloadToken } from '@/lib/utils/generate-token';
import { sendPurchaseEmail } from '@/lib/email/send';
import type { TemplatePage } from './types';

export interface RouteParams {
  slug?: string;
  paymentId?: string;
  searchParams?: URLSearchParams;
}

/**
 * Fetch social links for footer (used by all pages)
 */
async function fetchSocialLinks(db: DbClient) {
  return db
    .select({
      id: siteLinks.id,
      title: siteLinks.title,
      url: siteLinks.url,
      icon: siteLinks.icon,
      iconType: siteLinks.iconType,
    })
    .from(siteLinks)
    .where(eq(siteLinks.isActive, true))
    .orderBy(siteLinks.order);
}

export interface AuthContext {
  isAuthenticated: boolean;
  isPremium: boolean;
  userId?: string;
  userEmail?: string;
}

/**
 * Fetch data for a specific page type
 */
export async function fetchPageData(
  page: TemplatePage,
  db: DbClient,
  templateId: string,
  auth: AuthContext,
  params: RouteParams = {}
): Promise<Record<string, unknown>> {
  // Fetch social links for all pages (used in footer)
  const socialLinks = await fetchSocialLinks(db);

  let pageData: Record<string, unknown> = {};

  switch (page) {
    case 'home':
      pageData = await fetchHomeData(db, templateId);
      break;
    case 'store':
      pageData = await fetchStoreData(db);
      break;
    case 'recipes':
      pageData = await fetchRecipesData(db, auth);
      break;
    case 'recipeDetail':
      pageData = await fetchRecipeDetailData(db, params.slug, templateId, auth);
      break;
    case 'blog':
      pageData = await fetchBlogData(db);
      break;
    case 'blogDetail':
      pageData = await fetchBlogDetailData(db, params.slug, auth);
      break;
    case 'links':
      pageData = await fetchLinksData(db);
      break;
    case 'login':
      pageData = {};
      break;
    case 'register':
      pageData = {};
      break;
    case 'checkout':
      pageData = await fetchCheckoutData(db, params.slug, auth);
      break;
    case 'checkoutResult':
      pageData = await fetchCheckoutResultData(db, params.searchParams);
      break;
    case 'myPurchases':
      pageData = await fetchMyPurchasesData(db, auth);
      break;
  }

  return { ...pageData, socialLinks };
}

async function fetchHomeData(db: DbClient, templateId: string) {
  // Get hero product from template config
  const heroProductId = await getTemplateConfigValue(db, templateId, 'heroProductId');
  let featuredProduct = null;

  if (heroProductId) {
    const [product] = await db
      .select({
        id: products.id,
        name: products.name,
        slug: products.slug,
        description: products.description,
        price: products.price,
        currency: products.currency,
        imageUrl: products.imageUrl,
      })
      .from(products)
      .where(eq(products.id, heroProductId))
      .limit(1);
    featuredProduct = product || null;
  }

  // Get recent public recipes
  const recipesLimitStr = await getTemplateConfigValue(db, templateId, 'recipesHomeLimit');
  const recipesLimit = recipesLimitStr ? parseInt(recipesLimitStr, 10) : 3;

  const recentRecipes = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      slug: recipes.slug,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      estimatedTime: recipes.estimatedTime,
      difficulty: recipes.difficulty,
      calories: recipes.calories,
      servings: recipes.servings,
    })
    .from(recipes)
    .where(eq(recipes.isPublished, true))
    .orderBy(desc(recipes.publishedAt))
    .limit(recipesLimit);

  // Get recent blogs
  const blogsLimitStr = await getTemplateConfigValue(db, templateId, 'blogsHomeLimit');
  const blogsLimit = blogsLimitStr ? parseInt(blogsLimitStr, 10) : 3;

  const recentBlogs = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      coverImage: blogs.coverImage,
      publishedAt: blogs.publishedAt,
    })
    .from(blogs)
    .where(eq(blogs.isPublished, true))
    .orderBy(desc(blogs.publishedAt))
    .limit(blogsLimit);

  return {
    featuredProduct,
    recentRecipes,
    recentBlogs,
  };
}

async function fetchStoreData(db: DbClient) {
  const activeProducts = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      currency: products.currency,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.isActive, true));

  return { products: activeProducts };
}

async function fetchRecipesData(db: DbClient, auth: AuthContext) {
  // Get all published recipes
  const allRecipes = await db
    .select({
      id: recipes.id,
      name: recipes.name,
      slug: recipes.slug,
      description: recipes.description,
      imageUrl: recipes.imageUrl,
      estimatedTime: recipes.estimatedTime,
      calories: recipes.calories,
      servings: recipes.servings,
      difficulty: recipes.difficulty,
      isPremium: recipes.isPremium,
      categoryId: recipes.categoryId,
    })
    .from(recipes)
    .where(eq(recipes.isPublished, true));

  // Get categories
  const categories = await db
    .select({
      id: recipeCategories.id,
      name: recipeCategories.name,
      slug: recipeCategories.slug,
    })
    .from(recipeCategories)
    .where(eq(recipeCategories.isActive, true))
    .orderBy(recipeCategories.order);

  // Create a map for category names
  const categoryMap = new Map(categories.map((c) => [c.id, c.name]));

  // Add category name to recipes
  const recipesWithCategory = allRecipes.map((recipe) => ({
    ...recipe,
    categoryName: recipe.categoryId ? categoryMap.get(recipe.categoryId) || null : null,
  }));

  return {
    recipes: recipesWithCategory,
    categories,
    isAuthenticated: auth.isAuthenticated,
    isPremium: auth.isPremium,
  };
}

async function fetchBlogData(db: DbClient) {
  // Get all published blogs
  const allBlogs = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      coverImage: blogs.coverImage,
      categoryId: blogs.categoryId,
      publishedAt: blogs.publishedAt,
      isPremium: blogs.isPremium,
    })
    .from(blogs)
    .where(eq(blogs.isPublished, true))
    .orderBy(desc(blogs.publishedAt));

  // Get categories
  const categories = await db
    .select({
      id: blogCategories.id,
      name: blogCategories.name,
      slug: blogCategories.slug,
    })
    .from(blogCategories)
    .where(eq(blogCategories.isActive, true))
    .orderBy(blogCategories.order);

  // Create a map for category info
  const categoryMap = new Map(categories.map((c) => [c.id, { name: c.name, slug: c.slug }]));

  // Add category info to blogs
  const blogsWithCategory = allBlogs.map((blog) => ({
    ...blog,
    categoryName: blog.categoryId ? categoryMap.get(blog.categoryId)?.name || null : null,
    categorySlug: blog.categoryId ? categoryMap.get(blog.categoryId)?.slug || null : null,
  }));

  return {
    blogs: blogsWithCategory,
    categories,
  };
}

async function fetchLinksData(db: DbClient) {
  const links = await db
    .select({
      id: siteLinks.id,
      title: siteLinks.title,
      url: siteLinks.url,
      icon: siteLinks.icon,
      iconType: siteLinks.iconType,
    })
    .from(siteLinks)
    .where(eq(siteLinks.isActive, true))
    .orderBy(siteLinks.order);

  return { links };
}

async function fetchRecipeDetailData(db: DbClient, slug?: string, templateId?: string, auth?: AuthContext) {
  if (!slug) {
    return { recipe: null, mainProductSlug: null };
  }

  const recipe = await getRecipeWithDetailsBySlug(db, slug, true);

  // Get main product for premium checkout
  let mainProductSlug: string | null = null;
  if (templateId) {
    const heroProductId = await getTemplateConfigValue(db, templateId, 'heroProductId');
    if (heroProductId) {
      const [product] = await db
        .select({ slug: products.slug })
        .from(products)
        .where(eq(products.id, heroProductId))
        .limit(1);
      mainProductSlug = product?.slug || null;
    }
  }

  // If recipe is premium and user is not premium, strip preparations (ingredients and steps)
  let processedRecipe = recipe;
  if (recipe && recipe.isPremium && !auth?.isPremium) {
    processedRecipe = {
      ...recipe,
      preparations: [], // Hide preparations for non-premium users
    };
  }

  return {
    recipe: processedRecipe,
    mainProductSlug,
    isAuthenticated: auth?.isAuthenticated ?? false,
    isPremium: auth?.isPremium ?? false,
  };
}

async function fetchBlogDetailData(db: DbClient, slug?: string, auth?: AuthContext) {
  if (!slug) {
    return { blog: null, relatedBlogs: [] };
  }

  // Get the blog post with full content
  const [blog] = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      content: blogs.content,
      excerpt: blogs.excerpt,
      coverImage: blogs.coverImage,
      categoryId: blogs.categoryId,
      publishedAt: blogs.publishedAt,
      isPremium: blogs.isPremium,
    })
    .from(blogs)
    .where(eq(blogs.slug, slug))
    .limit(1);

  if (!blog) {
    return { blog: null, relatedBlogs: [] };
  }

  // Get category info
  let categoryName: string | null = null;
  let categorySlug: string | null = null;

  if (blog.categoryId) {
    const [category] = await db
      .select({
        name: blogCategories.name,
        slug: blogCategories.slug,
      })
      .from(blogCategories)
      .where(eq(blogCategories.id, blog.categoryId))
      .limit(1);

    if (category) {
      categoryName = category.name;
      categorySlug = category.slug;
    }
  }

  // Get related blogs (same category or recent)
  const relatedBlogs = await db
    .select({
      id: blogs.id,
      title: blogs.title,
      slug: blogs.slug,
      excerpt: blogs.excerpt,
      coverImage: blogs.coverImage,
      publishedAt: blogs.publishedAt,
    })
    .from(blogs)
    .where(eq(blogs.isPublished, true))
    .orderBy(desc(blogs.publishedAt))
    .limit(4);

  // Filter out current blog
  const filteredRelated = relatedBlogs.filter((b) => b.id !== blog.id).slice(0, 3);

  // If blog is premium and user is not premium, strip content
  const processedBlog = {
    ...blog,
    categoryName,
    categorySlug,
    content: blog.isPremium && !auth?.isPremium ? '' : blog.content,
  };

  return {
    blog: processedBlog,
    relatedBlogs: filteredRelated,
    isAuthenticated: auth?.isAuthenticated ?? false,
    isPremium: auth?.isPremium ?? false,
  };
}

async function fetchCheckoutData(db: DbClient, slug?: string, auth?: AuthContext) {
  if (!slug) {
    return { product: null };
  }

  // Get the product by slug
  const [product] = await db
    .select({
      id: products.id,
      name: products.name,
      slug: products.slug,
      description: products.description,
      price: products.price,
      currency: products.currency,
      imageUrl: products.imageUrl,
    })
    .from(products)
    .where(eq(products.slug, slug))
    .limit(1);

  return {
    product: product || null,
    isAuthenticated: auth?.isAuthenticated ?? false,
    isPremium: auth?.isPremium ?? false,
  };
}

async function fetchCheckoutResultData(db: DbClient, searchParams?: URLSearchParams) {
  const paymentId = searchParams?.get('payment_id') || searchParams?.get('collection_id');

  let payment: any = null;
  let statusType: 'approved' | 'pending' | 'failure' | 'unknown' = 'unknown';
  let productSlug: string | null = null;
  let purchaseCode: string | null = null;
  let purchaseEmail: string | null = null;
  let downloadToken: string | null = null;

  if (paymentId) {
    try {
      const accessToken = import.meta.env.MERCADOPAGO_ACCESS_TOKEN;
      const response = await fetch(`https://api.mercadopago.com/v1/payments/${paymentId}`, {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      if (response.ok) {
        const paymentData = await response.json();
        productSlug = paymentData.external_reference || null;

        // Determine status
        if (paymentData.status === 'approved') {
          statusType = 'approved';

          // Process approved payment
          const purchaseIdFromMetadata = paymentData.metadata?.purchase_id;
          const productId = paymentData.metadata?.product_id;
          const buyerEmail = paymentData.metadata?.buyer_email || paymentData.payer?.email;

          if (productId && buyerEmail) {
            try {
              let purchase;
              let created = false;

              // Try to find existing purchase
              if (purchaseIdFromMetadata) {
                purchase = await getPurchaseById(db, purchaseIdFromMetadata);
                if (purchase) {
                  purchase = await updatePurchase(db, purchaseIdFromMetadata, {
                    externalPaymentId: paymentId,
                    externalOrderId: paymentData.order?.id,
                    providerStatus: paymentData.status,
                    providerStatusDetail: paymentData.status_detail,
                    status: 'completed',
                  });

                  const existingLinks = await getDownloadLinksByPurchaseId(db, purchaseIdFromMetadata);
                  if (existingLinks.length === 0) {
                    created = true;
                  }
                }
              }

              // Fallback: create new purchase
              if (!purchase) {
                const newPurchaseCode = generatePurchaseCode();
                const result = await getOrCreatePurchase(db, {
                  productId,
                  email: buyerEmail,
                  purchaseCode: newPurchaseCode,
                  paymentProvider: 'mercadopago',
                  externalPaymentId: paymentId,
                  externalOrderId: paymentData.order?.id,
                  providerStatus: paymentData.status,
                  providerStatusDetail: paymentData.status_detail,
                  amount: Math.round(paymentData.transaction_amount * 100),
                  currency: paymentData.currency_id,
                  status: 'completed',
                });
                purchase = result.purchase;
                created = result.created;
              }

              purchaseCode = purchase.purchaseCode;
              purchaseEmail = purchase.email;

              // Create download link and send email if new
              if (created) {
                const expiryHours = parseInt(import.meta.env.DOWNLOAD_LINK_EXPIRY_HOURS || '48');
                const expiresAt = new Date();
                expiresAt.setHours(expiresAt.getHours() + expiryHours);

                const newDownloadToken = generateDownloadToken();
                downloadToken = newDownloadToken;
                await createDownloadLink(db, {
                  purchaseId: purchase.id,
                  productId,
                  token: newDownloadToken,
                  expiresAt,
                  maxDownloads: parseInt(import.meta.env.MAX_DOWNLOADS_PER_PURCHASE || '5'),
                });

                const product = await getProductById(db, productId);
                const existingUser = await getUserByEmail(db, buyerEmail);

                if (product) {
                  try {
                    await sendPurchaseEmail({
                      to: buyerEmail,
                      productName: product.name,
                      productDescription: product.description || undefined,
                      purchaseCode: purchase.purchaseCode,
                      downloadToken: newDownloadToken,
                      amount: Math.round(paymentData.transaction_amount * 100),
                      currency: paymentData.currency_id,
                      expiresAt,
                      maxDownloads: parseInt(import.meta.env.MAX_DOWNLOADS_PER_PURCHASE || '5'),
                      isRegistered: !!existingUser,
                    });
                  } catch (emailError) {
                    console.error('Failed to send purchase email:', emailError);
                  }
                }
              } else {
                // Existing purchase — get existing download link token
                const existingLinks = await getDownloadLinksByPurchaseId(db, purchase.id);
                if (existingLinks.length > 0) {
                  downloadToken = existingLinks[0].token;
                }
              }
            } catch (createError) {
              console.error('Error creating purchase:', createError);
            }
          }

          payment = {
            id: paymentData.id,
            status: paymentData.status,
            transactionAmount: paymentData.transaction_amount,
            currencyId: paymentData.currency_id,
            paymentMethodId: paymentData.payment_method_id,
            payerEmail: purchaseEmail || paymentData.metadata?.buyer_email || paymentData.payer?.email,
          };
        } else if (['pending', 'in_process', 'authorized'].includes(paymentData.status)) {
          statusType = 'pending';
          payment = {
            id: paymentData.id,
            status: paymentData.status,
            transactionAmount: paymentData.transaction_amount,
            currencyId: paymentData.currency_id,
            paymentMethodId: paymentData.payment_method_id,
            payerEmail: purchaseEmail || paymentData.metadata?.buyer_email || paymentData.payer?.email,
          };
        } else if (['rejected', 'cancelled', 'refunded', 'charged_back'].includes(paymentData.status)) {
          statusType = 'failure';
          payment = {
            id: paymentData.id,
            status: paymentData.status,
            transactionAmount: paymentData.transaction_amount,
            currencyId: paymentData.currency_id,
            paymentMethodId: paymentData.payment_method_id,
            payerEmail: purchaseEmail || paymentData.metadata?.buyer_email || paymentData.payer?.email,
          };
        }
      }
    } catch (error) {
      console.error('Error fetching payment:', error);
    }
  }

  // Fallback to query params
  if (!payment && searchParams) {
    const status = searchParams.get('status') || searchParams.get('collection_status');
    productSlug = searchParams.get('external_reference');

    if (status === 'approved') {
      statusType = 'approved';
    } else if (status === 'pending' || status === 'in_process') {
      statusType = 'pending';
    } else if (status === 'rejected' || status === 'cancelled' || status === 'null') {
      statusType = 'failure';
    }
  }

  // Check if a user account exists for the buyer's email
  let showRegister = false;
  const buyerEmail = payment?.payerEmail;
  if (statusType === 'approved' && buyerEmail) {
    const existingUser = await getUserByEmail(db, buyerEmail);
    if (!existingUser) {
      showRegister = true;
    }
  }

  return {
    statusType,
    payment,
    purchaseCode,
    productSlug,
    downloadToken,
    showRegister,
  };
}

async function fetchMyPurchasesData(db: DbClient, auth: AuthContext) {
  if (!auth.isAuthenticated || !auth.userId || !auth.userEmail) {
    return { isAuthenticated: false, purchases: [] };
  }

  const userPurchases = await getPurchasesByUserIdOrEmail(db, auth.userId, auth.userEmail);

  const purchases = userPurchases
    .filter((p) => p.status === 'completed')
    .map((p) => ({
      id: p.id,
      productName: p.product?.name || 'Producto',
      productSlug: p.product?.slug || '',
      productImageUrl: p.product?.imageUrl || null,
      amount: p.amount,
      currency: p.currency,
      status: p.status,
      purchaseCode: p.purchaseCode,
      createdAt: p.createdAt instanceof Date ? p.createdAt.toISOString() : String(p.createdAt),
      downloadLinks: (p.downloadLinks || []).map((dl) => ({
        token: dl.token,
        downloadCount: dl.downloadCount,
        maxDownloads: dl.maxDownloads,
        expiresAt: dl.expiresAt instanceof Date ? dl.expiresAt.toISOString() : String(dl.expiresAt),
      })),
    }));

  return { isAuthenticated: true, purchases };
}

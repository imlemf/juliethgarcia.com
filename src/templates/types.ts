import type { ComponentType } from 'react';

// ==================== OPTION TYPES ====================

export type TemplateOptionType =
  | 'string'
  | 'number'
  | 'boolean'
  | 'color'
  | 'select'
  | 'record:products'
  | 'record:blogs'
  | 'record:recipes'
  | 'record:people';

export interface TemplateOption {
  key: string;
  type: TemplateOptionType;
  label: string;
  description?: string;
  defaultValue: string | number | boolean;
  options?: { value: string; label: string }[];
  validation?: {
    required?: boolean;
    min?: number;
    max?: number;
    maxLength?: number;
  };
}

export interface TemplateOptionGroup {
  key: string;
  label: string;
  description?: string;
  options: TemplateOption[];
}

// ==================== COMPONENT PROPS ====================

export interface LayoutProps {
  children: React.ReactNode;
  config: TemplateConfig;
  siteName?: string;
  user?: {
    name: string;
    email: string;
    role?: string;
    isPremium?: boolean;
    premiumUntil?: string | null;
  } | null;
  socialLinks?: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
    iconType: 'emoji' | 'lucide' | 'simple-icons';
  }>;
}

export interface HeaderProps {
  config: TemplateConfig;
  siteName?: string;
  user?: {
    name: string;
    email: string;
    role?: string;
    isPremium?: boolean;
    premiumUntil?: string | null;
  } | null;
}

export interface FooterProps {
  config: TemplateConfig;
  siteName?: string;
  socialLinks?: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
    iconType: 'emoji' | 'lucide' | 'simple-icons';
  }>;
}

export interface HomePageProps {
  config: TemplateConfig;
  featuredProduct?: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
  } | null;
  recentRecipes?: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    estimatedTime: number;
    difficulty: 'easy' | 'medium' | 'hard';
    calories?: number | null;
    servings: number;
  }>;
  recentBlogs?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    publishedAt?: Date | null;
  }>;
}

export interface ProductCardProps {
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
  };
}

export interface StorePageProps {
  config: TemplateConfig;
  products: Array<{
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
  }>;
}

export interface RecipeCardProps {
  recipe: {
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    estimatedTime: number;
    calories?: number | null;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    categoryName?: string | null;
    isPremium?: boolean;
  };
}

export interface RecipesPageProps {
  config: TemplateConfig;
  recipes: Array<{
    id: string;
    name: string;
    slug: string;
    description?: string | null;
    imageUrl?: string | null;
    estimatedTime: number;
    calories?: number | null;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    categoryName?: string | null;
    isPremium: boolean;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
  isAuthenticated: boolean;
  isPremium: boolean;
}

interface RecipePreparation {
  id: string;
  title: string;
  order: number;
  steps: Array<{
    id: string;
    instruction: string;
    order: number;
    timerSeconds: number | null;
  }>;
  ingredients: Array<{
    id: string;
    name: string;
    quantity: number;
    unit: string;
    calories: number | null;
    order: number;
  }>;
}

export interface RecipeDetailPageProps {
  config: TemplateConfig;
  recipe: {
    id: string;
    name: string;
    slug: string;
    description: string | null;
    imageUrl: string | null;
    estimatedTime: number;
    calories: number | null;
    servings: number;
    difficulty: 'easy' | 'medium' | 'hard';
    categoryName: string | null;
    isPremium: boolean;
    preparations: RecipePreparation[];
    // For non-premium users, ingredients are provided separately
    allIngredients?: Array<{
      id: string;
      name: string;
      quantity: string;
      unit: string;
    }>;
  };
  isAuthenticated?: boolean;
  isPremium?: boolean;
  mainProductSlug?: string | null;
}

export interface BlogCardProps {
  blog: {
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    categoryName?: string | null;
    categorySlug?: string | null;
    publishedAt?: Date | null;
    isPremium?: boolean;
  };
}

export interface BlogPageProps {
  config: TemplateConfig;
  blogs: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    categoryName?: string | null;
    categorySlug?: string | null;
    publishedAt?: Date | null;
    isPremium?: boolean;
  }>;
  categories: Array<{
    id: string;
    name: string;
    slug: string;
  }>;
}

export interface BlogDetailPageProps {
  config: TemplateConfig;
  blog: {
    id: string;
    title: string;
    slug: string;
    content: string;
    excerpt?: string | null;
    coverImage?: string | null;
    categoryName?: string | null;
    categorySlug?: string | null;
    publishedAt?: Date | null;
    isPremium?: boolean;
  };
  relatedBlogs?: Array<{
    id: string;
    title: string;
    slug: string;
    excerpt?: string | null;
    coverImage?: string | null;
    publishedAt?: Date | null;
  }>;
  isAuthenticated?: boolean;
  isPremium?: boolean;
}

export interface LinksPageProps {
  config: TemplateConfig;
  links: Array<{
    id: string;
    title: string;
    url: string;
    icon: string;
    iconType: 'emoji' | 'lucide' | 'simple-icons';
  }>;
  siteName?: string;
}

export interface LoginPageProps {
  config: TemplateConfig;
}

export interface RegisterPageProps {
  config: TemplateConfig;
}

export interface CheckoutPageProps {
  config: TemplateConfig;
  product: {
    id: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string | null;
  } | null;
  isAuthenticated?: boolean;
  isPremium?: boolean;
}

export interface CheckoutResultPageProps {
  config: TemplateConfig;
  statusType: 'approved' | 'pending' | 'failure' | 'unknown';
  payment?: {
    id: string;
    status: string;
    transactionAmount: number;
    currencyId: string;
    paymentMethodId?: string;
    payerEmail?: string;
  } | null;
  purchaseCode?: string | null;
  productSlug?: string | null;
  downloadToken?: string | null;
  showRegister?: boolean;
}

export interface MyPurchasesPageProps {
  config: TemplateConfig;
  isAuthenticated: boolean;
  purchases: Array<{
    id: string;
    productName: string;
    productSlug: string;
    productImageUrl?: string | null;
    amount: number;
    currency: string;
    status: string;
    purchaseCode: string;
    createdAt: string;
    downloadLinks: Array<{
      token: string;
      downloadCount: number;
      maxDownloads: number;
      expiresAt: string;
    }>;
  }>;
}

// ==================== TEMPLATE COMPONENTS ====================

export interface TemplateComponents {
  Layout: ComponentType<LayoutProps>;
  Header: ComponentType<HeaderProps>;
  Footer: ComponentType<FooterProps>;
  HomePage: ComponentType<HomePageProps>;
  ProductCard: ComponentType<ProductCardProps>;
  StorePage: ComponentType<StorePageProps>;
  RecipeCard: ComponentType<RecipeCardProps>;
  RecipesPage: ComponentType<RecipesPageProps>;
  RecipeDetailPage: ComponentType<RecipeDetailPageProps>;
  BlogCard: ComponentType<BlogCardProps>;
  BlogPage: ComponentType<BlogPageProps>;
  BlogDetailPage: ComponentType<BlogDetailPageProps>;
  LinksPage: ComponentType<LinksPageProps>;
  LoginPage: ComponentType<LoginPageProps>;
  RegisterPage: ComponentType<RegisterPageProps>;
  CheckoutPage: ComponentType<CheckoutPageProps>;
  CheckoutResultPage: ComponentType<CheckoutResultPageProps>;
  MyPurchasesPage: ComponentType<MyPurchasesPageProps>;
  NotFoundPage: ComponentType<{ config: TemplateConfig }>;
}

// ==================== TEMPLATE CONFIG ====================

export interface TemplateConfig {
  // Values loaded from templateConfigs table
  [key: string]: string | number | boolean | undefined;
}

// ==================== TEMPLATE ROUTES ====================

export type TemplatePage = 'home' | 'store' | 'recipes' | 'recipeDetail' | 'blog' | 'blogDetail' | 'links' | 'login' | 'register' | 'checkout' | 'checkoutResult' | 'myPurchases' | 'notFound';

export interface TemplateRoute {
  path: string;
  page: TemplatePage;
  title: string;
  description?: string;
}

// ==================== TEMPLATE MANIFEST ====================

export interface TemplateManifest {
  id: string;
  name: string;
  description: string;
  version: string;
  author: string;
  thumbnail?: string;

  // Routes supported by this template
  routes: TemplateRoute[];

  // Grouped options for admin UI
  optionGroups: TemplateOptionGroup[];

  // Components provided by this template
  components: TemplateComponents;

  // Whether this template supports dark mode
  supportsDarkMode: boolean;
}

// ==================== HELPER TYPES ====================

export type TemplateId = string;

export interface TemplateContextValue {
  template: TemplateManifest;
  config: TemplateConfig;
  components: TemplateComponents;
}

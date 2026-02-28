import { TemplateProvider, useTemplate } from '@/templates/context';
import { TemplateStyles } from './TemplateStyles';
import type { TemplateConfig, LayoutProps } from '@/templates/types';

interface StorefrontProps {
  templateId: string;
  templateConfig: Record<string, string>;
  page: string;
  pageProps: Record<string, unknown>;
  siteName?: string;
  isAuthenticated?: boolean;
  user?: {
    name: string;
    email: string;
    role?: string;
    isPremium?: boolean;
    premiumUntil?: string | null;
  } | null;
}

export function Storefront({
  templateId,
  templateConfig,
  page,
  pageProps,
  siteName,
  isAuthenticated = false,
  user = null,
}: StorefrontProps) {
  return (
    <TemplateProvider templateId={templateId} configOverrides={templateConfig}>
      <TemplateStyles />
      <StorefrontContent
        page={page}
        pageProps={pageProps}
        siteName={siteName}
        isAuthenticated={isAuthenticated}
        user={user}
      />
    </TemplateProvider>
  );
}

interface StorefrontContentProps {
  page: string;
  pageProps: Record<string, unknown>;
  siteName?: string;
  isAuthenticated: boolean;
  user?: {
    name: string;
    email: string;
    role?: string;
    isPremium?: boolean;
    premiumUntil?: string | null;
  } | null;
}

function StorefrontContent({
  page,
  pageProps,
  siteName,
  isAuthenticated,
  user,
}: StorefrontContentProps) {
  const { components, config } = useTemplate();
  const { Layout, Header, Footer } = components;

  // Get the page component
  const PageComponent = getPageComponent(page, components);

  if (!PageComponent) {
    return (
      <Layout config={config} siteName={siteName} user={user}>
        <div className="container mx-auto px-4 py-12 text-center">
          <h1 className="text-2xl font-bold">Página no encontrada</h1>
          <p className="text-gray-600 mt-2">La página "{page}" no existe.</p>
        </div>
      </Layout>
    );
  }

  // Inject additional props
  const enhancedProps = {
    ...pageProps,
    config,
    siteName,
    isAuthenticated,
  };

  // Get social links from pageProps if available
  const socialLinks = pageProps.socialLinks as LayoutProps['socialLinks'];

  return (
    <Layout config={config} siteName={siteName} socialLinks={socialLinks} user={user}>
      <PageComponent {...enhancedProps} />
    </Layout>
  );
}

function getPageComponent(
  page: string,
  components: ReturnType<typeof useTemplate>['components']
) {
  const pageMap: Record<string, React.ComponentType<any>> = {
    home: components.HomePage,
    store: components.StorePage,
    recipes: components.RecipesPage,
    recipeDetail: components.RecipeDetailPage,
    blog: components.BlogPage,
    blogDetail: components.BlogDetailPage,
    links: components.LinksPage,
    login: components.LoginPage,
    register: components.RegisterPage,
    checkout: components.CheckoutPage,
    checkoutResult: components.CheckoutResultPage,
    myPurchases: components.MyPurchasesPage,
    notFound: components.NotFoundPage,
  };

  return pageMap[page];
}

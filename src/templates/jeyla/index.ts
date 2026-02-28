import type { TemplateManifest } from '../types';

// Placeholder components - will be replaced with actual implementations
import { Layout } from './components/Layout';
import { Header } from './components/Header';
import { Footer } from './components/Footer';
import { HomePage } from './components/HomePage';
import { ProductCard } from './components/ProductCard';
import { StorePage } from './components/StorePage';
import { RecipeCard } from './components/RecipeCard';
import { RecipesPage } from './components/RecipesPage';
import { BlogCard } from './components/BlogCard';
import { BlogPage } from './components/BlogPage';
import { BlogDetailPage } from './components/BlogDetailPage';
import { LinksPage } from './components/LinksPage';
import { RecipeDetailPage } from './components/RecipeDetailPage';
import { LoginPage } from './components/LoginPage';
import { RegisterPage } from './components/RegisterPage';
import { CheckoutPage } from './components/CheckoutPage';
import { CheckoutResultPage } from './components/CheckoutResultPage';
import { MyPurchasesPage } from './components/MyPurchasesPage';
import { NotFoundPage } from './components/NotFoundPage';

// Email templates
export { default as JeylaPurchaseConfirmationEmail } from './emails/purchase-confirmation';
export type { JeylaPurchaseConfirmationEmailProps } from './emails/purchase-confirmation';

export const manifest: TemplateManifest = {
  id: 'jeyla',
  name: 'Jeyla',
  description: 'Template for fitness & wellness content creators',
  version: '1.0.0',
  author: 'Team',
  thumbnail: '/templates/jeyla/preview.png',
  supportsDarkMode: false, // Always light mode

  routes: [
    { path: '/', page: 'home', title: 'Inicio', description: 'Tu espacio de bienestar y fitness' },
    { path: '/recipes', page: 'recipes', title: 'Recetas', description: 'Recetas saludables para tu bienestar' },
    { path: '/recipes/:slug', page: 'recipeDetail', title: 'Receta', description: 'Detalle de receta' },
    { path: '/blog', page: 'blog', title: 'Blog', description: 'Artículos sobre fitness, nutrición y bienestar' },
    { path: '/blog/:slug', page: 'blogDetail', title: 'Artículo', description: 'Detalle de artículo' },
    { path: '/links', page: 'links', title: 'Enlaces', description: 'Sígueme en redes sociales' },
    { path: '/login', page: 'login', title: 'Iniciar Sesión', description: 'Accede a tu cuenta' },
    { path: '/register', page: 'register', title: 'Crear Cuenta', description: 'Regístrate con tu código de compra' },
    { path: '/checkout/result', page: 'checkoutResult', title: 'Resultado', description: 'Resultado de tu compra' },
    { path: '/checkout/:slug', page: 'checkout', title: 'Checkout', description: 'Completa tu compra' },
    { path: '/my-purchases', page: 'myPurchases', title: 'Mis Compras', description: 'Historial de compras y descargas' },
  ],

  optionGroups: [
    {
      key: 'appearance',
      label: 'Apariencia',
      description: 'Colores y tipografía',
      options: [
        {
          key: 'primaryColor',
          type: 'color',
          label: 'Color primario',
          description: 'Color principal del sitio (formato HSL)',
          defaultValue: '0 0% 9%',
        },
        {
          key: 'accentColor',
          type: 'color',
          label: 'Color de acento',
          description: 'Color para destacar elementos',
          defaultValue: '340 80% 60%',
        },
        {
          key: 'fontFamily',
          type: 'select',
          label: 'Fuente',
          description: 'Tipografía principal del sitio',
          defaultValue: 'inter',
          options: [
            { value: 'inter', label: 'Inter' },
            { value: 'poppins', label: 'Poppins' },
            { value: 'nunito', label: 'Nunito' },
            { value: 'montserrat', label: 'Montserrat' },
          ],
        },
      ],
    },
    {
      key: 'pastelColors',
      label: 'Colores Pastel',
      description: 'Paleta de colores pasteles para la landing',
      options: [
        {
          key: 'pastelPink',
          type: 'string',
          label: 'Rosa Pastel',
          description: 'Color principal para hero y cards',
          defaultValue: '#FFD6E8',
        },
        {
          key: 'pastelPeach',
          type: 'string',
          label: 'Melocotón',
          description: 'Acentos y secciones alternas',
          defaultValue: '#FFDAB9',
        },
        {
          key: 'pastelMint',
          type: 'string',
          label: 'Menta Claro',
          description: 'Elementos secundarios y hover states',
          defaultValue: '#C7EAE4',
        },
        {
          key: 'pastelLavender',
          type: 'string',
          label: 'Lavanda',
          description: 'Backgrounds sutiles',
          defaultValue: '#E6E6FA',
        },
        {
          key: 'pastelCream',
          type: 'string',
          label: 'Crema',
          description: 'Fondos neutrales',
          defaultValue: '#FFF8E7',
        },
        {
          key: 'pastelGreenMint',
          type: 'string',
          label: 'Verde Menta',
          description: 'CTAs principales y botones',
          defaultValue: '#B8E6B8',
        },
        {
          key: 'pastelTextDark',
          type: 'string',
          label: 'Texto Oscuro',
          description: 'Títulos y texto principal',
          defaultValue: '#5A4A42',
        },
        {
          key: 'pastelTextMedium',
          type: 'string',
          label: 'Texto Medio',
          description: 'Subtítulos y descripciones',
          defaultValue: '#8B7D77',
        },
      ],
    },
    {
      key: 'hero',
      label: 'Sección Hero',
      description: 'Configuración de la sección principal del home',
      options: [
        {
          key: 'heroProductId',
          type: 'record:products',
          label: 'Producto destacado',
          description: 'Producto a mostrar en el hero del home',
          defaultValue: '',
        },
        {
          key: 'heroTitle',
          type: 'string',
          label: 'Título',
          description: 'Título principal del hero',
          defaultValue: '',
          validation: { maxLength: 100 },
        },
        {
          key: 'heroSubtitle',
          type: 'string',
          label: 'Subtítulo',
          description: 'Texto secundario del hero',
          defaultValue: '',
          validation: { maxLength: 200 },
        },
      ],
    },
    {
      key: 'home',
      label: 'Página de Inicio',
      description: 'Secciones visibles en el home',
      options: [
        {
          key: 'showRecipesOnHome',
          type: 'boolean',
          label: 'Mostrar recetas',
          description: 'Muestra una sección de recetas recientes',
          defaultValue: true,
        },
        {
          key: 'showBlogOnHome',
          type: 'boolean',
          label: 'Mostrar blog',
          description: 'Muestra una sección de artículos recientes',
          defaultValue: true,
        },
        {
          key: 'recipesHomeLimit',
          type: 'number',
          label: 'Cantidad de recetas',
          description: 'Número de recetas a mostrar en el home',
          defaultValue: 3,
          validation: { min: 1, max: 6 },
        },
        {
          key: 'blogsHomeLimit',
          type: 'number',
          label: 'Cantidad de blogs',
          description: 'Número de artículos a mostrar en el home',
          defaultValue: 3,
          validation: { min: 1, max: 6 },
        },
      ],
    },
    {
      key: 'footer',
      label: 'Footer',
      description: 'Pie de página',
      options: [
        {
          key: 'footerText',
          type: 'string',
          label: 'Texto del footer',
          description: 'Texto adicional en el pie de página',
          defaultValue: '',
          validation: { maxLength: 200 },
        },
        {
          key: 'showNewsletter',
          type: 'boolean',
          label: 'Mostrar newsletter',
          description: 'Muestra el formulario de suscripción',
          defaultValue: true,
        },
      ],
    },
  ],

  components: {
    Layout,
    Header,
    Footer,
    HomePage,
    ProductCard,
    StorePage,
    RecipeCard,
    RecipesPage,
    RecipeDetailPage,
    BlogCard,
    BlogPage,
    BlogDetailPage,
    LinksPage,
    LoginPage,
    RegisterPage,
    CheckoutPage,
    CheckoutResultPage,
    MyPurchasesPage,
    NotFoundPage,
  },
};

export default manifest;

# Jeyla Template

A template designed for fitness and wellness content creators.

## Overview

The Jeyla template is optimized for selling digital products (like ebooks, workout programs) while showcasing recipes and blog content. It features a clean, modern design with a pastel color palette that's always in light mode.

## Features

- **Store**: Product showcase with featured hero product
- **Recipes**: Public and private recipes (login required for exclusive content)
- **Blog**: Articles with category filtering
- **Links**: LinkTree-style page for social media links
- **Newsletter**: Optional newsletter signup in home page
- **Login/Register**: Styled authentication pages

## Pages

| Page | Route | Description |
|------|-------|-------------|
| Home | `/` | Hero section with featured product, recent recipes, blog posts, and newsletter |
| Store | `/store` | Grid of all available products |
| Product Detail | `/store/[slug]` | Individual product page with checkout |
| Recipes | `/recipes` | Recipe grid with category filter. Shows public recipes to all users, exclusive recipes only to logged-in users |
| Recipe Detail | `/recipes/[slug]` | Full recipe with ingredients and steps |
| Blog | `/blog` | Blog posts grid with category filter |
| Blog Post | `/blog/[slug]` | Individual blog post |
| Links | `/links` | Social media and external links |
| Login | `/login` | Authentication page with login/register tabs |

## Components

### Layout Components

- `Layout.tsx` - Main wrapper with header, footer, and content area
- `Header.tsx` - Navigation bar with main links
- `Footer.tsx` - Footer with social links and copyright

### Page Components

- `HomePage.tsx` - Home page with hero, recipes, blog sections, and newsletter
- `StorePage.tsx` - Product grid
- `RecipesPage.tsx` - Recipe grid with authentication-aware filtering
- `RecipeDetailPage.tsx` - Full recipe view with preparations
- `BlogPage.tsx` - Blog posts grid with category filter
- `LinksPage.tsx` - LinkTree-style links display
- `LoginPage.tsx` - Authentication page with styled forms

### Card Components

- `ProductCard.tsx` - Product display card
- `RecipeCard.tsx` - Recipe display card with difficulty badge
- `BlogCard.tsx` - Blog post display card with category and date
- `DynamicIcon.tsx` - Dynamic icon renderer (emoji, simple-icons)

### UI Components (Styled Form Elements)

Located in `components/ui/styled-form.tsx`. These components provide consistent styling across all forms (newsletter, login, register) with pastel theme support.

#### StyledInput

Input field with pastel styling and optional icon.

```tsx
import { StyledInput, FormIcons } from './ui/styled-form';

<StyledInput
  type="email"
  placeholder="tu@email.com"
  value={email}
  onChange={(e) => setEmail(e.target.value)}
  colors={colors}
  icon={FormIcons.email}
/>
```

**Props:**
- `colors?: StyledFormColors` - Custom pastel colors
- `icon?: React.ReactNode` - Icon to display on the left
- All standard input attributes

#### StyledButton

Button with gradient background and loading state.

```tsx
import { StyledButton } from './ui/styled-form';

<StyledButton
  type="submit"
  disabled={isLoading}
  isLoading={isLoading}
  loadingText="Enviando..."
  colors={colors}
  variant="primary" // or "secondary"
>
  Enviar
</StyledButton>
```

**Props:**
- `colors?: StyledFormColors` - Custom pastel colors
- `variant?: 'primary' | 'secondary'` - Button style (pink/peach or mint/green gradient)
- `isLoading?: boolean` - Show loading spinner
- `loadingText?: string` - Text to show while loading

#### StyledLabel

Label with pastel text color.

```tsx
import { StyledLabel } from './ui/styled-form';

<StyledLabel colors={colors}>Email</StyledLabel>
```

#### StyledError / StyledSuccess

Styled alert messages.

```tsx
import { StyledError, StyledSuccess } from './ui/styled-form';

{error && <StyledError message={error} />}
{success && <StyledSuccess message={success} colors={colors} />}
```

#### FormIcons

Pre-defined SVG icons for common form fields.

```tsx
import { FormIcons } from './ui/styled-form';

FormIcons.email    // Mail icon
FormIcons.password // Lock icon
FormIcons.user     // Person icon
FormIcons.check    // Checkmark icon
FormIcons.code     // Terminal/code icon
```

#### StyledFormColors Interface

```tsx
interface StyledFormColors {
  pink?: string;      // Primary gradient color
  peach?: string;     // Secondary gradient color
  mint?: string;      // Success/accent color
  greenMint?: string; // Secondary button color
  textDark?: string;  // Dark text color
  textMedium?: string; // Medium text color
}
```

## Configuration Options

### Appearance Group

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `primaryColor` | color | `0 0% 9%` | Primary color in HSL format |
| `accentColor` | color | `340 80% 60%` | Accent color for highlights |
| `fontFamily` | select | `inter` | Main font family |

### Pastel Colors Group

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `pastelPink` | string | `#FFD6E8` | Primary pink for heroes and cards |
| `pastelPeach` | string | `#FFDAB9` | Accent sections |
| `pastelMint` | string | `#C7EAE4` | Secondary elements and hover |
| `pastelLavender` | string | `#E6E6FA` | Subtle backgrounds |
| `pastelCream` | string | `#FFF8E7` | Neutral backgrounds |
| `pastelGreenMint` | string | `#B8E6B8` | CTAs and primary buttons |
| `pastelTextDark` | string | `#5A4A42` | Titles and main text |
| `pastelTextMedium` | string | `#8B7D77` | Subtitles and descriptions |

### Hero Group

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `heroProductId` | record:products | - | Product to feature in hero section |
| `heroTitle` | string | - | Hero section title |
| `heroSubtitle` | string | - | Hero section subtitle |

### Home Group

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `showRecipesOnHome` | boolean | `true` | Show recent recipes section |
| `showBlogOnHome` | boolean | `true` | Show recent blog posts section |
| `recipesHomeLimit` | number | `3` | Number of recipes to show |
| `blogsHomeLimit` | number | `3` | Number of blog posts to show |

### Footer Group

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `footerText` | string | - | Additional footer text |
| `showNewsletter` | boolean | `true` | Show newsletter signup form |

## Dark Mode

This template does **not** support dark mode. It always displays in light mode regardless of system preferences.

## Recipe Visibility

Recipes have an `isPremium` field:
- `false`: Visible to all visitors (public recipes)
- `true`: Only visible to logged-in users (premium content)

This allows creators to offer free public recipes while keeping premium recipes for registered users.

## File Structure

```
jeyla/
├── index.ts          # Template manifest with options
├── README.md         # This file
└── components/
    ├── Layout.tsx
    ├── Header.tsx
    ├── Footer.tsx
    ├── HomePage.tsx
    ├── ProductCard.tsx
    ├── FeaturedProduct.tsx
    ├── StorePage.tsx
    ├── RecipeCard.tsx
    ├── RecipesPage.tsx
    ├── RecipeDetailPage.tsx
    ├── RecipeView.tsx
    ├── BlogCard.tsx
    ├── BlogPage.tsx
    ├── LinksPage.tsx
    ├── LoginPage.tsx
    ├── DynamicIcon.tsx
    └── ui/
        └── styled-form.tsx  # Styled form components
```

## Customization

To create a new template based on Jeyla:

1. Copy the `jeyla/` folder to a new folder (e.g., `my-template/`)
2. Update the manifest in `index.ts` with new ID, name, and options
3. Modify components as needed
4. Register the template in `src/templates/index.ts`

## Future Improvements

- [ ] Add more font options
- [ ] Add hero image background option
- [ ] Add social media icons in header
- [ ] Add testimonials section
- [ ] Add about page template

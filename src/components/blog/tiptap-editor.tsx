import { useState, useEffect } from 'react';
import { useEditor, EditorContent } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import Image from '@tiptap/extension-image';
import Link from '@tiptap/extension-link';
import Placeholder from '@tiptap/extension-placeholder';
import TextAlign from '@tiptap/extension-text-align';
import { ProductCard } from './extensions/product-card';
import { BlogCard } from './extensions/blog-card';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Bold,
  Italic,
  Strikethrough,
  Code,
  Heading1,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Link as LinkIcon,
  Image as ImageIcon,
  Minus,
  ExternalLink,
  Loader2,
  ShoppingBag,
  FileText,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
} from 'lucide-react';

interface TiptapEditorProps {
  content: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

interface ReferralLink {
  id: string;
  title: string;
  slug: string;
  description: string | null;
  image: string | null;
  categoryName: string | null;
}

interface Product {
  id: string;
  name: string;
  slug: string;
  description: string;
  price: number;
  currency: string;
  imageUrl: string | null;
}

interface BlogArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  coverImage: string | null;
}

export function TiptapEditor({ content, onChange, placeholder = 'Escribe el contenido del blog...' }: TiptapEditorProps) {
  const [referralLinks, setReferralLinks] = useState<ReferralLink[]>([]);
  const [isLoadingLinks, setIsLoadingLinks] = useState(false);
  const [referralPopoverOpen, setReferralPopoverOpen] = useState(false);
  const [selectedReferralLink, setSelectedReferralLink] = useState<ReferralLink | null>(null);

  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  const [productPopoverOpen, setProductPopoverOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const [blogs, setBlogs] = useState<BlogArticle[]>([]);
  const [isLoadingBlogs, setIsLoadingBlogs] = useState(false);
  const [blogPopoverOpen, setBlogPopoverOpen] = useState(false);
  const [selectedBlog, setSelectedBlog] = useState<BlogArticle | null>(null);

  useEffect(() => {
    if (referralPopoverOpen && referralLinks.length === 0) {
      fetchReferralLinks();
    }
  }, [referralPopoverOpen]);

  useEffect(() => {
    if (productPopoverOpen && products.length === 0) {
      fetchProducts();
    }
  }, [productPopoverOpen]);

  useEffect(() => {
    if (blogPopoverOpen && blogs.length === 0) {
      fetchBlogs();
    }
  }, [blogPopoverOpen]);

  const fetchReferralLinks = async () => {
    setIsLoadingLinks(true);
    try {
      const res = await fetch('/api/referral-links?onlyActive=true');
      const data = await res.json() as { links?: ReferralLink[] };
      setReferralLinks(data.links || []);
    } catch (err) {
      console.error('Error fetching referral links:', err);
    } finally {
      setIsLoadingLinks(false);
    }
  };

  const fetchProducts = async () => {
    setIsLoadingProducts(true);
    try {
      const res = await fetch('/api/products');
      const data = await res.json() as { products?: Product[] };
      setProducts(data.products || []);
    } catch (err) {
      console.error('Error fetching products:', err);
    } finally {
      setIsLoadingProducts(false);
    }
  };

  const fetchBlogs = async () => {
    setIsLoadingBlogs(true);
    try {
      const res = await fetch('/api/blogs');
      const data = await res.json() as { blogs?: BlogArticle[] };
      setBlogs(data.blogs || []);
    } catch (err) {
      console.error('Error fetching blogs:', err);
    } finally {
      setIsLoadingBlogs(false);
    }
  };

  const formatPrice = (price: number, currency: string) => {
    return new Intl.NumberFormat('es-ES', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(price / 100);
  };

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        heading: {
          levels: [1, 2, 3],
        },
      }),
      Image.configure({
        HTMLAttributes: {
          class: 'rounded-lg max-w-full',
        },
      }),
      Link.configure({
        openOnClick: false,
        HTMLAttributes: {
          class: 'text-primary underline',
        },
      }),
      Placeholder.configure({
        placeholder,
      }),
      TextAlign.configure({
        types: ['heading', 'paragraph'],
      }),
      ProductCard,
      BlogCard,
    ],
    content,
    onUpdate: ({ editor }) => {
      onChange(editor.getHTML());
    },
    editorProps: {
      attributes: {
        class: 'prose prose-sm sm:prose dark:prose-invert max-w-none min-h-[300px] p-4 focus:outline-none',
      },
      handleClick: (_view, _pos, event) => {
        // Prevent link navigation in editor
        const target = event.target as HTMLElement;
        if (target.tagName === 'A' || target.closest('a')) {
          event.preventDefault();
          return true;
        }
        return false;
      },
    },
  });

  if (!editor) {
    return null;
  }

  const addImage = () => {
    const url = window.prompt('URL de la imagen:');
    if (url) {
      editor.chain().focus().setImage({ src: url }).run();
    }
  };

  const addLink = () => {
    const previousUrl = editor.getAttributes('link').href;
    const url = window.prompt('URL del enlace:', previousUrl);

    if (url === null) {
      return;
    }

    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run();
      return;
    }

    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run();
  };

  const insertReferralLink = (link: ReferralLink, type: 'inline' | 'button') => {
    const referralUrl = `/r/${link.slug}`;

    if (type === 'inline') {
      // Insert as a simple inline link with a trailing space to exit the link
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: referralUrl,
                  target: '_blank',
                  rel: 'noopener noreferrer nofollow',
                },
              },
            ],
            text: link.title,
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();
    } else {
      // Insert as a styled button block
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'paragraph',
            content: [
              {
                type: 'text',
                marks: [
                  {
                    type: 'link',
                    attrs: {
                      href: referralUrl,
                      target: '_blank',
                      rel: 'noopener noreferrer nofollow',
                      class: 'referral-button',
                    },
                  },
                ],
                text: `👉 ${link.title}`,
              },
            ],
          },
        ])
        .run();
    }

    setSelectedReferralLink(null);
    setReferralPopoverOpen(false);
  };

  const insertProduct = (product: Product, type: 'inline' | 'card-square' | 'card-horizontal') => {
    const productUrl = `/products/${product.slug}`;
    const priceFormatted = formatPrice(product.price, product.currency);

    if (type === 'inline') {
      // Insert as a simple inline link with a trailing space to exit the link
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: productUrl,
                },
              },
            ],
            text: product.name,
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();
    } else {
      // Insert as a product card with empty lines above and below
      editor
        .chain()
        .focus()
        .insertContent([
          { type: 'paragraph' },
          {
            type: 'productCard',
            attrs: {
              productId: product.id,
              productUrl,
              productName: product.name,
              productPrice: priceFormatted,
              productImage: product.imageUrl || null,
              cardType: type === 'card-square' ? 'square' : 'horizontal',
            },
          },
          { type: 'paragraph' },
        ])
        .run();
    }

    setSelectedProduct(null);
    setProductPopoverOpen(false);
  };

  const insertBlog = (blog: BlogArticle, type: 'inline' | 'card-square' | 'card-horizontal') => {
    const blogUrl = `/blog/${blog.slug}`;

    if (type === 'inline') {
      // Insert as a simple inline link with a trailing space to exit the link
      editor
        .chain()
        .focus()
        .insertContent([
          {
            type: 'text',
            marks: [
              {
                type: 'link',
                attrs: {
                  href: blogUrl,
                },
              },
            ],
            text: blog.title,
          },
          {
            type: 'text',
            text: ' ',
          },
        ])
        .run();
    } else {
      // Insert as a blog card with empty lines above and below
      editor
        .chain()
        .focus()
        .insertContent([
          { type: 'paragraph' },
          {
            type: 'blogCard',
            attrs: {
              blogId: blog.id,
              blogUrl,
              blogTitle: blog.title,
              blogExcerpt: blog.excerpt || null,
              blogImage: blog.coverImage || null,
              cardType: type === 'card-square' ? 'square' : 'horizontal',
            },
          },
          { type: 'paragraph' },
        ])
        .run();
    }

    setSelectedBlog(null);
    setBlogPopoverOpen(false);
  };

  return (
    <div className="border rounded-lg overflow-hidden bg-background">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 p-2 border-b bg-muted/50">
        {/* Text formatting */}
        <Button
          type="button"
          variant={editor.isActive('bold') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBold().run()}
        >
          <Bold className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('italic') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleItalic().run()}
        >
          <Italic className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('strike') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleStrike().run()}
        >
          <Strikethrough className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('code') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleCode().run()}
        >
          <Code className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Headings */}
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 1 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 1 }).run()}
        >
          <Heading1 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 2 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
        >
          <Heading2 className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('heading', { level: 3 }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
        >
          <Heading3 className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Lists */}
        <Button
          type="button"
          variant={editor.isActive('bulletList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBulletList().run()}
        >
          <List className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive('orderedList') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleOrderedList().run()}
        >
          <ListOrdered className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Text alignment */}
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'left' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('left').run()}
          title="Alinear a la izquierda"
        >
          <AlignLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'center' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('center').run()}
          title="Centrar"
        >
          <AlignCenter className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'right' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('right').run()}
          title="Alinear a la derecha"
        >
          <AlignRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant={editor.isActive({ textAlign: 'justify' }) ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setTextAlign('justify').run()}
          title="Justificar"
        >
          <AlignJustify className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Block elements */}
        <Button
          type="button"
          variant={editor.isActive('blockquote') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().toggleBlockquote().run()}
        >
          <Quote className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().setHorizontalRule().run()}
        >
          <Minus className="h-4 w-4" />
        </Button>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Media */}
        <Button
          type="button"
          variant={editor.isActive('link') ? 'secondary' : 'ghost'}
          size="icon"
          className="h-8 w-8"
          onClick={addLink}
        >
          <LinkIcon className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={addImage}
        >
          <ImageIcon className="h-4 w-4" />
        </Button>

        {/* Referral Links */}
        <Popover open={referralPopoverOpen} onOpenChange={(open) => {
          setReferralPopoverOpen(open);
          if (!open) setSelectedReferralLink(null);
        }}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Insertar link referido"
            >
              <ExternalLink className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            {selectedReferralLink ? (
              <>
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">{selectedReferralLink.title}</h4>
                  <p className="text-xs text-muted-foreground">Selecciona el tipo de inserción</p>
                </div>
                <div className="p-3 space-y-2">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertReferralLink(selectedReferralLink, 'inline')}
                  >
                    <div className="font-medium text-sm">Link (inline)</div>
                    <div className="text-xs text-muted-foreground">Inserta como enlace de texto</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertReferralLink(selectedReferralLink, 'button')}
                  >
                    <div className="font-medium text-sm">Botón</div>
                    <div className="text-xs text-muted-foreground">Inserta como botón destacado</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setSelectedReferralLink(null)}
                  >
                    ← Volver
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Links Referidos</h4>
                  <p className="text-xs text-muted-foreground">Selecciona un link para insertar</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingLinks ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : referralLinks.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No hay links referidos activos
                    </div>
                  ) : (
                    <div className="p-1">
                      {referralLinks.map((link) => (
                        <button
                          key={link.id}
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors"
                          onClick={() => setSelectedReferralLink(link)}
                        >
                          <div className="font-medium text-sm">{link.title}</div>
                          {link.categoryName && (
                            <div className="text-xs text-muted-foreground">{link.categoryName}</div>
                          )}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>

        {/* Products */}
        <Popover open={productPopoverOpen} onOpenChange={(open) => {
          setProductPopoverOpen(open);
          if (!open) setSelectedProduct(null);
        }}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Insertar producto"
            >
              <ShoppingBag className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            {selectedProduct ? (
              <>
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">{selectedProduct.name}</h4>
                  <p className="text-xs text-muted-foreground">Selecciona el tipo de inserción</p>
                </div>
                <div className="p-3 space-y-2">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertProduct(selectedProduct, 'inline')}
                  >
                    <div className="font-medium text-sm">Link (inline)</div>
                    <div className="text-xs text-muted-foreground">Inserta como enlace de texto</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertProduct(selectedProduct, 'card-square')}
                  >
                    <div className="font-medium text-sm">Card cuadrado</div>
                    <div className="text-xs text-muted-foreground">Imagen arriba, nombre y precio abajo</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertProduct(selectedProduct, 'card-horizontal')}
                  >
                    <div className="font-medium text-sm">Card rectangular</div>
                    <div className="text-xs text-muted-foreground">Imagen a un lado, nombre y precio al otro</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setSelectedProduct(null)}
                  >
                    ← Volver
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Productos</h4>
                  <p className="text-xs text-muted-foreground">Selecciona un producto para insertar</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingProducts ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : products.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No hay productos activos
                    </div>
                  ) : (
                    <div className="p-1">
                      {products.map((product) => (
                        <button
                          key={product.id}
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-3"
                          onClick={() => setSelectedProduct(product)}
                        >
                          {product.imageUrl && (
                            <img
                              src={product.imageUrl}
                              alt={product.name}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{product.name}</div>
                            <div className="text-xs text-muted-foreground">
                              {formatPrice(product.price, product.currency)}
                            </div>
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>

        {/* Blog Articles */}
        <Popover open={blogPopoverOpen} onOpenChange={(open) => {
          setBlogPopoverOpen(open);
          if (!open) setSelectedBlog(null);
        }}>
          <PopoverTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-8 w-8"
              title="Insertar artículo de blog"
            >
              <FileText className="h-4 w-4" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 p-0" align="start">
            {selectedBlog ? (
              <>
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm truncate">{selectedBlog.title}</h4>
                  <p className="text-xs text-muted-foreground">Selecciona el tipo de inserción</p>
                </div>
                <div className="p-3 space-y-2">
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertBlog(selectedBlog, 'inline')}
                  >
                    <div className="font-medium text-sm">Link (inline)</div>
                    <div className="text-xs text-muted-foreground">Inserta como enlace de texto</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertBlog(selectedBlog, 'card-square')}
                  >
                    <div className="font-medium text-sm">Card cuadrado</div>
                    <div className="text-xs text-muted-foreground">Imagen arriba, título abajo</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors border"
                    onClick={() => insertBlog(selectedBlog, 'card-horizontal')}
                  >
                    <div className="font-medium text-sm">Card rectangular</div>
                    <div className="text-xs text-muted-foreground">Imagen a un lado, título al otro</div>
                  </button>
                  <button
                    type="button"
                    className="w-full text-center px-3 py-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setSelectedBlog(null)}
                  >
                    ← Volver
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="p-3 border-b">
                  <h4 className="font-medium text-sm">Artículos de Blog</h4>
                  <p className="text-xs text-muted-foreground">Selecciona un artículo para insertar</p>
                </div>
                <div className="max-h-64 overflow-y-auto">
                  {isLoadingBlogs ? (
                    <div className="flex items-center justify-center py-6">
                      <Loader2 className="h-5 w-5 animate-spin text-muted-foreground" />
                    </div>
                  ) : blogs.length === 0 ? (
                    <div className="py-6 text-center text-sm text-muted-foreground">
                      No hay artículos publicados
                    </div>
                  ) : (
                    <div className="p-1">
                      {blogs.map((blog) => (
                        <button
                          key={blog.id}
                          type="button"
                          className="w-full text-left px-3 py-2 rounded-md hover:bg-accent transition-colors flex items-center gap-3"
                          onClick={() => setSelectedBlog(blog)}
                        >
                          {blog.coverImage && (
                            <img
                              src={blog.coverImage}
                              alt={blog.title}
                              className="w-10 h-10 object-cover rounded"
                            />
                          )}
                          <div className="flex-1 min-w-0">
                            <div className="font-medium text-sm truncate">{blog.title}</div>
                            {blog.excerpt && (
                              <div className="text-xs text-muted-foreground truncate">{blog.excerpt}</div>
                            )}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </PopoverContent>
        </Popover>

        <div className="w-px h-8 bg-border mx-1" />

        {/* Undo/Redo */}
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().undo().run()}
          disabled={!editor.can().undo()}
        >
          <Undo className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="h-8 w-8"
          onClick={() => editor.chain().focus().redo().run()}
          disabled={!editor.can().redo()}
        >
          <Redo className="h-4 w-4" />
        </Button>
      </div>

      {/* Editor content */}
      <EditorContent editor={editor} />
    </div>
  );
}

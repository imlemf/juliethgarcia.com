
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { FileUpload } from '@/components/admin/file-upload';

interface ProductFormProps {
  mode: 'create' | 'edit';
  initialData?: {
    id?: string;
    name: string;
    slug: string;
    description: string;
    price: number;
    currency: string;
    imageUrl?: string;
    fileKey?: string;
    fileName?: string;
    isActive?: boolean;
  };
}

const ACCEPTED_IMAGE_TYPES = ['image/webp', 'image/jpeg'];
const MAX_IMAGE_SIZE = 512 * 1024; // 512KB

export function ProductForm({ mode, initialData }: ProductFormProps) {
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    slug: initialData?.slug || '',
    description: initialData?.description || '',
    price: initialData?.price ? (initialData.price / 100).toString() : '',
    currency: initialData?.currency || 'COP',
    imageUrl: initialData?.imageUrl || '',
    fileKey: initialData?.fileKey || '',
    fileName: initialData?.fileName || '',
    isActive: initialData?.isActive ?? true,
  });
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(initialData?.imageUrl || null);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState('');

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
      setError('Solo se permiten imágenes JPG o WebP');
      return;
    }
    if (file.size > MAX_IMAGE_SIZE) {
      setError('La imagen no puede superar 512KB');
      return;
    }

    // Validate image dimensions
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);

      if (img.width !== img.height) {
        setError('La imagen debe ser cuadrada');
        return;
      }
      if (img.width < 512 || img.height < 512) {
        setError('La imagen debe ser mínimo 512x512 píxeles');
        return;
      }
      if (img.width > 1024 || img.height > 1024) {
        setError('La imagen debe ser máximo 1024x1024 píxeles');
        return;
      }

      setError('');
      setSelectedImage(file);
      setImagePreview(URL.createObjectURL(file));
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      setError('No se pudo leer la imagen');
    };

    img.src = objectUrl;
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => {
      const updated = { ...prev, [field]: value };

      // Strip decimals when switching to COP
      if (field === 'currency' && value === 'COP' && prev.price.includes('.')) {
        updated.price = Math.round(parseFloat(prev.price)).toString();
      }

      // Auto-generate slug from name
      if (field === 'name' && mode === 'create') {
        updated.slug = value
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, '-')
          .replace(/^-|-$/g, '');
      }

      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);
    setUploadProgress(0);

    try {
      if (!formData.name || !formData.slug || !formData.description || !formData.price) {
        setError('Por favor completa todos los campos requeridos');
        setIsLoading(false);
        return;
      }

      if (mode === 'create' && !selectedFile) {
        setError('Por favor selecciona el archivo digital del producto');
        setIsLoading(false);
        return;
      }

      if (mode === 'create' && !selectedImage) {
        setError('Por favor selecciona una imagen para el producto');
        setIsLoading(false);
        return;
      }

      const priceInCents = Math.round(parseFloat(formData.price) * 100);
      const url = mode === 'create'
        ? '/api/products'
        : `/api/products/${initialData?.id}`;

      // Edit without new file and without new image: send JSON
      if (mode === 'edit' && !selectedFile && !selectedImage) {
        const response = await fetch(url, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: formData.name,
            slug: formData.slug,
            description: formData.description,
            price: priceInCents,
            currency: formData.currency,
            isActive: formData.isActive,
          }),
        });

        if (!response.ok) {
          const data = await response.json() as { error?: string };
          throw new Error(data.error || 'Error al guardar el producto');
        }

        window.location.href = '/admin/products';
        return;
      }

      // Create or Edit with new file/image: send FormData
      const body = new FormData();
      body.append('name', formData.name);
      body.append('slug', formData.slug);
      body.append('description', formData.description);
      body.append('price', priceInCents.toString());
      body.append('currency', formData.currency);
      body.append('isActive', formData.isActive.toString());
      if (selectedFile) body.append('file', selectedFile);
      if (selectedImage) body.append('image', selectedImage);

      const method = mode === 'create' ? 'POST' : 'PATCH';
      const xhr = new XMLHttpRequest();

      xhr.upload.addEventListener('progress', (ev) => {
        if (ev.lengthComputable) {
          setUploadProgress((ev.loaded / ev.total) * 100);
        }
      });

      const response = await new Promise<{ ok: boolean; data: any }>((resolve, reject) => {
        xhr.addEventListener('load', () => {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve({ ok: xhr.status >= 200 && xhr.status < 300, data });
          } catch {
            reject(new Error('Error al procesar la respuesta'));
          }
        });
        xhr.addEventListener('error', () => reject(new Error('Error de red')));
        xhr.open(method, url);
        xhr.send(body);
      });

      if (!response.ok) {
        throw new Error(response.data.error || 'Error al guardar el producto');
      }

      window.location.href = '/admin/products';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar el producto');
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre del producto *</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="Mi Producto Digital"
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="slug">Slug (URL) *</Label>
          <Input
            id="slug"
            value={formData.slug}
            onChange={(e) => handleInputChange('slug', e.target.value)}
            placeholder="mi-producto-digital"
            required
            disabled={isLoading}
          />
          <p className="text-xs text-muted-foreground">
            Solo letras minúsculas, números y guiones
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Descripción *</Label>
        <textarea
          id="description"
          value={formData.description}
          onChange={(e) => handleInputChange('description', e.target.value)}
          placeholder="Describe tu producto digital..."
          required
          disabled={isLoading}
          className="flex min-h-[120px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
        />
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="price">Precio *</Label>
          <Input
            id="price"
            type="number"
            step={formData.currency === 'COP' ? '1' : '0.01'}
            min="0"
            value={formData.price}
            onChange={(e) => {
              const val = formData.currency === 'COP' ? e.target.value.replace(/\./g, '') : e.target.value;
              handleInputChange('price', val);
            }}
            placeholder={formData.currency === 'COP' ? '10000' : '9.99'}
            required
            disabled={isLoading}
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="currency">Moneda</Label>
          <Select
            value={formData.currency}
            onValueChange={(value) => handleInputChange('currency', value)}
            disabled={isLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Selecciona moneda" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COP">COP - Peso Colombiano</SelectItem>
              <SelectItem value="USD">USD - Dólar</SelectItem>
              <SelectItem value="MXN">MXN - Peso Mexicano</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="image">Imagen del producto {mode === 'create' && '*'}</Label>
        {imagePreview && (
          <div className="relative w-40 h-40 rounded-md overflow-hidden border">
            <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
            {(mode === 'create' || selectedImage) && (
              <button
                type="button"
                onClick={() => {
                  setSelectedImage(null);
                  if (mode === 'create') {
                    setImagePreview(null);
                  } else {
                    // En edit, volver a la imagen original
                    setImagePreview(initialData?.imageUrl || null);
                  }
                }}
                className="absolute top-1 right-1 w-6 h-6 rounded-full bg-destructive text-destructive-foreground flex items-center justify-center text-xs hover:opacity-90"
              >
                &times;
              </button>
            )}
          </div>
        )}
        <Input
          id="image"
          type="file"
          accept="image/webp,image/jpeg,.webp,.jpg,.jpeg"
          onChange={handleImageSelect}
          disabled={isLoading}
        />
        <p className="text-xs text-muted-foreground">
          JPG o WebP cuadrado, 512x512 a 1024x1024 px. Máximo 512KB.
        </p>
      </div>

      <div className="flex items-center gap-3">
        <Switch
          id="isActive"
          checked={formData.isActive}
          onCheckedChange={(checked) => setFormData((prev) => ({ ...prev, isActive: checked }))}
          disabled={isLoading}
        />
        <Label htmlFor="isActive">Producto activo</Label>
      </div>

      <div className="space-y-2">
        {mode === 'edit' && formData.fileName && !selectedFile && (
          <div className="rounded-md border p-3 text-sm text-muted-foreground">
            Archivo actual: <span className="font-medium text-foreground">{formData.fileName}</span>
          </div>
        )}
        <FileUpload
          onFileSelect={setSelectedFile}
          accept=".pdf"
          maxSize={5}
          uploading={isLoading && uploadProgress > 0}
          progress={uploadProgress}
        />
        {mode === 'edit' && (
          <p className="text-xs text-muted-foreground">
            Selecciona un nuevo archivo solo si deseas reemplazar el actual
          </p>
        )}
      </div>

      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="flex gap-4">
        <Button
          type="submit"
          disabled={isLoading}
          className="flex-1"
        >
          {isLoading
            ? uploadProgress > 0 && uploadProgress < 100
              ? 'Subiendo archivo...'
              : 'Guardando...'
            : mode === 'create'
            ? 'Crear producto'
            : 'Guardar cambios'}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => (window.location.href = '/admin/products')}
          disabled={isLoading}
        >
          Cancelar
        </Button>
      </div>
    </form>
  );
}

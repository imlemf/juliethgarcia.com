import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { SimpleEditor } from '@/components/ui/simple-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Upload, X, User, Lock, Globe } from 'lucide-react';
import { generatePersonSlug } from '@/lib/validations/person';

interface Category {
  id: string;
  name: string;
}

interface Title {
  id: string;
  name: string;
}

interface Skill {
  id: string;
  name: string;
  color: string | null;
}

interface PersonSkill {
  skillId: string;
  skillName?: string;
  skillColor?: string | null;
  order: number;
}

interface PersonFormProps {
  personId?: string;
}

export function PersonForm({ personId }: PersonFormProps) {
  const isEditing = !!personId;

  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(isEditing);
  const [error, setError] = useState('');
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // Basic info
  const [name, setName] = useState('');
  const [slug, setSlug] = useState('');
  const [titleId, setTitleId] = useState<string>('');
  const [shortBio, setShortBio] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState('');
  const [avatarFileId, setAvatarFileId] = useState('');
  const [categoryId, setCategoryId] = useState<string>('');
  const [order, setOrder] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  // Contact info
  const [email, setEmail] = useState('');
  const [emailIsPublic, setEmailIsPublic] = useState(true);
  const [phone, setPhone] = useState('');
  const [phoneIsPublic, setPhoneIsPublic] = useState(true);
  const [whatsapp, setWhatsapp] = useState('');
  const [whatsappIsPublic, setWhatsappIsPublic] = useState(true);
  const [website, setWebsite] = useState('');
  const [instagram, setInstagram] = useState('');

  // Skills
  const [personSkills, setPersonSkills] = useState<PersonSkill[]>([]);

  // Options
  const [categories, setCategories] = useState<Category[]>([]);
  const [titles, setTitles] = useState<Title[]>([]);
  const [availableSkills, setAvailableSkills] = useState<Skill[]>([]);

  useEffect(() => {
    fetchOptions();
    if (isEditing) {
      fetchPerson();
    }
  }, [personId]);

  const fetchOptions = async () => {
    try {
      const [catRes, titleRes, skillRes] = await Promise.all([
        fetch('/api/admin/person-categories'),
        fetch('/api/admin/person-titles'),
        fetch('/api/admin/skills'),
      ]);

      if (catRes.ok) {
        const data = await catRes.json() as { categories: Category[] };
        setCategories(data.categories || []);
      }
      if (titleRes.ok) {
        const data = await titleRes.json() as { titles: Title[] };
        setTitles(data.titles || []);
      }
      if (skillRes.ok) {
        const data = await skillRes.json() as { skills: Skill[] };
        setAvailableSkills(data.skills || []);
      }
    } catch (err) {
      console.error('Error fetching options:', err);
    }
  };

  const fetchPerson = async () => {
    setIsFetching(true);
    try {
      const res = await fetch(`/api/admin/people/${personId}`);
      if (!res.ok) throw new Error('Error al cargar persona');
      const data = await res.json() as { person: any };
      const p = data.person;

      setName(p.name);
      setSlug(p.slug);
      setTitleId(p.titleId || '');
      setShortBio(p.shortBio || '');
      setBio(p.bio || '');
      setAvatarUrl(p.avatarUrl || '');
      setAvatarFileId(p.avatarFileId || '');
      setImagePreview(p.avatarUrl || null);
      setCategoryId(p.categoryId || '');
      setOrder(p.order);
      setIsPublished(p.isPublished);

      setEmail(p.email || '');
      setEmailIsPublic(p.emailIsPublic);
      setPhone(p.phone || '');
      setPhoneIsPublic(p.phoneIsPublic);
      setWhatsapp(p.whatsapp || '');
      setWhatsappIsPublic(p.whatsappIsPublic);
      setWebsite(p.website || '');
      setInstagram(p.instagram || '');

      if (p.skills) {
        setPersonSkills(p.skills.map((s: any, idx: number) => ({
          skillId: s.skillId,
          skillName: s.skillName,
          skillColor: s.skillColor,
          order: s.order ?? idx,
        })));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar');
    } finally {
      setIsFetching(false);
    }
  };

  const handleNameChange = (value: string) => {
    setName(value);
    if (!isEditing || !slug) {
      setSlug(generatePersonSlug(value));
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveImage = () => {
    setSelectedImage(null);
    setImagePreview(null);
    setAvatarUrl('');
    setAvatarFileId('');
  };

  const toggleSkill = (skill: Skill) => {
    const exists = personSkills.find((ps) => ps.skillId === skill.id);
    if (exists) {
      setPersonSkills(personSkills.filter((ps) => ps.skillId !== skill.id));
    } else {
      setPersonSkills([
        ...personSkills,
        {
          skillId: skill.id,
          skillName: skill.name,
          skillColor: skill.color,
          order: personSkills.length,
        },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      let finalAvatarUrl = avatarUrl;
      let finalAvatarFileId = avatarFileId;

      // Upload image if selected
      if (selectedImage) {
        const formData = new FormData();
        formData.append('file', selectedImage);
        formData.append('folder', '/personas');

        const uploadRes = await fetch('/api/upload-image', {
          method: 'POST',
          body: formData,
        });

        if (!uploadRes.ok) {
          throw new Error('Error al subir imagen');
        }

        const uploadData = await uploadRes.json() as { url: string; fileId: string };
        finalAvatarUrl = uploadData.url;
        finalAvatarFileId = uploadData.fileId;
      }

      const url = isEditing
        ? `/api/admin/people/${personId}`
        : '/api/admin/people';
      const method = isEditing ? 'PATCH' : 'POST';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          slug,
          titleId: titleId || null,
          shortBio: shortBio || null,
          bio: bio || null,
          avatarUrl: finalAvatarUrl || null,
          avatarFileId: finalAvatarFileId || null,
          categoryId: categoryId || null,
          email: email || null,
          emailIsPublic,
          phone: phone || null,
          phoneIsPublic,
          whatsapp: whatsapp || null,
          whatsappIsPublic,
          website: website || null,
          instagram: instagram || null,
          order,
          isPublished,
          skills: personSkills.map((ps, idx) => ({
            skillId: ps.skillId,
            order: idx,
          })),
        }),
      });

      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al guardar');
      }

      window.location.href = '/admin/people';
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-12">
        <p className="text-muted-foreground">Cargando...</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2 space-y-6">
          <Tabs defaultValue="general" className="w-full">
            <TabsList className="grid w-full grid-cols-3">
              <TabsTrigger value="general">General</TabsTrigger>
              <TabsTrigger value="contact">Contacto</TabsTrigger>
              <TabsTrigger value="skills">Skills</TabsTrigger>
            </TabsList>

            <TabsContent value="general" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información básica</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="name">Nombre *</Label>
                    <Input
                      id="name"
                      value={name}
                      onChange={(e) => handleNameChange(e.target.value)}
                      placeholder="Juan Pérez"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="slug">Slug *</Label>
                    <Input
                      id="slug"
                      value={slug}
                      onChange={(e) => setSlug(e.target.value)}
                      placeholder="juan-perez"
                      required
                    />
                    <p className="text-xs text-muted-foreground">
                      URL: /personas/{slug || 'slug'}
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Título profesional</Label>
                    <Select
                      value={titleId || '__none__'}
                      onValueChange={(v) => setTitleId(v === '__none__' ? '' : v)}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Seleccionar título" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="__none__">Sin título</SelectItem>
                        {titles.map((t) => (
                          <SelectItem key={t.id} value={t.id}>
                            {t.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="shortBio">Descripción corta</Label>
                    <Textarea
                      id="shortBio"
                      value={shortBio}
                      onChange={(e) => setShortBio(e.target.value)}
                      placeholder="Breve descripción para las cards..."
                      rows={2}
                      maxLength={300}
                    />
                    <p className="text-xs text-muted-foreground">
                      {shortBio.length}/300 caracteres
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label>Biografía completa</Label>
                    <SimpleEditor
                      content={bio}
                      onChange={setBio}
                      placeholder="Biografía completa de la persona..."
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Avatar</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-start gap-4">
                    {imagePreview ? (
                      <div className="relative">
                        <img
                          src={imagePreview}
                          alt="Preview"
                          className="h-32 w-32 rounded-full object-cover"
                        />
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute -top-2 -right-2 h-6 w-6"
                          onClick={handleRemoveImage}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ) : (
                      <div className="h-32 w-32 rounded-full bg-muted flex items-center justify-center">
                        <User className="h-12 w-12 text-muted-foreground" />
                      </div>
                    )}
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="avatar">Subir imagen</Label>
                      <Input
                        id="avatar"
                        type="file"
                        accept="image/*"
                        onChange={handleImageSelect}
                      />
                      <p className="text-xs text-muted-foreground">
                        Recomendado: 400x400px, formato cuadrado
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Información de contacto</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="email">Email</Label>
                      <div className="flex items-center gap-2">
                        {emailIsPublic ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={emailIsPublic}
                          onCheckedChange={setEmailIsPublic}
                        />
                        <span className="text-xs text-muted-foreground">Público</span>
                      </div>
                    </div>
                    <Input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="correo@ejemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="phone">Teléfono</Label>
                      <div className="flex items-center gap-2">
                        {phoneIsPublic ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={phoneIsPublic}
                          onCheckedChange={setPhoneIsPublic}
                        />
                        <span className="text-xs text-muted-foreground">Público</span>
                      </div>
                    </div>
                    <Input
                      id="phone"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+57 300 123 4567"
                    />
                  </div>

                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="whatsapp">WhatsApp</Label>
                      <div className="flex items-center gap-2">
                        {whatsappIsPublic ? (
                          <Globe className="h-4 w-4 text-green-500" />
                        ) : (
                          <Lock className="h-4 w-4 text-muted-foreground" />
                        )}
                        <Switch
                          checked={whatsappIsPublic}
                          onCheckedChange={setWhatsappIsPublic}
                        />
                        <span className="text-xs text-muted-foreground">Público</span>
                      </div>
                    </div>
                    <Input
                      id="whatsapp"
                      value={whatsapp}
                      onChange={(e) => setWhatsapp(e.target.value)}
                      placeholder="573001234567"
                    />
                    <p className="text-xs text-muted-foreground">
                      Número completo con código de país, sin + ni espacios
                    </p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Redes sociales</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="website">Sitio web</Label>
                    <Input
                      id="website"
                      type="url"
                      value={website}
                      onChange={(e) => setWebsite(e.target.value)}
                      placeholder="https://ejemplo.com"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="instagram">Instagram</Label>
                    <Input
                      id="instagram"
                      value={instagram}
                      onChange={(e) => setInstagram(e.target.value)}
                      placeholder="@usuario"
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="skills" className="space-y-6 mt-6">
              <Card>
                <CardHeader>
                  <CardTitle>Skills asignados</CardTitle>
                </CardHeader>
                <CardContent>
                  {personSkills.length > 0 ? (
                    <div className="flex flex-wrap gap-2 mb-4">
                      {personSkills.map((ps) => (
                        <Badge
                          key={ps.skillId}
                          style={{
                            backgroundColor: ps.skillColor || '#3b82f6',
                            color: '#fff',
                          }}
                          className="cursor-pointer"
                          onClick={() => {
                            const skill = availableSkills.find(
                              (s) => s.id === ps.skillId
                            );
                            if (skill) toggleSkill(skill);
                          }}
                        >
                          {ps.skillName} ×
                        </Badge>
                      ))}
                    </div>
                  ) : (
                    <p className="text-muted-foreground text-sm mb-4">
                      No hay skills asignados
                    </p>
                  )}

                  <div className="border-t pt-4">
                    <Label className="mb-3 block">Skills disponibles</Label>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {availableSkills.map((skill) => {
                        const isSelected = personSkills.some(
                          (ps) => ps.skillId === skill.id
                        );
                        return (
                          <div
                            key={skill.id}
                            className={`flex items-center gap-2 p-2 rounded border cursor-pointer transition-colors ${
                              isSelected
                                ? 'border-primary bg-primary/5'
                                : 'hover:bg-muted'
                            }`}
                            onClick={() => toggleSkill(skill)}
                          >
                            <Checkbox checked={isSelected} readOnly />
                            <div
                              className="h-3 w-3 rounded-full"
                              style={{ backgroundColor: skill.color || '#3b82f6' }}
                            />
                            <span className="text-sm">{skill.name}</span>
                          </div>
                        );
                      })}
                    </div>
                    {availableSkills.length === 0 && (
                      <p className="text-muted-foreground text-sm">
                        No hay skills disponibles.{' '}
                        <a href="/admin/people/skills/new" className="text-primary underline">
                          Crear skill
                        </a>
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Publicación</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="isPublished">Publicar</Label>
                <Switch
                  id="isPublished"
                  checked={isPublished}
                  onCheckedChange={setIsPublished}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Categoría</CardTitle>
            </CardHeader>
            <CardContent>
              <Select
                value={categoryId || '__none__'}
                onValueChange={(v) => setCategoryId(v === '__none__' ? '' : v)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar categoría" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">Sin categoría</SelectItem>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          <div className="flex flex-col gap-2">
            <Button type="submit" disabled={isLoading}>
              {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear'}
            </Button>
            <a href="/admin/people">
              <Button type="button" variant="outline" className="w-full">
                Cancelar
              </Button>
            </a>
          </div>
        </div>
      </div>
    </form>
  );
}

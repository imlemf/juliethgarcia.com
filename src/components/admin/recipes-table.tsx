import { useEffect, useState } from 'react';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Pencil, Trash2, ExternalLink, Clock, Users, Flame, BadgeCheck } from 'lucide-react';

interface Recipe {
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
  isPublished: boolean;
  isPremium: boolean;
  publishedAt: string | null;
  createdAt: string;
}

function formatDate(dateString: string): string {
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(new Date(dateString));
}

function formatTime(minutes: number): string {
  if (minutes < 60) return `${minutes} min`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return mins > 0 ? `${hours}h ${mins}min` : `${hours}h`;
}

const difficultyLabels = {
  easy: 'Fácil',
  medium: 'Medio',
  hard: 'Difícil',
};

const difficultyColors = {
  easy: 'bg-green-100 text-green-800',
  medium: 'bg-yellow-100 text-yellow-800',
  hard: 'bg-red-100 text-red-800',
};

export function RecipesTable() {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [filter, setFilter] = useState('published');

  const fetchRecipes = async () => {
    setIsLoading(true);
    setError('');
    try {
      const res = await fetch('/api/recipes?showDrafts=true');
      if (!res.ok) {
        throw new Error('Error al cargar recetas');
      }
      const data = await res.json() as { recipes: Recipe[] };
      setRecipes(data.recipes || []);
    } catch (err) {
      console.error('Error fetching recipes:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar');
      setRecipes([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipes();
  }, []);

  const handleTogglePublish = async (recipe: Recipe) => {
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'toggle-published' }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      fetchRecipes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleTogglePremium = async (recipe: Recipe) => {
    try {
      const res = await fetch(`/api/recipes/${recipe.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPremium: !recipe.isPremium }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      fetchRecipes();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar premium');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/recipes/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setRecipes(recipes.filter((r) => r.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const filteredRecipes = recipes.filter((r) => {
    if (filter === 'published') return r.isPublished;
    if (filter === 'drafts') return !r.isPublished;
    return true;
  });

  const counts = {
    published: recipes.filter((r) => r.isPublished).length,
    drafts: recipes.filter((r) => !r.isPublished).length,
  };

  return (
    <div className="space-y-4">
      {error && (
        <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">
          {error}
        </div>
      )}

      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="published">Publicadas ({counts.published})</TabsTrigger>
          <TabsTrigger value="drafts">Borradores ({counts.drafts})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Receta</TableHead>
              <TableHead>Categoría</TableHead>
              <TableHead>Info</TableHead>
              <TableHead>Fecha</TableHead>
              <TableHead>Publicada</TableHead>
              <TableHead>
                <div className="flex items-center gap-1">
                  <BadgeCheck className="h-4 w-4 text-yellow-500" />
                  Premium
                </div>
              </TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  Cargando...
                </TableCell>
              </TableRow>
            ) : filteredRecipes.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  No hay {filter === 'published' ? 'recetas publicadas' : 'borradores'}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecipes.map((recipe) => (
                <TableRow key={recipe.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      {recipe.imageUrl ? (
                        <img
                          src={recipe.imageUrl}
                          alt={recipe.name}
                          className="h-10 w-10 rounded object-cover"
                        />
                      ) : (
                        <div className="h-10 w-10 rounded bg-muted flex items-center justify-center text-muted-foreground">
                          🍽️
                        </div>
                      )}
                      <div>
                        <p className="font-medium">{recipe.name}</p>
                        <p className="text-xs text-muted-foreground">/{recipe.slug}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>
                    {recipe.categoryName ? (
                      <span className="text-xs px-2 py-0.5 rounded-full bg-primary/10 text-primary">
                        {recipe.categoryName}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col gap-1 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {formatTime(recipe.estimatedTime)}
                      </span>
                      <span className="flex items-center gap-1">
                        <Users className="h-3 w-3" />
                        {recipe.servings} porciones
                      </span>
                      {recipe.calories && (
                        <span className="flex items-center gap-1">
                          <Flame className="h-3 w-3" />
                          {recipe.calories} kcal
                        </span>
                      )}
                      <span className={`inline-flex px-1.5 py-0.5 rounded text-[10px] font-medium w-fit ${difficultyColors[recipe.difficulty]}`}>
                        {difficultyLabels[recipe.difficulty]}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {recipe.publishedAt
                      ? formatDate(recipe.publishedAt)
                      : formatDate(recipe.createdAt)}
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={recipe.isPublished}
                      onCheckedChange={() => handleTogglePublish(recipe)}
                    />
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={recipe.isPremium}
                      onCheckedChange={() => handleTogglePremium(recipe)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-1">
                      {recipe.isPublished && (
                        <a href={`/recipes/${recipe.slug}`} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                      <a href={`/admin/recipes/${recipe.id}`}>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Pencil className="h-4 w-4" />
                        </Button>
                      </a>
                      <AlertDialog>
                        <AlertDialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </AlertDialogTrigger>
                        <AlertDialogContent>
                          <AlertDialogHeader>
                            <AlertDialogTitle>¿Eliminar receta?</AlertDialogTitle>
                            <AlertDialogDescription>
                              Esta acción eliminará permanentemente "{recipe.name}" y todas sus preparaciones. No se puede deshacer.
                            </AlertDialogDescription>
                          </AlertDialogHeader>
                          <AlertDialogFooter>
                            <AlertDialogCancel>Cancelar</AlertDialogCancel>
                            <AlertDialogAction
                              onClick={() => handleDelete(recipe.id)}
                              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                            >
                              Eliminar
                            </AlertDialogAction>
                          </AlertDialogFooter>
                        </AlertDialogContent>
                      </AlertDialog>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}

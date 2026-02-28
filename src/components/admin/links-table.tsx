import { useEffect, useState } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
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
import { Pencil, Trash2, ExternalLink, GripVertical, ArrowDownUp } from 'lucide-react';

interface SiteLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconType: 'emoji' | 'lucide' | 'simple-icons';
  linkType: 'social' | 'custom';
  order: number;
  isActive: boolean;
  clickCount: number;
}

function SortableRow({ link, onToggle, onDelete }: {
  link: SiteLink;
  onToggle: (link: SiteLink) => void;
  onDelete: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: link.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <TableRow ref={setNodeRef} style={style}>
      <TableCell className="w-[40px]">
        <button
          className="cursor-grab active:cursor-grabbing touch-none text-muted-foreground hover:text-foreground"
          {...attributes}
          {...listeners}
        >
          <GripVertical className="h-4 w-4" />
        </button>
      </TableCell>
      <TableCell>
        <div>
          <p className="font-medium">{link.title}</p>
          <p className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</p>
        </div>
      </TableCell>
      <TableCell>
        <span className={`text-xs px-2 py-0.5 rounded-full ${
          link.linkType === 'social'
            ? 'bg-primary/10 text-primary'
            : 'bg-muted text-muted-foreground'
        }`}>
          {link.linkType === 'social' ? 'Social' : 'Custom'}
        </span>
      </TableCell>
      <TableCell className="text-muted-foreground">
        {link.clickCount}
      </TableCell>
      <TableCell>
        <Switch
          checked={link.isActive}
          onCheckedChange={() => onToggle(link)}
        />
      </TableCell>
      <TableCell className="text-right">
        <div className="flex items-center justify-end gap-1">
          <a href={link.url} target="_blank" rel="noopener noreferrer">
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <ExternalLink className="h-4 w-4" />
            </Button>
          </a>
          <a href={`/admin/links/${link.id}/edit`}>
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
                <AlertDialogTitle>¿Eliminar enlace?</AlertDialogTitle>
                <AlertDialogDescription>
                  Esta acción eliminará permanentemente "{link.title}". No se puede deshacer.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancelar</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => onDelete(link.id)}
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
  );
}

export function LinksTable() {
  const [links, setLinks] = useState<SiteLink[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('active');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } })
  );

  const fetchLinks = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/site-links?showInactive=true');
      const data = await res.json() as { links: SiteLink[] };
      setLinks(data.links);
    } catch (err) {
      console.error('Error fetching links:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLinks();
  }, []);

  const handleToggleActive = async (link: SiteLink) => {
    const newStatus = !link.isActive;
    try {
      const res = await fetch(`/api/site-links/${link.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive: newStatus }),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error || 'Error al actualizar');
      }
      const data = await res.json() as { link: SiteLink };
      setLinks(links.map((l) =>
        l.id === link.id ? data.link : l
      ));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al actualizar estado');
    }
  };

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/site-links/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Error al eliminar');
      setLinks(links.filter((l) => l.id !== id));
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  const handleDragEnd = async (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const activeLinks = sortedLinks.filter((l) => l.isActive);
    const oldIndex = activeLinks.findIndex((l) => l.id === active.id);
    const newIndex = activeLinks.findIndex((l) => l.id === over.id);

    const reordered = arrayMove(activeLinks, oldIndex, newIndex);

    // Update local state
    const updatedLinks = links.map((l) => {
      const newOrder = reordered.findIndex((r) => r.id === l.id);
      if (newOrder !== -1) return { ...l, order: newOrder };
      return l;
    });
    setLinks(updatedLinks);

    // Save to backend
    const linkOrders = reordered.map((l, i) => ({ id: l.id, order: i }));
    try {
      const res = await fetch('/api/site-links/reorder', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ linkOrders }),
      });
      if (!res.ok) throw new Error('Error al reordenar');
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Error al reordenar');
      fetchLinks();
    }
  };

  const sortedLinks = [...links].sort((a, b) => a.order - b.order);

  const filteredLinks = sortedLinks.filter((l) => {
    if (filter === 'active') return l.isActive;
    if (filter === 'inactive') return !l.isActive;
    return true;
  });

  const counts = {
    active: links.filter((l) => l.isActive).length,
    inactive: links.filter((l) => !l.isActive).length,
  };

  if (isLoading) {
    return <div className="py-12 text-center text-muted-foreground">Cargando...</div>;
  }

  return (
    <div className="space-y-4">
      <Tabs value={filter} onValueChange={setFilter}>
        <TabsList>
          <TabsTrigger value="active">Activos ({counts.active})</TabsTrigger>
          <TabsTrigger value="inactive">Inactivos ({counts.inactive})</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="rounded-lg border bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              {filter === 'active' && <TableHead className="w-[40px]"><ArrowDownUp className="h-4 w-4 text-muted-foreground" /></TableHead>}
              <TableHead>Enlace</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Clicks</TableHead>
              <TableHead>Activo</TableHead>
              <TableHead className="text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          {filter === 'active' ? (
            <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
              <SortableContext items={filteredLinks.map((l) => l.id)} strategy={verticalListSortingStrategy}>
                <TableBody>
                  {filteredLinks.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No hay enlaces activos
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredLinks.map((link) => (
                      <SortableRow
                        key={link.id}
                        link={link}
                        onToggle={handleToggleActive}
                        onDelete={handleDelete}
                      />
                    ))
                  )}
                </TableBody>
              </SortableContext>
            </DndContext>
          ) : (
            <TableBody>
              {filteredLinks.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No hay enlaces inactivos
                  </TableCell>
                </TableRow>
              ) : (
                filteredLinks.map((link) => (
                  <TableRow key={link.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{link.title}</p>
                        <p className="text-xs text-muted-foreground truncate max-w-[200px]">{link.url}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`text-xs px-2 py-0.5 rounded-full ${
                        link.linkType === 'social'
                          ? 'bg-primary/10 text-primary'
                          : 'bg-muted text-muted-foreground'
                      }`}>
                        {link.linkType === 'social' ? 'Social' : 'Custom'}
                      </span>
                    </TableCell>
                    <TableCell className="text-muted-foreground">
                      {link.clickCount}
                    </TableCell>
                    <TableCell>
                      <Switch
                        checked={link.isActive}
                        onCheckedChange={() => handleToggleActive(link)}
                      />
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        <a href={link.url} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="icon" className="h-8 w-8">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                        <a href={`/admin/links/${link.id}/edit`}>
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
                              <AlertDialogTitle>¿Eliminar enlace?</AlertDialogTitle>
                              <AlertDialogDescription>
                                Esta acción eliminará permanentemente "{link.title}". No se puede deshacer.
                              </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancelar</AlertDialogCancel>
                              <AlertDialogAction
                                onClick={() => handleDelete(link.id)}
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
          )}
        </Table>
      </div>
    </div>
  );
}

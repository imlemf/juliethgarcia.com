
import { useState } from 'react';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { GripVertical, Pencil, Trash2, Eye, EyeOff, ExternalLink, Mail } from 'lucide-react';

interface SiteLink {
  id: string;
  title: string;
  url: string;
  icon: string;
  iconType: 'emoji' | 'lucide';
  linkType: 'social' | 'custom';
  order: number;
  isActive: boolean;
  clickCount: number;
}

interface LinkListProps {
  links: SiteLink[];
  onReorder: (reorderedLinks: SiteLink[]) => void;
  onDelete: (id: string) => void;
}

export function LinkList({ links, onReorder, onDelete }: LinkListProps) {
  const [draggedIndex, setDraggedIndex] = useState<number | null>(null);

  const handleDragStart = (index: number) => {
    setDraggedIndex(index);
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();

    if (draggedIndex === null || draggedIndex === index) return;

    const reordered = [...links];
    const draggedItem = reordered[draggedIndex];
    reordered.splice(draggedIndex, 1);
    reordered.splice(index, 0, draggedItem);

    setDraggedIndex(index);
    onReorder(reordered);
  };

  const handleDragEnd = () => {
    setDraggedIndex(null);
  };

  const renderIcon = (link: SiteLink) => {
    if (link.iconType === 'emoji') {
      return <span className="text-2xl">{link.icon}</span>;
    }

    if (link.iconType === 'lucide' && link.icon === 'Mail') {
      return <Mail className="h-6 w-6" />;
    }

    return <span className="text-2xl">🔗</span>;
  };

  return (
    <div className="space-y-2">
      {links.map((link, index) => (
        <div
          key={link.id}
          draggable
          onDragStart={() => handleDragStart(index)}
          onDragOver={(e) => handleDragOver(e, index)}
          onDragEnd={handleDragEnd}
          className={`flex items-center gap-3 rounded-lg border p-4 transition-colors hover:bg-accent ${
            draggedIndex === index ? 'opacity-50' : ''
          }`}
        >
          <button
            className="cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground"
            aria-label="Drag to reorder"
          >
            <GripVertical className="h-5 w-5" />
          </button>

          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-muted">
            {renderIcon(link)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="font-semibold truncate">{link.title}</h3>
              {!link.isActive && (
                <Badge variant="secondary" className="text-xs">
                  <EyeOff className="h-3 w-3 mr-1" />
                  Inactivo
                </Badge>
              )}
              <Badge variant="outline" className="text-xs">
                {link.linkType === 'social' ? 'Social' : 'Personalizado'}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground truncate">{link.url}</p>
            <p className="text-xs text-muted-foreground mt-1">
              {link.clickCount} clicks
            </p>
          </div>

          <div className="flex items-center gap-2">
            <a href={link.url} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm">
                <ExternalLink className="h-4 w-4" />
              </Button>
            </a>
            <a href={`/admin/links/${link.id}/edit`}>
              <Button variant="ghost" size="sm">
                <Pencil className="h-4 w-4" />
              </Button>
            </a>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onDelete(link.id)}
            >
              <Trash2 className="h-4 w-4 text-destructive" />
            </Button>
          </div>
        </div>
      ))}
    </div>
  );
}

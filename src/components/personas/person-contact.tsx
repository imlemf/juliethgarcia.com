import { Mail, Phone, MessageCircle, Globe, Instagram } from 'lucide-react';

interface PersonContactProps {
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  website: string | null;
  instagram: string | null;
}

export function PersonContact({
  email,
  phone,
  whatsapp,
  website,
  instagram,
}: PersonContactProps) {
  const hasContact = email || phone || whatsapp;
  const hasSocial = website || instagram;

  if (!hasContact && !hasSocial) return null;

  return (
    <div className="space-y-4">
      {/* Contact buttons */}
      {hasContact && (
        <div className="flex flex-wrap gap-2">
          {email && (
            <a
              href={`mailto:${email}`}
              className="inline-flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Enviar email
            </a>
          )}
          {whatsapp && (
            <a
              href={`https://wa.me/${whatsapp.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 rounded-md bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 transition-colors"
            >
              <MessageCircle className="h-4 w-4" />
              WhatsApp
            </a>
          )}
          {phone && (
            <a
              href={`tel:${phone}`}
              className="inline-flex items-center gap-2 rounded-md border px-4 py-2 text-sm font-medium hover:bg-muted transition-colors"
            >
              <Phone className="h-4 w-4" />
              Llamar
            </a>
          )}
        </div>
      )}

      {/* Social links */}
      {hasSocial && (
        <div className="flex items-center gap-4">
          {website && (
            <a
              href={website.startsWith('http') ? website : `https://${website}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Globe className="h-4 w-4" />
              Sitio web
            </a>
          )}
          {instagram && (
            <a
              href={`https://instagram.com/${instagram.replace('@', '')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <Instagram className="h-4 w-4" />
              @{instagram.replace('@', '')}
            </a>
          )}
        </div>
      )}
    </div>
  );
}

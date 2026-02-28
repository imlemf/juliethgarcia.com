import { PersonSkillsList } from './person-skills-list';
import { PersonContact } from './person-contact';

interface Skill {
  skillId?: string;
  skillName: string;
  skillSlug: string;
  skillColor: string | null;
}

interface PersonProfileProps {
  person: {
    name: string;
    slug: string;
    titleName: string | null;
    shortBio: string | null;
    bio: string | null;
    avatarUrl: string | null;
    categoryName: string | null;
    categorySlug: string | null;
    email: string | null;
    phone: string | null;
    whatsapp: string | null;
    website: string | null;
    instagram: string | null;
    skills: Skill[];
  };
}

export function PersonProfile({ person }: PersonProfileProps) {
  return (
    <div className="max-w-3xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 mb-8">
        {/* Avatar */}
        <div className="w-32 h-32 sm:w-40 sm:h-40 rounded-full overflow-hidden bg-muted flex-shrink-0">
          {person.avatarUrl ? (
            <img
              src={person.avatarUrl}
              alt={person.name}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-5xl bg-primary/10 text-primary">
              {person.name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Info */}
        <div className="text-center sm:text-left">
          <h1 className="text-3xl font-bold">{person.name}</h1>

          {person.titleName && (
            <p className="text-lg text-primary font-medium mt-1">
              {person.titleName}
            </p>
          )}

          {person.categoryName && (
            <span className="mt-2 inline-block text-sm font-medium px-3 py-1 rounded-full bg-muted text-muted-foreground">
              {person.categoryName}
            </span>
          )}

          {person.shortBio && (
            <p className="mt-4 text-muted-foreground">{person.shortBio}</p>
          )}
        </div>
      </div>

      {/* Skills */}
      {person.skills.length > 0 && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Skills</h2>
          <PersonSkillsList skills={person.skills} />
        </div>
      )}

      {/* Bio */}
      {person.bio && (
        <div className="mb-8">
          <h2 className="text-lg font-semibold mb-3">Acerca de</h2>
          <div
            className="prose prose-sm dark:prose-invert max-w-none"
            dangerouslySetInnerHTML={{ __html: person.bio }}
          />
        </div>
      )}

      {/* Contact */}
      <div className="border-t pt-6">
        <h2 className="text-lg font-semibold mb-4">Contacto</h2>
        <PersonContact
          email={person.email}
          phone={person.phone}
          whatsapp={person.whatsapp}
          website={person.website}
          instagram={person.instagram}
        />
        {!person.email &&
          !person.phone &&
          !person.whatsapp &&
          !person.website &&
          !person.instagram && (
            <p className="text-sm text-muted-foreground">
              No hay información de contacto disponible.
            </p>
          )}
      </div>
    </div>
  );
}

import { PersonSkillsList } from './person-skills-list';

interface Skill {
  skillId?: string;
  skillName: string;
  skillSlug: string;
  skillColor: string | null;
}

interface PersonCardProps {
  name: string;
  slug: string;
  shortBio: string | null;
  avatarUrl: string | null;
  titleName: string | null;
  categoryName: string | null;
  skills: Skill[];
}

export function PersonCard({
  name,
  slug,
  shortBio,
  avatarUrl,
  titleName,
  categoryName,
  skills,
}: PersonCardProps) {
  return (
    <a
      href={`/personas/${slug}`}
      className="group block rounded-lg border bg-card overflow-hidden hover:shadow-lg transition-shadow"
    >
      <div className="p-6 flex flex-col items-center text-center">
        {/* Avatar */}
        <div className="w-24 h-24 rounded-full overflow-hidden bg-muted mb-4">
          {avatarUrl ? (
            <img
              src={avatarUrl}
              alt={name}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-3xl bg-primary/10 text-primary">
              {name.charAt(0).toUpperCase()}
            </div>
          )}
        </div>

        {/* Name */}
        <h3 className="font-semibold text-lg group-hover:text-primary transition-colors">
          {name}
        </h3>

        {/* Title */}
        {titleName && (
          <p className="text-sm text-primary font-medium mt-1">{titleName}</p>
        )}

        {/* Category */}
        {categoryName && (
          <span className="mt-2 text-xs font-medium px-2 py-1 rounded bg-muted text-muted-foreground">
            {categoryName}
          </span>
        )}

        {/* Short Bio */}
        {shortBio && (
          <p className="mt-3 text-sm text-muted-foreground line-clamp-2">
            {shortBio}
          </p>
        )}

        {/* Skills */}
        {skills.length > 0 && (
          <div className="mt-4">
            <PersonSkillsList skills={skills.slice(0, 3)} size="sm" />
            {skills.length > 3 && (
              <span className="text-xs text-muted-foreground mt-1 inline-block">
                +{skills.length - 3} más
              </span>
            )}
          </div>
        )}
      </div>
    </a>
  );
}

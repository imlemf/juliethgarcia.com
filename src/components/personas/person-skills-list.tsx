interface Skill {
  skillId?: string;
  skillName: string;
  skillSlug: string;
  skillColor: string | null;
}

interface PersonSkillsListProps {
  skills: Skill[];
  size?: 'sm' | 'md';
}

export function PersonSkillsList({ skills, size = 'md' }: PersonSkillsListProps) {
  if (skills.length === 0) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {skills.map((skill) => (
        <span
          key={skill.skillSlug}
          className={`inline-flex items-center rounded-full font-medium ${
            size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-1 text-sm'
          }`}
          style={{
            backgroundColor: skill.skillColor
              ? `${skill.skillColor}20`
              : 'hsl(var(--muted))',
            color: skill.skillColor || 'hsl(var(--muted-foreground))',
            borderWidth: '1px',
            borderColor: skill.skillColor
              ? `${skill.skillColor}40`
              : 'hsl(var(--border))',
          }}
        >
          {skill.skillName}
        </span>
      ))}
    </div>
  );
}

# Claude Code Instructions

## Package Manager

Always use **bun** instead of npm for installing or running dependencies:

```bash
# Install dependencies
bun install
bun add <package>
bun add -d <package>  # dev dependency

# Run scripts
bun run dev
bun run build
bun run db:generate
bun run db:migrate
```

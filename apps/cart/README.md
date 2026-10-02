# Portal

This is a Next.js application in the Acme monorepo, generated with Turborepo generator (\`turbo gen app\`).

## Configuration

- **Framework**: Next.js 16 (App Router + Turbopack)
- **React**: React 19
- **Dev Port**: \`3008\`
- **Shared Packages**:
  - \`@repo/ui\`
  - \`@repo/eslint-config\`
  - \`@repo/typescript-config\`

## Development

Run from monorepo root:

\`\`\`bash
# Start dev server on port 3008
pnpm --filter portal dev

# Build production bundle
pnpm --filter portal build

# Typecheck
pnpm --filter portal check-types

# Lint
pnpm --filter portal lint
\`\`\`

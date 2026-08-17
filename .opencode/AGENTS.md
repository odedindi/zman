# Dialektli - Agent Configuration

## Project Overview
Dialektli is a multilingual Swiss dialect expression dictionary built with:
- **Frontend**: Next.js 16 (App Router), React 19, Tailwind CSS 4, Radix UI
- **Data**: Apollo Client 4, SWR 2, GraphQL (Apollo Server 5 + Pothos)
- **Backend**: Prisma 7, PostgreSQL
- **Auth**: NextAuth.js 4 (OAuth + credentials), JWT strategy
- **i18n**: next-intl (DE/EN/FR) with locale-prefixed routes
- **Dev Tools**: TypeScript 5, Oxlint, ESLint 9, Oxfmt, GraphQL Code Generator, Husky, Yarn 4

## Architecture

### Project Structure
```
src/
  app/[locale]/           # All routes locale-prefixed (/de, /en, /fr)
    expressions/          # Expression listing (home), detail, new, edit
    sprachatlas/          # Dialect atlas map page
    account/              # User profile
    auth/                 # Sign in / sign up
  api/
    graphql/              # Apollo Server GraphQL endpoint
    auth/                 # NextAuth.js API routes
  components/
    expression/           # Expression cards, forms, filters
    layout/               # Header, footer, navbar
    map/                  # Interactive canton map
    ui/                   # Radix UI component wrappers
  graphql/                # Pothos schema definition
    modules/              # Domain modules (expression, user, like, etc.)
  i18n/                   # next-intl configuration
  config/                 # Canton data, constants
  lib/                    # Prisma client, shared utilities
  generated/              # Auto-generated types (do not edit)
  hooks/                  # React hooks for data fetching
prisma/
  schema.prisma           # Database schema
messages/
  de.json, en.json, fr.json  # Translations
```

### Key Patterns
- **GraphQL**: Pothos schema builder with Prisma integration
- **State**: Apollo Client for mutations, SWR/React Query for queries
- **Forms**: Controlled components with zod validation
- **Routing**: next-intl locale-prefixed routes, usePathname/useSearchParams
- **Styling**: Tailwind CSS 4 with CSS variables, class-variance-authority

## Agent Instructions

### For Implementation Tasks
1. **Always follow existing patterns** - Check similar files before implementing
2. **Type safety first** - Never use `as any`, `@ts-ignore`, or `@ts-expect-error`
3. **Run codegen after GraphQL changes** - `yarn codegen` updates generated types
4. **Verify with lint/typecheck** - `yarn lint && yarn check:types && yarn check:format`
5. **Translations** - Update all 3 locale files (en.json, de.json, fr.json)

### For GraphQL Changes
1. Modify schema in `src/graphql/modules/*.ts`
2. Run `yarn codegen` to regenerate types
3. Update frontend hooks/components to use new fields
4. Update translations for any new UI text

### For UI Changes
1. Use existing Radix UI wrappers in `src/components/ui/`
2. Follow class-variance-authority patterns for variants
3. Use `useTranslations()` from next-intl for all user-facing text
4. Test in all 3 locales

### For Database Changes
1. Modify `prisma/schema.prisma`
2. Run `yarn prisma:migrate dev` to create migration
3. Run `yarn prisma:generate` to update client
4. Update GraphQL schema if needed

## Common Commands
```bash
# Development
yarn dev                    # Start dev server with Turbopack
yarn build                  # Production build (includes codegen)
yarn start                  # Start production server

# Database
yarn prisma:migrate         # Run migrations
yarn prisma:generate        # Generate Prisma client
yarn prisma:studio          # Open Prisma Studio
yarn prisma:seed            # Seed database

# Code Quality
yarn lint                   # Oxlint + ESLint
yarn lint:fix               # Auto-fix lint issues
yarn check:types            # TypeScript type check
yarn check:format           # Check formatting
yarn format                 # Auto-format with Oxfmt

# GraphQL
yarn codegen                # Regenerate GraphQL types
```

## Current Features
- Multilingual UI (DE/EN/FR) with locale-prefixed routes
- Filter expressions by canton (26 Swiss cantons), language, first character
- Sort by popularity (likes) or random
- User interactions: like, dislike, bookmark, flag
- Expression types with grammatical gender
- Interactive canton map (Sprachatlas)
- Dark/light theme
- OAuth (Google, Facebook) + credentials auth
- Role-based access (USER/ADMIN)
- Rate limiting via Upstash Redis

## Planned Improvements
- **Sort by time** - Add "newest first" sort option (most recent to oldest) as default
- Library upgrades to latest versions
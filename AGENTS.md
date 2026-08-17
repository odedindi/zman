# Agent Instructions for zman

## Project Context
This is **zman** - a local-first, offline-capable PWA for family schedule management using Yjs CRDTs. See `CONTEXT.md` for full project overview.

## Agent Workflow

### Before Starting Work
1. Read `CONTEXT.md` for project overview
2. Check current git status: `git status`
3. Review recent commits: `git log --oneline -5`
4. Run type-check: `yarn type-check`

### During Implementation
- **Always use Yarn Berry**: `yarn` not `npm`
- **Run type-check after changes**: `yarn type-check`
- **Run build to verify**: `yarn build`
- **Commit in logical chunks** with conventional commit messages

### After Completing Work
1. Run full build: `yarn build`
2. Run type-check: `yarn type-check`
3. Stage and commit changes with descriptive messages
3. Push if needed

## Current Slice Status

| Slice | Status | Description |
|-------|--------|-------------|
| 1. Foundation | ✅ Done | Next.js 16 PWA, i18n, Serwist, offline shell |
| 2. Yjs Core | ✅ Done | CRDT providers, IndexedDB, Zustand, hooks |
| 3. Entity Mgmt | 🔄 Next | Add/remove/switch entities, forms, switcher |
| 4. Calendar Views | ⏳ Pending | Day/Week/Month/Semester responsive grids |
| 5. Holidays/Exceptions | ⏳ Pending | IL/CH calendar import, one-off overrides |
| 6. WS Relay | ⏳ Pending | Hono + ws server (separate deploy) |
| 7. Offline Queue UI | ⏳ Pending | Background Sync UI, conflict resolution |
| 8. Push Notifications | ⏳ Pending | VAPID + Web Push API |

## Development Principles

### Code Quality
- **TypeScript strict mode** - no `any` unless absolutely necessary
- **No comments/docstrings** - code should be self-documenting
- **Prefer composition over inheritance**
- **Use path aliases** (`@/`, `@i18n`, etc.)

### PWA/Offline-First
- All writes go to IndexedDB first
- Service worker handles app shell + API caching
- Background Sync API for offline mutations
- CRDT handles conflict resolution automatically

### i18n/RTL
- English is default locale (`en`)
- Hebrew (`he`) uses RTL direction
- German (`de`) uses LTR
- All user-facing strings in `messages/{locale}.json`

### State Management
- **Zustand + Immer** for local UI state
- **Yjs** for shared/collaborative state
- **React Query / SWR** for server state (if needed)

## Slice Implementation Pattern

For each slice, follow this pattern:

1. **Spec** - Create/update slice spec with acceptance criteria
2. **Types** - Define TypeScript interfaces in appropriate files
3. **Core Logic** - Implement in `src/lib/` or `src/store/`
4. **Hooks** - Create React hooks in `src/hooks/`
5. **Components** - Build UI in `src/components/`
6. **Integration** - Wire up in pages/layouts
7. **Verify** - Run `yarn build && yarn type-check`

## Git Conventions

### Commit Messages
Use conventional commits:
```
feat: add entity switcher component
fix: resolve sync status flickering
refactor: extract calendar grid to shared component
docs: update CONTEXT.md with relay server info
```

### Branch Strategy
- `main` - production-ready
- Feature branches for each slice
- PRs for review before merge

## Testing Checklist (Before Committing)
- [ ] `yarn build` passes
- [ ] `yarn type-check` passes
- [ ] `yarn lint` passes
- [ ] No new `any` types without justification
- [ ] i18n keys added for all locales
- [ ] RTL layout tested for Hebrew

## Important File Locations

| Purpose | File |
|---------|------|
| Project context | `CONTEXT.md` |
| i18n config | `src/i18n/index.ts` |
| Translation files | `messages/{en,he,de}.json` |
| Yjs providers | `src/lib/yjs/providers.ts` |
| Entity store | `src/store/entities.ts` |
| DB schema | `src/lib/db/index.ts` |
| Sync hooks | `src/hooks/useSyncStatus.ts`, `useYjsDoc.ts` |
| PWA components | `src/components/pwa/` |
| Service worker | `src/app/sw.ts` |
| Proxy/routing | `src/proxy.ts` |
| Manifest | `src/app/manifest.ts` |

## Known Issues / TODO

1. **Relay server** - Needs separate deployment (Hono + ws)
2. **Push notifications** - VAPID keys need setup
3. **Calendar views** - Day/Week/Month/Semester components not built
4. **Conflict UI** - Only SyncStatus shows state, no manual merge UI
5. **Export/Import** - No ICS/CSV export for external calendars

## Delegation Notes

When delegating to subagents:
- Provide clear acceptance criteria
- Specify which files to modify
- Include relevant type definitions
- Set up test verification steps
- Use `task` with appropriate category/skills

Example delegation:
```
task(category="visual-engineering", load_skills=["frontend-ui-ux"], 
  prompt="Create Day/Week/Month/Semester calendar views...")
```
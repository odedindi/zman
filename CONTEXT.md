# zman - Family Schedule PWA

## Project Overview
**zman** (זמן - Hebrew for "time") is a local-first, offline-capable Progressive Web App for managing family schedules (kindergarten, school, activities). It enables real-time sync between parents without a central database using Yjs CRDTs.

## Stack
- **Framework**: Next.js 16 (App Router, webpack mode)
- **Styling**: Tailwind CSS v4
- **PWA**: Serwist (Workbox 7 successor)
- **Sync**: Yjs CRDT + y-websocket + y-indexeddb
- **State**: Zustand + Immer + persist middleware
- **i18n**: Custom implementation (en/he/de) with RTL support
- **Package Manager**: Yarn Berry 4.18.0
- **Database**: IndexedDB via idb wrapper

## Architecture

### Data Model
```
Entity (kid/school/activity)
  ├── schedule: Y.Map<ScheduleEntry> (recurring weekly patterns)
  ├── holidays: Y.Array<HolidayEntry> (multi-day blocks)
  └── exceptions: Y.Map<ExceptionEntry> (one-off overrides)
```

### Sync Flow
1. User edits → Yjs local doc → y-indexeddb (instant)
2. Online: y-websocket → Relay server → Other clients
3. Offline: Mutations queued in IndexedDB
4. Reconnect: Background Sync API processes queue → CRDT merge

### Offline-First Guarantees
- All reads from IndexedDB (instant, works offline)
- All writes to IndexedDB first, then synced
- CRDT ensures conflict-free concurrent edits
- Service worker caches app shell + API responses

## Project Structure
```
zman/
├── i18n/                    # i18n config + messages (en/he/de)
├── messages/                # Translation files
├── public/                  # Static assets + offline.html
├── src/
│   ├── app/
│   │   ├── [locale]/        # Localized routes
│   │   ├── globals.css      # Tailwind v4 + RTL
│   │   ├── layout.tsx       # Root layout + providers
│   │   ├── page.tsx         # Landing page
│   │   ├── manifest.ts      # PWA manifest
│   │   ├── sw.ts            # Service worker
│   │   └── proxy.ts         # Locale routing (Next.js 16)
│   ├── components/
│   │   ├── pwa/             # InstallPrompt, OfflineBanner, SyncStatus
│   │   └── ui/              # Toast, Toaster (shadcn-style)
│   ├── hooks/
│   │   ├── useYjsDoc.ts     # Reactive Yjs doc state
│   │   ├── useSyncStatus.ts # Real-time sync status
│   │   ├── useOffline.ts    # Online/offline detection
│   │   ├── useEntities.ts   # Zustand entity selectors
│   │   └── use-toast.ts     # Toast notifications
│   ├── lib/
│   │   ├── db/index.ts      # idb schema + CRUD
│   │   ├── yjs/
│   │   │   ├── providers.ts # Yjs Doc + WS + IndexedDB
│   │   │   ├── docs.ts      # EntityDoc factory
│   │   │   ├── awareness.ts # User presence
│   │   │   └── offline-queue.ts # Mutation queue + Background Sync
│   │   └── utils.ts
│   ├── store/
│   │   └── entities.ts      # Zustand + Immer store
│   ├── i18n/
│   │   ├── context.tsx      # Custom i18n provider
│   │   └── index.ts         # Locale config
│   └── proxy.ts             # Locale routing middleware
├── next.config.ts
├── tsconfig.json
└── package.json
```

## Key Files for Future Work

### Adding New Features
1. **Entity CRUD**: `src/store/entities.ts` + `src/hooks/useEntities.ts`
2. **Calendar Views**: Create `src/components/calendar/` with Day/Week/Month/Semester
3. **Schedule Editor**: Forms in `src/components/schedule/`
4. **Holiday Import**: `src/lib/calendar/israel.ts`, `src/lib/calendar/swiss.ts`

### Extending Sync
- WebSocket relay: Deploy `relay-server/` separately (Hono + ws)
- Push notifications: Add VAPID keys to `src/lib/push/`
- Conflict UI: Enhance `src/components/pwa/ConflictBanner.tsx`

### i18n
- Add locale: Update `src/i18n/index.ts` + `messages/{locale}.json`
- RTL: Use `localeDirections[locale]` for `dir` attribute

## Commands
```bash
yarn dev          # Dev with HTTPS (localhost:3000)
yarn build        # Production build
yarn start        # Preview production
yarn lint         # ESLint
yarn type-check   # TypeScript
yarn generate:icons # Generate PWA icons
```

## Environment Variables
```
NEXT_PUBLIC_WS_URL=wss://zman-relay.onrender.com  # WebSocket relay (Render)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=...                    # Push notifications
```

## Deployment
- **Frontend**: Vercel (auto-detects Next.js)
- **Relay Server**: Render (free tier, Docker)
- **Domain**: Custom domain with HTTPS required for PWA
# Spaces ("Commons") — Build Plan

A Gather-style spatial world layered into the Nextbase Ultimate monorepo.
Stack: **Next.js (App Router) + Supabase (Auth/DB/Realtime) + react-three-fiber**.
Transport for v1: **Supabase Realtime (Presence + Broadcast)** — no extra server.
Each **space belongs to a workspace**, reusing existing workspace membership + RLS.

> Hand this to Claude Code phase by phase. Do not run all phases at once — land Phase 0, verify it walks, then proceed.

---

## Architecture at a glance

```
Browser (R3F canvas)  ──► Supabase Realtime channel  space:{spaceId}
   │  presence.track({userId,name,x,z,dir})  → roster (who's here)
   │  broadcast "move"  (throttled ~12Hz)     → remote avatar positions
   │  broadcast "chat"                         → speech bubbles
   │  broadcast "webrtc-*" (targeted)          → P2P signaling
   ▼
WebRTC mesh (getUserMedia) ── proximity-gated audio/video, distance-attenuated

Persistent state (Postgres, RLS by workspace):
   spaces(map_data jsonb)   ← room layout, zones, spawn, interactive objects
   Player positions are EPHEMERAL — never written to the DB.
```

**Transport is abstracted** (`SpaceTransport` interface). Default impl = Supabase Realtime.
Swap-in impl (future) = `WebSocketTransport` → a new `apps/realtime` Express/ws service, only if authoritative server logic is ever required.

---

## Dependencies (add to `apps/web`)

```
pnpm --filter web add three @react-three/fiber@^9 @react-three/drei@^10
pnpm --filter web add -D @types/three
```

`apps/web/next.config.ts` → add `three` to `transpilePackages`:

```ts
transpilePackages: ['three', /* ...existing */],
```

> ⚠️ Pin fiber v9 / drei v10 (React 19 line). fiber v8 / drei v9 target React 18 and will throw reconciliation errors on this repo.
> ⚠️ When Claude Code edits build config, eyeball `apps/web/postcss.config.mjs` afterward — that file has been an injection target in the Pvragon fork before. It should contain only the expected Tailwind/autoprefixer config.

---

## Phase 0 — Static scene renders in the app (single player, no network)

**Goal:** walk an avatar around an empty room inside the real app shell. Ships as a working build.

Files:
```
apps/web/src/app/[locale]/(dynamic-pages)/(authenticated-pages)/(application-pages)/
  workspace/[workspaceSlug]/space/[spaceSlug]/
    page.tsx                      # server component: authz + load space, render client canvas
    layout.tsx                    # full-viewport layout (escape the sidebar chrome)
    _components/
      space-scene.tsx             # 'use client' — R3F <Canvas>, dynamic ssr:false at the boundary
      space-scene-loader.tsx      # dynamic(() => import('./space-scene'), { ssr: false })
      avatar.tsx                  # low-poly avatar mesh (start with primitives)
      world.tsx                   # ground, walls, zone floors (port from prototype)
      use-local-player.ts         # WASD/arrow input → position + facing, collision
      camera-rig.ts               # follow cam (orbit + zoom)
```

Notes:
- Reuse the geometry/zone logic from the standalone `metaverse.html` prototype; translate to R3F JSX (`<mesh>`, `<meshStandardMaterial>`, etc.).
- Collision = simple circle-vs-AABB against a collider list, same as prototype.
- `map_data` can be hardcoded this phase.

**Done when:** navigating to a space URL renders the 3D room and you can move around, no console errors on build.

---

## Phase 1 — Persistence: `spaces` table + RLS + create/list

Migration: `apps/database/supabase/migrations/<ts>_spaces.sql`

```sql
create table public.spaces (
  id uuid primary key default gen_random_uuid(),
  workspace_id uuid not null references public.workspaces(id) on delete cascade,
  slug text not null,
  name text not null,
  map_data jsonb not null default '{}'::jsonb,   -- tiles, zones, spawn, objects
  created_by uuid references auth.users(id),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (workspace_id, slug)
);
alter table public.spaces enable row level security;
```

RLS: **reuse the existing workspace-membership helper functions** already in this repo
(see `20240831050842_workspace_triggers.sql`, `20241225114023_workspace_permissions.sql`).
- SELECT: any member of the workspace.
- INSERT/UPDATE/DELETE: workspace admin/owner role.

> Add a pgTAP test in `apps/database/supabase/tests/` mirroring `02_rls_workspace_tables.sql`. Verify a non-member gets 0 rows and cannot write. (There's a `pgtap-test-generator` skill in `.claude/skills/`.)

Data layer: follow the repo's pattern under `apps/web/src/data/` (server queries) + a zod schema in `apps/web/src/utils/zod-schemas/spaces.ts`. Regenerate types into `apps/database/lib/database.types.ts`.

**Done when:** a workspace admin can create a space, members see it, `map_data` loads into the Phase 0 scene.

---

## Phase 2 — Multiplayer presence + movement (the "it's real" milestone)

Transport interface — `apps/web/src/app/.../space/[spaceSlug]/_transport/types.ts`:

```ts
export interface PeerState { userId: string; name: string; x: number; z: number; dir: number; }

export interface SpaceTransport {
  join(spaceId: string, self: PeerState): Promise<void>;
  onRoster(cb: (peers: PeerState[]) => void): void;   // presence sync
  onMove(cb: (peer: PeerState) => void): void;         // remote movement
  sendMove(state: PeerState): void;                    // caller throttles ~12Hz
  onSignal(cb: (from: string, data: unknown) => void): void; // webrtc
  sendSignal(toUserId: string, data: unknown): void;
  leave(): Promise<void>;
}
```

Default impl — `_transport/supabase-realtime-transport.ts`:
- `supabase.channel('space:'+spaceId, { config: { presence: { key: userId }, broadcast: { self: false } } })`
- `presence` `sync` event → roster.
- `broadcast` `move` event → `onMove`. Throttle `sendMove` to ~80ms; drop intermediate frames.
- `broadcast` `webrtc` event, payload `{ to, from, data }` → filter `to === self` → `onSignal`.

Client wiring — `use-space-channel.ts`:
- On mount: `join`, then `sendMove` from the local player loop (throttled).
- Remote peers stored in a ref-map; **interpolate** each remote avatar toward its latest target in `useFrame` (never snap).
- On unmount / route change: `leave()`.

**Done when:** two browsers in the same space see each other move smoothly, and the roster updates on join/leave.

---

## Phase 3 — Zones, objects, chat bubbles, roster UI

- Interactive **zones** and **objects** read from `map_data`; port proximity-highlight + "press E" logic from the prototype.
- **Chat:** Enter → input → `broadcast "chat"` → speech bubble over the sender's avatar (drei `<Html>` or a `<Sprite>`), auto-expire.
- **Roster panel** (HUD): render presence list; show who's in which zone (compute locally from positions).
- **Minimap** (optional): reuse prototype's 2D canvas overlay.

---

## Phase 4 — Proximity voice/video (WebRTC)

- `use-proximity-voice.ts`: `getUserMedia({ audio, video })`.
- Each frame, compute distance to every peer. Within `TALK_RADIUS` and no connection yet → initiate `RTCPeerConnection`; exchange SDP/ICE via `sendSignal`/`onSignal`. Beyond radius → tear down.
- Attenuate remote audio gain by distance (WebAudio `GainNode`); fade video tiles similarly.
- Start **audio-only** to keep the mesh cheap; add video after it's stable. A full mesh is fine to ~6–8 concurrent; beyond that consider an SFU (LiveKit/mediasoup) later.

---

## Phase 5 — Editor + avatars (optional polish)

- **Space editor:** admin UI to place objects / paint zones, writing back to `map_data`. Gate by workspace admin RLS.
- **Avatars:** upgrade primitives to low-poly GLB via drei `useGLTF` (instance + only render nearby peers), or Ready Player Me for user-customizable characters. Keep a hard cap on rendered avatars for perf.

---

## Phase 6 — (Only if needed) Authoritative WebSocket server

Add workspace app `apps/realtime`:
- Express + `ws` (or Colyseus for room/state abstractions, or uWebSockets.js for throughput).
- Rooms in memory: `Map<spaceId, Set<Client>>`. Fan out position deltas; optionally run server-side game/collision logic.
- Auth: verify the Supabase JWT on connect (the repo already has signing-key tooling in `apps/database/scripts/generate-signing-keys.sh` + `custom_access_token_hook`).
- Deploy to a **container host that keeps processes alive** (Fly / Railway / Render) — NOT Netlify functions.
- Implement `WebSocketTransport` satisfying `SpaceTransport` and swap it in. Game code doesn't change.

---

## Watch-outs

- **SSR:** the R3F `<Canvas>` must be behind `dynamic(..., { ssr: false })`. WebGL + `window` will crash server render otherwise.
- **`transpilePackages: ['three']`** is mandatory in `next.config.ts`.
- **React/fiber pinning:** fiber@9 + drei@10 for React 19. Mismatches → `ReactCurrentOwner` / reconciler errors.
- **Realtime scope:** positions are broadcast-only, never DB writes. Only layout persists.
- **Netlify:** Realtime (browser → Supabase) is fine on serverless. An Express/ws server is not — that's Phase 6 infra.
- **Layout:** the space route needs a full-viewport layout that escapes the app sidebar/navbar chrome.
- **postcss.config.mjs:** re-check it after any build-config change (prior fork injection point).
```
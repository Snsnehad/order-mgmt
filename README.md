# Multi-Store Order Management System — Full Stack Assessment

A complete order management system supporting multiple stores, real-time updates, and analytics. Built with **Next.js (App Router) + TypeScript** on the frontend and **Express + MongoDB + Socket.IO + TypeScript** on the backend.

Covers all three tasks from the assessment:
- **Task 1** — Multi-Store Order Management (CRUD, pagination, validation)
- **Task 2** — Real-Time Notifications (Socket.IO, store-scoped rooms, reconnect handling)
- **Task 3** — Data Archival & Analytics (aggregation pipelines, archival job)

---

## Folder Structure

```
order-mgmt/
├── docker-compose.yml        # full stack: mongo + server + client
├── server/                   # Express + MongoDB + Socket.IO + TypeScript
│   ├── Dockerfile
│   └── src/
│       ├── config/           # db.ts, socket.ts
│       ├── models/           # order.model.ts, orderArchive.model.ts
│       ├── validators/       # order, analytics (Zod schemas)
│       ├── middlewares/      # validate(), errorHandler
│       ├── controllers/      # order, archival, analytics
│       ├── services/         # order, archival, analytics (DB logic, DB-agnostic from routes)
│       ├── routes/
│       ├── types/
│       ├── utils/            # AppError, asyncHandler
│       ├── app.ts
│       └── server.ts
│
└── client/                    # Next.js 14 App Router + TypeScript
    └── src/
        ├── app/
        │   ├── orders/
        │   │   ├── page.tsx        # Orders List (filter, pagination, live updates)
        │   │   ├── OrderRow.tsx
        │   │   ├── new/page.tsx    # Create Order
        │   │   └── [id]/page.tsx   # Order Detail + Update Status
        │   ├── analytics/page.tsx  # Orders/day, revenue/store, top items, archive trigger
        │   ├── layout.tsx
        │   └── providers.tsx
        ├── components/              # StatusBadge, Pagination, Navbar, LiveStatusIndicator
        ├── hooks/                   # useOrders, useOrderSocket, useAnalytics
        ├── lib/                     # apiClient, orderApi, socket.ts
        └── types/order.ts
```

---

## Setup Instructions

### Option A — Docker Compose (recommended, spins up Mongo too)

```bash
docker compose up --build
```
- Client: http://localhost:3000
- Server: http://localhost:5000

> Note: the Dockerfiles follow standard multi-stage Node build patterns but could not be executed end-to-end in the sandbox this was built in (no Docker daemon / image registry access available). Please verify `docker compose up --build` locally before relying on it; if anything needs a tweak, the most likely spot is the client build args for `NEXT_PUBLIC_*` env vars in `docker-compose.yml`.

### Option B — Manual

**Prerequisites:** Node.js 18+, MongoDB running locally (or Atlas connection string)

```bash
# Backend
cd server
npm install
cp .env.example .env
npm run dev          # http://localhost:5000

# Frontend (separate terminal)
cd client
npm install
cp .env.local.example .env.local
npm run dev           # http://localhost:3000
```

---

## API Documentation

Base URL: `http://localhost:5000/api`. All responses use a consistent envelope:
```json
{ "success": true, "data": {...}, "meta": {...} }
{ "success": false, "error": { "message": "...", "code": "...", "details": [...] } }
```

### Orders (Task 1)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/orders` | Create a new order. `total_amount` is always recomputed server-side from `items`. |
| `GET` | `/orders?store_id=&page=&limit=&status=` | Paginated orders for a store, newest first. `store_id` required. |
| `GET` | `/orders/:id` | Fetch a single order. |
| `PATCH` | `/orders/:id/status` | Update status. Forward-only: `PLACED → PREPARING → COMPLETED`. Invalid transitions return `409`. |

**Create order body**
```json
{
  "store_id": "store-01",
  "items": [{ "item_id": "i1", "name": "Burger", "qty": 2, "price": 150 }]
}
```

### Real-time events (Task 2)

Socket.IO server at the same host as the API (default `http://localhost:5000`).

**Client → Server**
- `join_store` (storeId: string) — subscribes to that store's room
- `leave_store` (storeId: string) — unsubscribes

**Server → Client** (emitted only to clients in `store:<id>` room)
- `order:created` — payload: the new order
- `order:status_updated` — payload: the updated order

The frontend's `useOrderSocket(storeId)` hook handles join/leave on store change, automatic reconnect (Socket.IO's built-in exponential backoff, capped at 10s, infinite attempts), and re-joining the room on every reconnect. Connection state (`connecting` / `connected` / `reconnecting` / `disconnected`) is surfaced via a live indicator on the Orders and Order Detail pages.

### Archival & Analytics (Task 3)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/archive-old-orders` | Moves all orders older than 30 days from `orders` into `orders_archive`, batched (500/batch), then deletes them from the live collection. Idempotent — safe to re-run. |
| `GET` | `/analytics/orders-per-day?store_id=&from=&to=` | Order count grouped by calendar day. All filters optional. |
| `GET` | `/analytics/revenue-per-store?from=&to=` | Total revenue + order count grouped by store, sorted by revenue descending. |
| `GET` | `/analytics/top-items?store_id=&limit=` | Top selling items by quantity sold (default top 5, max 50). |

All three analytics endpoints use MongoDB aggregation pipelines (`$group`, `$unwind`, `$sort`) so grouping/sorting happens in the database, not in application code.

---

## Design Decisions & Assumptions

- **Server-computed totals**: `total_amount` is always derived from `items`, never trusted from the client, to prevent price tampering.
- **Status transitions are forward-only**, one step at a time (`PLACED→PREPARING→COMPLETED`). Not explicitly required by the spec, but reflects realistic order pipelines. Easy to relax — see `ALLOWED_STATUS_TRANSITIONS` in `types/order.types.ts` (backend) and `types/order.ts` (frontend).
- **Indexes**: `store_id`, `status`, `created_at` individually, plus a compound `{store_id: 1, created_at: -1}` index on `orders` (and the same on `orders_archive`) since the dominant query is "orders for store X, newest first."
- **Socket rooms over global broadcast**: clients join `store:<id>` rooms so an event only reaches clients actually viewing that store, rather than broadcasting every event to every connected browser tab.
- **Reconnect strategy**: Socket.IO's client auto-reconnects indefinitely with exponential backoff (1s → 10s cap). On every successful (re)connect, the client re-emits `join_store` — rooms aren't preserved across a dropped connection, so this is required for correctness, not just a nice-to-have.
- **Archival is batched and resumable**: processes 500 orders at a time, only deletes from `orders` what was confirmed inserted into `orders_archive`, and uses a unique index on `original_order_id` so re-running after a partial failure doesn't double-archive or lose data.
- **Analytics filters are optional and composable**: `store_id`, `from`, `to` can be combined or omitted, so the same three endpoints serve both a single-store dashboard and an all-stores view.
- **No separate "Page 3"** as a literal isolated page only — status update is available both as a dedicated `/orders/[id]` detail page and as inline quick-actions in the orders list, since requiring a full navigation for a one-click status bump is poor UX. Both call the same `PATCH` endpoint.

## What was verified vs. not

This was built and reasoned through in a sandboxed environment without a live MongoDB instance or Docker daemon available, so:

**Verified:**
- `tsc --noEmit` passes cleanly on both `server/` and `client/`
- `next build` succeeds, all 6 routes compile and prerender correctly
- Business logic (total calculation, status-transition rules, revenue/qty aggregation math, archival cutoff date logic) verified via isolated unit-style scripts run with `ts-node`, independent of any DB
- Zod validators tested directly against valid/invalid payloads

**Not verified (please test locally before relying on this in production):**
- Live end-to-end requests against a running MongoDB instance
- Actual Socket.IO connection/reconnect behavior in a browser
- `docker compose up --build` running to completion

## Possible next steps
- Automated test suite (Jest/Vitest + Supertest) covering the live API against a real or in-memory MongoDB instance
- Rate limiting on write endpoints
- Auth/authorization (currently any client can act on any store — fine for an assessment, not for production)
- Cron-scheduling `archive-old-orders` (currently a manually-triggered endpoint, matching the spec's literal `POST /archive-old-orders` requirement)


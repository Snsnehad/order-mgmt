# Multi-Store Order Management System

A full-stack order management application built using **Next.js (App Router) + TypeScript** on the frontend and **Express.js + MongoDB + Socket.IO + TypeScript** on the backend.

## 🚀 Live Demo

- **Frontend:** https://order-mgmt-client.onrender.com/
- **Backend API:** https://order-mgmt-server.onrender.com/

> **Note:** The application is hosted on Render's free tier, so the backend may take 30–60 seconds to respond after a period of inactivity while the service wakes up.


The project covers all three assessment tasks:

- **Task 1:** Multi-Store Order Management (CRUD, pagination, validation)
- **Task 2:** Real-Time Notifications with Socket.IO
- **Task 3:** Data Archival & Analytics using MongoDB aggregation pipelines

---

## Getting Started

### Option 1 — Docker (Recommended)

```bash
docker compose up --build
```

- Frontend: http://localhost:3000
- Backend: http://localhost:5000

### Option 2 — Manual Setup

**Prerequisites**

- Node.js 18+
- MongoDB (local or MongoDB Atlas)

#### Backend

```bash
cd server
npm install
cp .env.example .env
npm run dev
```

#### Frontend

```bash
cd client
npm install
cp .env.local.example .env.local
npm run dev
```

---

## Features

### Task 1 – Order Management

- Create and manage orders across multiple stores
- Server-side calculation of total order amount
- Pagination and filtering by store and status
- Request validation using Zod
- Forward-only order status updates

### Task 2 – Real-Time Notifications

- Store-specific Socket.IO rooms
- Live updates for new orders and status changes
- Automatic reconnection with room rejoining
- Connection status indicator in the UI

### Task 3 – Analytics & Archival

- Orders grouped by day
- Revenue grouped by store
- Top-selling items
- Archive orders older than 30 days
- MongoDB aggregation pipelines for analytics

---

## Design Decisions

- Order totals are always calculated on the server to prevent client-side price manipulation.
- Order status follows a simple workflow:

  ```
  PLACED → PREPARING → COMPLETED
  ```

- Frequently queried fields are indexed to improve performance.
- Socket.IO rooms ensure clients only receive updates for the store they are viewing.
- The archival process runs in batches and can safely be executed multiple times.
- Analytics endpoints support optional filters (`store_id`, `from`, and `to`) for flexible reporting.



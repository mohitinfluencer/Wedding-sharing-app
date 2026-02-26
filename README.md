# WeddingVault — Wedding Media SaaS Platform

A production-grade multi-tenant SaaS platform where photographers create wedding portals for their clients.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 14 (App Router), TypeScript, TailwindCSS |
| Backend | NestJS, TypeScript, REST API |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT (access + refresh tokens), httpOnly cookies |
| Media | Cloudinary (images), Vimeo (video) |
| Realtime | Socket.IO |
| Queue | BullMQ + Redis |
| Deployment | Docker Compose |

## Quick Start (Local Development)

### Prerequisites

- Node.js 20+
- PostgreSQL 15
- Redis 7
- Docker (optional)

### Option 1: Docker Compose (Recommended)

```bash
# 1. Copy env files
cp backend/.env.example backend/.env
cp frontend/.env.local.example frontend/.env.local

# 2. Edit backend/.env with your Cloudinary and Vimeo API keys

# 3. Start everything
docker compose up -d

# 4. Run migrations + seed
docker compose exec backend npx prisma migrate dev
docker compose exec backend npm run prisma:seed
```

- **Frontend** → <http://localhost:3001>
- **Backend API** → <http://localhost:3000>
- **Swagger Docs** → <http://localhost:3000/api/docs>
- **Health Check** → <http://localhost:3000/health>

### Option 2: Manual Setup

```bash
# Terminal 1 – Backend
cd backend
cp .env.example .env
# Edit .env with your credentials
npm install
npx prisma migrate dev --name init
npm run prisma:seed
npm run start:dev     # Runs on http://localhost:3000

# Terminal 2 – Frontend
cd frontend
cp .env.local.example .env.local
npm install
npm run dev           # Runs on http://localhost:3001
```

## Demo Credentials

After seeding:

| Role | Email | Password |
|------|-------|----------|
| Admin | <admin@weddingplatform.com> | admin@123 |
| Photographer | <demo@studio.com> | photographer@123 |

Demo wedding page: <http://localhost:3001/wedding/rahul-priya-2026>

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `JWT_SECRET` | JWT signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | Refresh token signing secret |
| `REDIS_HOST` | Redis host |
| `REDIS_PORT` | Redis port |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `VIMEO_ACCESS_TOKEN` | Vimeo API access token |
| `VIMEO_WEBHOOK_SECRET` | Vimeo webhook signature secret |
| `APP_URL` | Frontend URL for QR code generation |
| `CORS_ORIGINS` | Comma-separated allowed CORS origins |

### Frontend (`frontend/.env.local`)

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_API_URL` | Backend API URL |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL (same as API) |
| `NEXT_PUBLIC_APP_URL` | Frontend public URL |

## API Documentation

Swagger UI available at: `http://localhost:3000/api/docs`

### Key Endpoints

```
POST /api/auth/signup          — Register photographer
POST /api/auth/login           — Login
POST /api/auth/refresh         — Refresh token

GET  /api/studio               — Get my studio
GET  /api/studio/events        — List all events

POST /api/events               — Create wedding event
GET  /api/events/:slug/public  — Public event (guest access)
PATCH /api/events/:id          — Update event

POST /api/media/init-upload    — Get Cloudinary signed params
POST /api/media/complete       — Register completed upload
GET  /api/media/event/:id      — Get event media (paginated)

GET  /api/guest/event/:slug/init-upload  — Guest upload params (no auth)
POST /api/guest/event/:slug/upload       — Complete guest upload (no auth)
PATCH /api/guest/uploads/:id/approve     — Approve guest upload

POST /api/events/:id/vimeo     — Attach Vimeo video

GET  /api/qr/event/:slug/png   — Download QR code PNG
GET  /api/qr/event/:slug/data-url — QR as base64 data URL

GET  /health                   — Health check
```

## Feature Overview

### Photographer Dashboard

- Studio home with stats (events, photos, views)
- Create wedding event with auto-generated QR + shareable URL
- Event manager: upload photos, manage albums, hide/highlight media
- Attach Vimeo videos (full wedding film, highlight reel, live stream)
- Review and approve guest uploads
- Download QR code PNG for printing
- Live slideshow control panel

### Public Wedding Page (`/wedding/[slug]`)

- Cinematic hero with couple names, date, location
- Embedded Vimeo player
- Masonry photo gallery with album tabs
- Lightbox viewer
- Live viewer count via WebSocket
- Automatic real-time photo updates (no refresh needed)
- Full-screen slideshow mode
- Guest upload flow

### Security

- JWT access tokens (15min) + httpOnly refresh cookies (7 days)
- Role-based access: platform_admin / photographer / studio_staff / couple / guest
- Event ownership checks on every mutation
- Password-protected events
- Cloudinary signed uploads (browser → Cloudinary direct, no server buffering)
- Rate limiting on all API endpoints
- Webhook signature verification (Vimeo + Cloudinary)

## WebSocket Events

Connect to: `ws://localhost:3000`

```javascript
// Join event channel
socket.emit('join_event', { eventSlug: 'rahul-priya-2026' });

// Events received:
socket.on('media_added', ({ media }) => { ... });
socket.on('media_updated', ({ mediaId, changes }) => { ... });
socket.on('slideshow_start', () => { ... });
socket.on('slideshow_pause', () => { ... });
socket.on('viewer_count', ({ count }) => { ... });
socket.on('live_started', ({ vimeoId }) => { ... });
```

## Production Deployment

### Vercel (Frontend)

```bash
cd frontend
npx vercel --prod
# Set env vars in Vercel dashboard
```

### Cloud Run / Docker (Backend)

```bash
cd backend
docker build -t wedding-backend .
docker push gcr.io/your-project/wedding-backend
# Deploy to Cloud Run with env vars
```

### Database Migrations (Production)

```bash
DATABASE_URL="your-prod-url" npx prisma migrate deploy
```

## Project Structure

```
wedding-platform/
├── backend/
│   ├── src/
│   │   ├── auth/          # JWT auth, guards, strategies
│   │   ├── studio/        # Studio management
│   │   ├── events/        # Wedding events
│   │   ├── albums/        # Event albums
│   │   ├── media/         # Cloudinary upload flow
│   │   ├── guest/         # Guest uploads + approval
│   │   ├── vimeo/         # Vimeo integration + webhooks
│   │   ├── qr/            # QR code generation
│   │   ├── realtime/      # Socket.IO gateway
│   │   ├── jobs/          # BullMQ workers
│   │   ├── analytics/     # View/upload tracking
│   │   ├── webhooks/      # Vimeo + Cloudinary webhooks
│   │   └── health/        # Health check endpoint
│   └── prisma/
│       ├── schema.prisma  # Full data model
│       └── seed.ts        # Demo data seeder
├── frontend/
│   ├── app/
│   │   ├── page.tsx               # Marketing landing
│   │   ├── auth/login/            # Photographer login
│   │   ├── auth/signup/           # Photographer signup
│   │   ├── dashboard/             # Protected studio dashboard
│   │   │   ├── page.tsx           # Studio home
│   │   │   ├── events/page.tsx    # Events list
│   │   │   ├── events/new/        # Create event
│   │   │   └── events/[id]/       # Event manager
│   │   └── wedding/[slug]/        # Public wedding page
│   │       └── upload/            # Guest upload form
│   └── lib/
│       ├── api.ts                 # Typed API client
│       └── auth-store.ts          # Zustand auth state
└── docker-compose.yml
```

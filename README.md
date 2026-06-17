# EstateIQ — Smart Estate Management Platform

A comprehensive full-stack estate management platform for landlords, tenants, and estate managers. Built with modern technologies in a monorepo architecture.

## Tech Stack

| Layer      | Technology                                      |
| ---------- | ----------------------------------------------- |
| Frontend   | Next.js 14 (App Router), TypeScript, TailwindCSS |
| UI         | shadcn/ui, Lucide Icons, Framer Motion          |
| State      | Zustand, TanStack Query                         |
| Forms      | React Hook Form + Zod validation                |
| Backend    | NestJS 10, TypeScript                           |
| Database   | PostgreSQL 15, Prisma ORM                       |
| Cache      | Redis (ioredis)                                 |
| Auth       | JWT (access + refresh tokens), Passport.js      |
| Real-time  | Socket.IO                                       |
| Monorepo   | pnpm workspaces, Turborepo                      |

## Project Structure

```
estateiq/
├── apps/
│   ├── api/              # NestJS backend
│   │   ├── prisma/       # Schema, migrations, seed
│   │   └── src/
│   │       ├── common/   # Guards, filters, interceptors, decorators
│   │       ├── modules/  # Feature modules (auth, estates, ...)
│   │       └── prisma/   # PrismaService
│   └── web/              # Next.js frontend
│       └── src/
│           ├── app/      # App Router pages
│           ├── components/ # UI & layout components
│           ├── lib/      # API client, utilities
│           └── store/    # Zustand stores
├── packages/
│   └── types/            # Shared TypeScript types, enums, Zod schemas
├── docker-compose.yml
├── turbo.json
└── pnpm-workspace.yaml
```

## Getting Started

### Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8 (`npm install -g pnpm`)
- **Docker & Docker Compose** (for PostgreSQL + Redis)

### 1. Install dependencies

```bash
pnpm install
```

### 2. Start infrastructure

```bash
docker compose up -d postgres redis
```

### 3. Configure environment

```bash
cp apps/api/.env.example apps/api/.env
cp apps/web/.env.example apps/web/.env.local
```

Edit `.env` files with your database credentials and secrets.

### 4. Set up the database

```bash
cd apps/api
pnpm prisma generate
pnpm prisma migrate dev --name init
pnpm prisma db seed
```

### 5. Run development servers

```bash
# From root — runs both API and Web concurrently
pnpm dev
```

- **API**: http://localhost:4000
- **Swagger Docs**: http://localhost:4000/api/docs
- **Web**: http://localhost:3000

## Demo Accounts

| Role           | Email                  | Password   |
| -------------- | ---------------------- | ---------- |
| Super Admin    | admin@estateiq.com     | P@ssw0rd!  |
| Estate Manager | manager@estateiq.com   | P@ssw0rd!  |
| Landlord       | landlord@estateiq.com  | P@ssw0rd!  |
| Tenant         | tenant@estateiq.com    | P@ssw0rd!  |

## Key Features

- **Multi-tenant estate management** — manage multiple estates, buildings, and units
- **EMF (Estate Management Fee)** — transparent fee breakdown with landlord/tenant splits
- **Authentication** — JWT with refresh tokens, session management, rate limiting, account lockout
- **RBAC** — Role-based access control (super_admin, estate_manager, landlord, tenant, security, staff)
- **Maintenance** — Service request tracking with priority and assignment
- **Complaints** — Issue reporting with investigation workflow
- **Payments** — Payment tracking (Paystack/Flutterwave ready)
- **Notifications** — In-app, email, SMS, push notification support
- **Visitor management** — Gate access logging
- **Utility metering** — Track electricity, water, gas usage
- **Document management** — Upload and manage lease agreements, receipts, etc.
- **Analytics dashboard** — Occupancy rates, revenue trends, maintenance stats
- **Dark mode** — Full light/dark theme support

## API Endpoints

All endpoints are prefixed with `/api/v1/`.

### Auth
- `POST /auth/register` — Register new user
- `POST /auth/login` — Login
- `POST /auth/refresh` — Refresh access token
- `POST /auth/logout` — Logout
- `GET /auth/me` — Current user profile
- `GET /auth/sessions` — Active sessions
- `DELETE /auth/sessions/:id` — Revoke session

### Estates
- `POST /estates` — Create estate
- `GET /estates` — List estates (paginated, searchable)
- `GET /estates/:id` — Get estate details
- `PUT /estates/:id` — Update estate
- `DELETE /estates/:id` — Soft delete estate
- `POST /estates/:id/buildings` — Add building
- `GET /estates/:id/buildings` — List buildings
- `GET /estates/:id/occupancy-stats` — Occupancy statistics

### Units
- `POST /buildings/:id/units` — Add unit
- `GET /buildings/:id/units` — List units
- `GET /units/:id` — Get unit details
- `PUT /units/:id` — Update unit
- `DELETE /units/:id` — Soft delete unit

### Tenants & Landlords
- `POST /tenants` — Register tenant (creates user + lease)
- `GET /tenants` — List tenants (paginated, searchable)
- `GET /tenants/:id` — Get tenant details
- `DELETE /tenants/:id` — Soft delete tenant
- `POST /landlords` — Register landlord
- `GET /landlords` — List landlords
- `GET /landlords/:id` — Get landlord details
- `DELETE /landlords/:id` — Soft delete landlord

### Payments
- `POST /invoices` — Create invoice
- `GET /invoices` — List invoices (filterable)
- `POST /payments` — Record payment
- `GET /payments` — List payments
- `GET /payments/stats/:estateId` — Payment statistics

### Maintenance
- `POST /maintenance` — Create service request
- `GET /maintenance` — List service requests
- `GET /maintenance/:id` — Get request details
- `PUT /maintenance/:id/status` — Update request status
- `DELETE /maintenance/:id` — Soft delete request
- `GET /maintenance/stats/:estateId` — Maintenance statistics

### Complaints
- `POST /complaints` — File complaint
- `GET /complaints` — List complaints
- `GET /complaints/:id` — Get complaint details
- `PUT /complaints/:id/status` — Update status
- `POST /complaints/:id/updates` — Add update to complaint

### Visitors
- `POST /visitors/invites` — Create visitor invite
- `GET /visitors/invites` — List invites
- `GET /visitors/verify/:pin` — Verify visitor PIN (public)
- `POST /visitors/check-in/:inviteId` — Check in visitor
- `PUT /visitors/check-out/:gateLogId` — Check out visitor
- `GET /visitors/gate-logs/:estateId` — Gate logs

### Notifications
- `GET /notifications` — Get my notifications
- `GET /notifications/unread-count` — Unread count
- `PUT /notifications/:id/read` — Mark as read
- `POST /notifications/mark-all-read` — Mark all read

### Dashboard
- `GET /dashboard/stats` — Role-aware dashboard statistics

### Integrations (Admin only)
- `GET /integrations` — List integrations
- `GET /integrations/:provider` — Get integration config
- `PUT /integrations/:provider` — Update integration config
- `PUT /integrations/:provider/toggle` — Enable/disable integration

### Uploads
- `POST /uploads` — Upload file (multipart)
- `GET /uploads` — List documents
- `DELETE /uploads/:id` — Delete document

## Ghana-Specific Features

- **Currency**: GH₵ (Ghana Cedis)
- **Payment Gateways**: Hubtel, Paystack, Mobile Money
- **SMS**: mNotify integration for SMS notifications
- **Location**: Google Maps for estate mapping (Accra, Kumasi, Tema, etc.)
- **Phone Format**: +233 xxx xxx xxxx

## License

MIT

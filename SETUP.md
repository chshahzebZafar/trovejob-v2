# TroveJob Setup Guide

## 1. Prerequisites
- Node.js 20+
- PostgreSQL (Railway recommended)
- Redis (Upstash recommended or local `redis-server`)
- AWS account (S3 + CloudFront for storage)
- Resend account (transactional emails)

---

## 2. Environment Variables

### packages/db/.env
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/trovejob"
```

### apps/api/.env
```
DATABASE_URL="postgresql://USER:PASSWORD@HOST:5432/trovejob"
JWT_SECRET="min-32-chars-change-this-in-production-xxxxxxxxxxxxxxxxxx"
COOKIE_SECRET="min-32-chars-change-this-in-production-xxxxxxxxxxxxxxxxxx"
WEB_URL="http://localhost:3000"
PORT=4000

AWS_REGION="us-east-1"
AWS_ACCESS_KEY_ID="your-access-key-id"
AWS_SECRET_ACCESS_KEY="your-secret-access-key"
S3_PRIVATE_BUCKET="trovejob-private"
S3_PUBLIC_BUCKET="trovejob-public"
CLOUDFRONT_URL="https://YOUR_DISTRIBUTION_ID.cloudfront.net"

RESEND_API_KEY="re_xxxxxxxxxxxxxxxxxxxxxxxxxxxx"
EMAIL_FROM="TroveJob <noreply@trovejob.com>"

REDIS_URL="redis://localhost:6379"
```

### apps/web/.env.local
```
NEXT_PUBLIC_API_URL="http://localhost:4000"
```

---

## 3. Database Setup

```bash
# 1. Copy and fill in your DATABASE_URL
cp packages/db/.env.example packages/db/.env
# → Edit packages/db/.env with your Railway PostgreSQL URL

# 2. Run migration (creates all tables)
cd packages/db
npx prisma migrate dev --name init
npx prisma generate

# 3. Seed default plans + admin user
npm run db:seed
# Or: npx tsx seed.ts
```

Seed creates:
- 4 default plans: Starter (free), Growth ($49), Pro ($99), Scale ($199)
- Admin user: admin@trovejob.com / ChangeMe123!
  → Change password immediately after first login

To customise admin credentials before seeding:
```bash
ADMIN_EMAIL=you@trovejob.com ADMIN_PASSWORD=YourStrongPass123 npm run db:seed
```

---

## 4. Run Development

```bash
# Terminal 1 — API server
cd apps/api
npm run dev

# Terminal 2 — Next.js frontend
cd apps/web
npm run dev
```

| Service | URL |
|---------|-----|
| API     | http://localhost:4000 |
| Web     | http://localhost:3000 |
| Admin   | http://localhost:3000/admin |
| Employers | http://localhost:3000/employers |

---

## 5. AWS S3 Setup

1. Create bucket `trovejob-private` — Block ALL public access ON
2. Create bucket `trovejob-public` — Block public access OFF
3. Add bucket policy to `trovejob-public` for public read
4. Create IAM user `trovejob-api` with S3FullAccess policy
5. Create CloudFront distribution pointing to `trovejob-public`
6. Fill AWS keys + CLOUDFRONT_URL into `apps/api/.env`

**Local dev without AWS:** You can stub the storage service temporarily.
The API will still run but CV uploads and logo uploads will fail gracefully.

---

## 6. Application Routes

### Public
| Method | Route | Description |
|--------|-------|-------------|
| GET  | /jobs | Browse jobs (with filters) |
| GET  | /jobs/[slug] | Single job + apply CTA |
| GET  | /companies | Browse verified companies |
| GET  | /companies/[slug] | Company profile + open roles |
| GET  | /apply/[slug] | Apply form (no account needed) |
| GET  | /application/[token] | Track application status |

### Employer Portal
| Route | Description |
|-------|-------------|
| /employers/request | Request employer access |
| /employers/login | Sign in |
| /employers/dashboard | Stats + recent applications |
| /employers/jobs | My listings (status control) |
| /employers/jobs/new | Post a new role |
| /employers/applications | Applications inbox (respond inline) |
| /employers/profile | Update company profile + logo |

### Admin Portal
| Route | Description |
|-------|-------------|
| /admin/login | Admin sign in |
| /admin/dashboard | Platform overview |
| /admin/employer-requests | Approve / reject access requests |
| /admin/employers | Manage plans, suspend accounts |
| /admin/listings | Feature jobs, change status |
| /admin/plans | Create / edit subscription plans |
| /admin/analytics | Full platform analytics |

---

## 7. API Endpoints Reference

### Public API
```
GET  /api/jobs               Browse jobs (keyword, locationType, employmentType, salaryMin, page)
GET  /api/jobs/:slug         Single job
GET  /api/companies          Browse companies
GET  /api/companies/:slug    Company profile with active jobs
POST /api/applications       Submit application (multipart: name, email, note, cv, jobId)
GET  /api/applications/status/:token  Check application status (public)
POST /api/alerts             Subscribe to job alerts
DELETE /api/alerts/unsubscribe/:token
```

### Employer API (JWT cookie required)
```
POST   /api/employers/request    Request employer access
POST   /api/employers/login      Login → sets HTTP-only cookie
POST   /api/employers/logout
GET    /api/employers/me         Dashboard stats
GET    /api/employers/jobs       My listings
PATCH  /api/employers/profile    Update company profile
POST   /api/employers/logo       Upload company logo
POST   /api/jobs                 Create job listing
PATCH  /api/jobs/:id             Edit job
PATCH  /api/jobs/:id/status      Change job status
GET    /api/applications         Inbox (jobId?, status?)
GET    /api/applications/:id     View application + pre-signed CV URL
POST   /api/applications/:id/respond  Respond (forward/reject/keep)
```

### Admin API (JWT cookie required)
```
POST   /api/admin/login
GET    /api/admin/dashboard
GET    /api/admin/plans
POST   /api/admin/plans
PATCH  /api/admin/plans/:id
GET    /api/admin/employer-requests   (?status=pending)
POST   /api/admin/employer-requests/:id/approve
POST   /api/admin/employer-requests/:id/reject
GET    /api/admin/employers
PATCH  /api/admin/employers/:id/plan
PATCH  /api/admin/employers/:id/suspend
GET    /api/admin/listings
PATCH  /api/admin/listings/:id
GET    /api/admin/analytics
GET    /api/admin/response-rates
GET    /api/admin/applications
```

---

## 8. Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Next.js 16 (App Router), React 19 |
| Backend | Fastify 5, TypeScript |
| Database | PostgreSQL + Prisma ORM |
| Auth | JWT + HTTP-only cookies |
| Storage | AWS S3 (private CVs + public logos) + CloudFront CDN |
| Email | Resend |
| Queue | BullMQ + Redis |
| Hosting | Vercel (web) + Railway (API + PostgreSQL) |
| Domain | Cloudflare DNS → Vercel |

---

## 9. Key Design Decisions

- **No account to apply** — candidates submit name + email + CV only
- **Application token** — every applicant gets a unique URL to track their status
- **Response rate tracking** — public metric on every company card, updated on every employer response
- **Admin-controlled plans** — billing is manual via Admin dashboard; Stripe fields exist in schema for future wiring
- **One-time employer vetting** — company approved once, then posts freely (no per-listing review bottleneck)
- **Separate S3 buckets** — private for CVs (pre-signed URL access only), public for logos (CDN-served)

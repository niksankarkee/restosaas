# RestoSaaS Starter (Next.js + Tailwind + shadcn-lite / Go + Gin + GORM / Postgres)

## Quickstart
1. Start DB: `npm run db:up`
2. API:
   ```bash
   cd apps/api
   cp .env.example .env
   go run ./cmd/api
   ```
3. Web:
   ```bash
   cd ../../apps/web
   cp .env.local.example .env.local
   npm i
   npm run dev
   ```

### Auth
- Local demo uses headers: `X-Demo-Role` and `X-Demo-User`.
- For **Clerk**, set `CLERK_*` envs in API and wire your Next.js app with Clerk provider (left to your keys).

### Payments (eSewa/Khalti)
Stubs provided. Implement provider callbacks to hit `POST /api/admin/orgs/:id/activate`.

### Slots & Calendar
- `GET /api/restaurants/:slug/slots?date=YYYY-MM-DD`
- Owner UI at `/owner` (demo auth headers used).

### Reviews & Moderation
- `POST /api/reviews` to create; owner approves via `POST /api/owner/reviews/:id/approve`.

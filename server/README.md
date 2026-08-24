# Nonograms server

A small Next.js directory and moderation service backed by SQLite.

## Local development

```bash
cp .env.example .env.local
bun install
bun run dev
```

Set `ADMIN_PASSWORD` and a long random `SESSION_SECRET`, then visit `/admin`. If Resend is not configured, submissions still succeed and their review URLs are printed to the server console.

## Production

The app uses Next.js standalone output. Mount persistent storage and point `DATABASE_PATH` at it; a default container filesystem is not durable on many hosts. Set `NEXT_PUBLIC_SITE_URL` to the final `https://…exe.xyz` origin. Resend must have `foobar.dev` verified before it will send from `noreply@foobar.dev`.

API endpoints:

- `GET /api/puzzles` — approved catalog
- `GET /api/puzzles/:code` — approved puzzle by case-insensitive code
- `POST /api/puzzles` — submit a version-1 puzzle document for review

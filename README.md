# Relay Tool (WhatsApp Control Center)

Web application to manage Evolution API instances, campaigns, warm-up, AI,
contacts, exports, and logs, replacing the legacy terminal menus.

## Architecture

| Area | Responsibility |
| --- | --- |
| `apps/web` | Next.js web dashboard: operations, status, and reports. |
| `apps/api` | Fastify API: future authentication, validation, database, and commands. |
| `apps/worker` | Durable processes: campaigns, warm-up, AI, and exports. |
| `packages/core` | Reusable business rules, Evolution client, AI, and standardized errors. |

State no longer lives in `job.json`, PID files, and log files. Campaigns and
their recipients are stored in PostgreSQL, and the worker only processes
pending items.

## Database and queue

The recommended database is **PostgreSQL**. Locally, `docker-compose.yml`
spins up a Postgres instance. In production you can use Supabase's free tier
by simply replacing `DATABASE_URL`. The queue runs on PostgreSQL itself via
`pg-boss`, avoiding Redis/Firebase as a required dependency.

Firebase is not the recommended primary database: campaigns, attempts,
filters, exports, and logs are relational and auditable, which PostgreSQL
handles better.

## Getting started

```bash
cp .env.example .env
npm install
npm run db:up
npm run db:migrate
npm run dev
```

- Web: `http://localhost:3000`
- API: `http://localhost:3333/health`

`npm run dev` keeps the web app, API, and worker in watch mode and restarts
them on changes. Never commit real keys to code, `.env.example`, or commits.

## Business modules

- **Standard sending**: group(s), single contact, list, or all contacts from the API.
- **Contacts**: manual entry, VCF/XLSX import, reading/pulling from Evolution,
  deduplication, and blocklists/opt-out.
- **Warm-up**: dedicated jobs, daily limit, reply waiting, and status.
- **AI**: provider, model, personas, and templates.
- **Send logs**: success/failure of each attempt only.
- **Development logs**: internal/external calls, duration, errors, and
  sanitized payloads. Credentials are never stored in this log.

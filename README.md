# mail-tracker-fe

Minimal Next.js UI over the [mail-tracker](../mail-tracker) Worker. A send form
and a stats viewer, so you don't hit `curl`.

The Worker's `API_KEY` never reaches the browser — the two route handlers
(`app/api/send`, `app/api/stats`) run server-side and add `x-api-key` when
proxying to the Worker.

## Run

```bash
npm install
cp .env.example .env.local     # set TRACKER_URL and TRACKER_API_KEY
npm run dev                     # http://localhost:3000
```

| Env | Value |
|---|---|
| `TRACKER_URL` | Worker base URL, e.g. `https://mail-tracker.krishnadobhal234.workers.dev` |
| `TRACKER_API_KEY` | the Worker's `API_KEY` secret |

## What it does

- **Send** — `to` / `subject` / `body` (HTML) / `campaign`, an *Attach CV*
  checkbox (`cv: true`), and a file picker (read as base64 → `attachments`).
  Posts to `/api/send` → Worker `/send`.
- **Stats** — enter a campaign, get the per-recipient open table from
  `/api/stats` → Worker `/api/campaigns/<campaign>`.

## Deploy

`npm run build` then host anywhere that runs Next 15 (Vercel, a Node server,
`opennextjs-cloudflare`). Set the two env vars in the host.

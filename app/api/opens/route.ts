// Proxy: browser -> here -> Worker /api/opens/<campaign>, adding x-api-key.
// Gated by APP_PASSWORD — same rule as /api/send, so open data isn't public.

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const base = process.env.TRACKER_URL;
  const key = process.env.TRACKER_API_KEY;
  const sitePassword = process.env.APP_PASSWORD;
  if (!base || !key || !sitePassword) {
    return Response.json(
      { error: 'TRACKER_URL / TRACKER_API_KEY / APP_PASSWORD not set' },
      { status: 500 }
    );
  }
  if (req.headers.get('x-app-password') !== sitePassword) {
    return Response.json({ error: 'wrong password' }, { status: 401 });
  }

  const campaign = new URL(req.url).searchParams.get('campaign')?.trim();
  const path = campaign
    ? `/api/opens/${encodeURIComponent(campaign)}`
    : '/api/opens'; // no campaign -> all events

  const upstream = await fetch(`${base}${path}`, { headers: { 'x-api-key': key } });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}

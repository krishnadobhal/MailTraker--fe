// Proxy: browser -> here -> Worker /api/opens/<campaign>, adding x-api-key.

export const dynamic = 'force-dynamic';

export async function GET(req: Request) {
  const base = process.env.TRACKER_URL;
  const key = process.env.TRACKER_API_KEY;
  if (!base || !key) {
    return Response.json({ error: 'TRACKER_URL / TRACKER_API_KEY not set' }, { status: 500 });
  }

  const campaign = new URL(req.url).searchParams.get('campaign');
  if (!campaign) {
    return Response.json({ error: 'campaign query param required' }, { status: 400 });
  }

  const upstream = await fetch(
    `${base}/api/opens/${encodeURIComponent(campaign)}`,
    { headers: { 'x-api-key': key } }
  );

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}

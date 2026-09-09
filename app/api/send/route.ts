// Proxy: browser -> here -> Worker /send, adding the x-api-key server-side.

export async function POST(req: Request) {
  const base = process.env.TRACKER_URL;
  const key = process.env.TRACKER_API_KEY;
  if (!base || !key) {
    return Response.json({ error: 'TRACKER_URL / TRACKER_API_KEY not set' }, { status: 500 });
  }

  const upstream = await fetch(`${base}/send`, {
    method: 'POST',
    headers: { 'content-type': 'application/json', 'x-api-key': key },
    body: await req.text(),
  });

  return new Response(await upstream.text(), {
    status: upstream.status,
    headers: { 'content-type': 'application/json' },
  });
}

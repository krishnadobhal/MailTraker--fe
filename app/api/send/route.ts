// Proxy: browser -> here -> Worker /send, adding the x-api-key server-side.
// Gated by APP_PASSWORD so a stranger who loads this page can't send mail.

export async function POST(req: Request) {
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

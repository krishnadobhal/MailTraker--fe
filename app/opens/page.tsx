'use client';

import { useState, type FormEvent } from 'react';

type OpenRow = {
  email: string;
  subject: string;
  opened_at: string;
  user_agent: string | null;
  is_proxy: boolean;
  ip_hash: string | null;
};

const fmt = (s: string) => new Date(s).toLocaleString();

export default function OpensPage() {
  const [campaign, setCampaign] = useState('');
  const [rows, setRows] = useState<OpenRow[] | null>(null);
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function load(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr('');
    setRows(null);
    try {
      const r = await fetch(`/api/opens?campaign=${encodeURIComponent(campaign)}`);
      const data = await r.json();
      if (!r.ok) setErr(data.error ?? `HTTP ${r.status}`);
      else setRows(data as OpenRow[]);
    } catch (e2) {
      setErr(String(e2));
    } finally {
      setLoading(false);
    }
  }

  const humans = rows?.filter((r) => !r.is_proxy).length ?? 0;

  return (
    <main>
      <h1>Open events</h1>
      <p className="sub">
        One row per pixel hit for a campaign (newest first, max 500). IPs are
        stored hashed — <code>ip_hash</code> is all we keep.
      </p>

      <section>
        <form onSubmit={load} className="inline">
          <label style={{ flex: 1 }}>
            Campaign
            <input required value={campaign} onChange={(e) => setCampaign(e.target.value)} />
          </label>
          <button disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
        </form>

        {err && <pre className="err">{err}</pre>}
        {rows && (
          <p className="sub" style={{ marginTop: 12 }}>
            {rows.length} hit{rows.length === 1 ? '' : 's'} · {humans} human · {rows.length - humans} proxy/scanner
          </p>
        )}
        {rows && rows.length > 0 && (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Opened at</th>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Kind</th>
                  <th>User agent</th>
                  <th>IP hash</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{fmt(r.opened_at)}</td>
                    <td>{r.email}</td>
                    <td>{r.subject}</td>
                    <td>{r.is_proxy ? 'proxy' : 'human'}</td>
                    <td style={{ whiteSpace: 'normal', maxWidth: 320 }}>{r.user_agent || '—'}</td>
                    <td>{r.ip_hash ? r.ip_hash.slice(0, 12) : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </section>
    </main>
  );
}

'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { getStoredPassword, storePassword } from '../lib/password';

type OpenRow = {
  email: string;
  subject: string;
  campaign: string;
  opened_at: string;
  user_agent: string | null;
  is_proxy: boolean;
  ip_hash: string | null;
};

const fmt = (s: string) => new Date(s).toLocaleString();

export default function OpensPage() {
  const [password, setPassword] = useState(getStoredPassword);
  const [campaign, setCampaign] = useState('');
  const [rows, setRows] = useState<OpenRow[] | null>(null);
  const [scope, setScope] = useState('');
  const [err, setErr] = useState('');
  const [loading, setLoading] = useState(false);

  async function runLoad(c: string, pwd: string) {
    setLoading(true);
    setErr('');
    setRows(null);
    try {
      const qs = c ? `?campaign=${encodeURIComponent(c)}` : '';
      const r = await fetch(`/api/opens${qs}`, { headers: { 'x-app-password': pwd } });
      const data = await r.json();
      if (!r.ok) setErr(data.error ?? `HTTP ${r.status}`);
      else {
        setRows(data as OpenRow[]);
        setScope(c || 'all campaigns');
        storePassword(pwd);
      }
    } catch (e2) {
      setErr(String(e2));
    } finally {
      setLoading(false);
    }
  }

  // Load everything once on first visit, using whatever password is already
  // remembered (from the Send page). If none is stored yet this 401s and the
  // error tells you to enter it below.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    runLoad('', password);
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    runLoad(campaign.trim(), password);
  }

  const humans = rows?.filter((r) => !r.is_proxy).length ?? 0;

  return (
    <main>
      <h1>Open events</h1>
      <p className="sub">
        One row per pixel hit (newest first, max 500). Leave the campaign blank to
        list every campaign. IPs are stored hashed — <code>ip_hash</code> is all
        we keep.
      </p>

      <section>
        <form onSubmit={onSubmit} className="inline">
          <label style={{ width: 160 }}>
            Password
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
            />
          </label>
          <label style={{ flex: 1 }}>
            Campaign
            <input
              value={campaign}
              onChange={(e) => setCampaign(e.target.value)}
              placeholder="blank = all"
            />
          </label>
          <button disabled={loading}>{loading ? 'Loading…' : 'Load'}</button>
        </form>

        {err && <pre className="err">{err}</pre>}
        {rows && (
          <p className="sub" style={{ marginTop: 12 }}>
            {scope}: {rows.length} hit{rows.length === 1 ? '' : 's'} · {humans} human ·{' '}
            {rows.length - humans} proxy/scanner
          </p>
        )}
        {rows && rows.length > 0 && (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Opened at</th>
                  <th>Campaign</th>
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
                    <td>{r.campaign}</td>
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

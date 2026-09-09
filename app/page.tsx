'use client';

import { useState, type FormEvent } from 'react';

type SendResult = { ok?: boolean; token?: string; error?: string; detail?: string };

type StatRow = {
  email: string;
  subject: string;
  sent_at: string;
  total_opens: string;
  human_opens: string;
  first_open: string | null;
  last_open: string | null;
};

function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const r = new FileReader();
    r.onload = () => resolve(String(r.result).split(',')[1] ?? '');
    r.onerror = () => reject(r.error);
    r.readAsDataURL(file);
  });
}

const fmt = (s: string | null) => (s ? new Date(s).toLocaleString() : '—');

export default function Page() {
  // --- send form ---
  const [to, setTo] = useState('');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('<p>Hi,</p>\n');
  const [campaign, setCampaign] = useState('');
  const [cv, setCv] = useState(false);
  const [files, setFiles] = useState<File[]>([]);
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<SendResult | null>(null);

  // --- stats ---
  const [statsCampaign, setStatsCampaign] = useState('');
  const [rows, setRows] = useState<StatRow[] | null>(null);
  const [statsErr, setStatsErr] = useState('');
  const [loadingStats, setLoadingStats] = useState(false);

  async function send(e: FormEvent) {
    e.preventDefault();
    setSending(true);
    setResult(null);
    try {
      const attachments = await Promise.all(
        files.map(async (f) => ({
          filename: f.name,
          base64: await fileToBase64(f),
          contentType: f.type || 'application/octet-stream',
        }))
      );
      const payload: Record<string, unknown> = { to, subject, body };
      if (campaign) payload.campaign = campaign;
      if (cv) payload.cv = true;
      if (attachments.length) payload.attachments = attachments;

      const r = await fetch('/api/send', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: JSON.stringify(payload),
      });
      setResult(await r.json());
    } catch (err) {
      setResult({ error: String(err) });
    } finally {
      setSending(false);
    }
  }

  async function loadStats(e: FormEvent) {
    e.preventDefault();
    setLoadingStats(true);
    setStatsErr('');
    setRows(null);
    try {
      const r = await fetch(`/api/stats?campaign=${encodeURIComponent(statsCampaign)}`);
      const data = await r.json();
      if (!r.ok) setStatsErr(data.error ?? `HTTP ${r.status}`);
      else setRows(data as StatRow[]);
    } catch (err) {
      setStatsErr(String(err));
    } finally {
      setLoadingStats(false);
    }
  }

  return (
    <main>
      <h1>mail-tracker</h1>
      <p className="sub">Send a tracked email and read open stats — no curl.</p>

      <section>
        <h2>Send</h2>
        <form onSubmit={send}>
          <label>
            To
            <input type="email" required value={to} onChange={(e) => setTo(e.target.value)} placeholder="anita@example.com" />
          </label>
          <label>
            Subject
            <input required value={subject} onChange={(e) => setSubject(e.target.value)} />
          </label>
          <label>
            Body (HTML — pixel is appended automatically)
            <textarea required rows={6} value={body} onChange={(e) => setBody(e.target.value)} />
          </label>
          <label>
            Campaign
            <input value={campaign} onChange={(e) => setCampaign(e.target.value)} placeholder="adhoc" />
          </label>
          <label className="row">
            <input type="checkbox" checked={cv} onChange={(e) => setCv(e.target.checked)} />
            Attach CV
          </label>
          <label>
            Attachments
            <input
              type="file"
              multiple
              onChange={(e) => setFiles(e.target.files ? Array.from(e.target.files) : [])}
            />
          </label>
          <button disabled={sending}>{sending ? 'Sending…' : 'Send'}</button>
        </form>
        {result && (
          <pre className={result.ok ? 'ok' : 'err'}>{JSON.stringify(result, null, 2)}</pre>
        )}
      </section>

      <section>
        <h2>Stats</h2>
        <form onSubmit={loadStats} className="inline">
          <label style={{ flex: 1 }}>
            Campaign
            <input required value={statsCampaign} onChange={(e) => setStatsCampaign(e.target.value)} />
          </label>
          <button disabled={loadingStats}>{loadingStats ? 'Loading…' : 'Load'}</button>
        </form>
        {statsErr && <pre className="err">{statsErr}</pre>}
        {rows && rows.length === 0 && <p>No recipients for that campaign.</p>}
        {rows && rows.length > 0 && (
          <div className="tablewrap">
            <table>
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Subject</th>
                  <th>Sent</th>
                  <th>Opens</th>
                  <th>Human</th>
                  <th>First open</th>
                  <th>Last open</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r, i) => (
                  <tr key={i}>
                    <td>{r.email}</td>
                    <td>{r.subject}</td>
                    <td>{fmt(r.sent_at)}</td>
                    <td className="num">{r.total_opens}</td>
                    <td className="num">{r.human_opens}</td>
                    <td>{fmt(r.first_open)}</td>
                    <td>{fmt(r.last_open)}</td>
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

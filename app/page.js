'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

const POLL_MS = 12000;
const GENERIC_ERROR = 'Terjadi kesalahan. Coba lagi.';

function formatUptime(sec) {
  if (!Number.isFinite(sec) || sec < 0) return '-';
  if (sec < 60) return `${Math.floor(sec)}s`;
  const d = Math.floor(sec / 86400);
  const h = Math.floor((sec % 86400) / 3600);
  const m = Math.floor((sec % 3600) / 60);
  if (d > 0) return `${d}d ${h}h ${m}m`;
  if (h > 0) return `${h}h ${m}m`;
  return `${m}m`;
}

export default function Home() {
  const [status, setStatus] = useState(null); // { enabled, connected, uptimeSec } | null
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [toggling, setToggling] = useState(false);
  const busy = useRef(false); // true saat request ON/OFF berjalan

  const refresh = useCallback(async () => {
    if (busy.current) return;
    try {
      const res = await fetch('/api/bot/status', { cache: 'no-store' });
      const data = await res.json();
      if (res.ok) {
        setStatus(data);
        setError('');
      } else {
        setStatus(null);
        setError(data.message || GENERIC_ERROR);
      }
    } catch {
      setStatus(null);
      setError('Tidak dapat terhubung ke panel.');
    } finally {
      setLoading(false);
    }
  }, []);

  // Ambil status saat dibuka, lalu polling ringan hanya saat tab terlihat.
  useEffect(() => {
    refresh();
    const tick = () => document.visibilityState === 'visible' && refresh();
    const id = setInterval(tick, POLL_MS);
    document.addEventListener('visibilitychange', tick);
    return () => {
      clearInterval(id);
      document.removeEventListener('visibilitychange', tick);
    };
  }, [refresh]);

  async function toggle() {
    if (busy.current || !status) return;
    busy.current = true;
    setToggling(true);
    setError('');
    try {
      const res = await fetch('/api/bot/status', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: !status.enabled }),
      });
      const data = await res.json();
      if (res.ok) setStatus(data);
      else setError(data.message || GENERIC_ERROR);
    } catch {
      setError('Tidak dapat terhubung ke panel.');
    } finally {
      busy.current = false;
      setToggling(false);
    }
  }

  const enabled = status?.enabled ?? false;
  const connected = status?.connected ?? false;

  let label = enabled ? 'Turn OFF' : 'Turn ON';
  if (toggling) label = enabled ? 'Turning off...' : 'Turning on...';

  return (
    <main className="wrap">
      <section className="card">
        <h1>WhatsApp AI Bot</h1>
        <p className="sub">Control Panel</p>

        <ul className="states">
          <li>
            <span className={`dot ${enabled ? 'on' : 'off'}`} />
            {enabled ? 'Bot Online' : 'Bot Offline'}
          </li>
          <li>
            <span className={`dot ${connected ? 'on' : 'off'}`} />
            {connected ? 'WhatsApp Connected' : 'WhatsApp Disconnected'}
          </li>
        </ul>

        <div className="uptime">
          <span className="muted">Uptime</span>
          <strong>{status ? formatUptime(status.uptimeSec) : '-'}</strong>
        </div>

        {error && (
          <p className="error" role="alert">
            {error}
          </p>
        )}

        {loading ? (
          <p className="muted center">Memuat status...</p>
        ) : (
          status && (
            <button
              className={enabled ? 'btn danger' : 'btn primary'}
              onClick={toggle}
              disabled={toggling}
            >
              {label}
            </button>
          )
        )}
      </section>
    </main>
  );
}

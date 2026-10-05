// Proxy server-side ke API kontrol bot. Token hanya dibaca di sini, tidak pernah ke browser.
export const dynamic = 'force-dynamic';

const TIMEOUT_MS = 8000;

const json = (body, status = 200) =>
  Response.json(body, { status, headers: { 'Cache-Control': 'no-store' } });

const fail = (status, error, message) => json({ error, message }, status);

async function callBot(method, payload) {
  const url = (process.env.BOT_URL || '').replace(/\/+$/, '');
  const token = process.env.BOT_CONTROL_TOKEN || '';
  if (!url || !token) return fail(500, 'config', 'Panel belum dikonfigurasi.');

  try {
    const res = await fetch(`${url}/status`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: payload ? JSON.stringify(payload) : undefined,
      cache: 'no-store',
      signal: AbortSignal.timeout(TIMEOUT_MS),
    });

    if (res.status === 401 || res.status === 403) {
      return fail(502, 'unauthorized', 'Token kontrol tidak valid.');
    }
    if (!res.ok) return fail(502, 'bad_response', 'Bot server mengembalikan error.');

    const data = await res.json();
    // Hanya teruskan field yang dibutuhkan UI.
    return json({
      enabled: Boolean(data.enabled),
      connected: Boolean(data.connected),
      uptimeSec: Number(data.uptimeSec) || 0,
    });
  } catch (e) {
    if (e?.name === 'TimeoutError' || e?.name === 'AbortError') {
      return fail(504, 'timeout', 'Connection timeout.');
    }
    return fail(502, 'unreachable', 'Bot server tidak dapat dihubungi.');
  }
}

export async function GET() {
  return callBot('GET');
}

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return fail(400, 'bad_request', 'Request tidak valid.');
  }
  if (typeof body?.enabled !== 'boolean') {
    return fail(400, 'bad_request', 'Request tidak valid.');
  }
  return callBot('POST', { enabled: body.enabled });
}

# WhatsApp AI Bot - Control Panel

Panel kecil (Next.js) untuk melihat status dan menyalakan/mematikan bot. Bot tetap jalan di VPS.
Token kontrol hanya dipakai di API route server-side, tidak pernah dikirim ke browser.

## Struktur
```
app/
  api/bot/status/route.js   proxy server-side (GET/POST)
  page.js                   dashboard
  layout.js
  globals.css
.env.example
.gitignore
package.json
```

## Jalankan lokal
1. `npm install`
2. `cp .env.example .env`
3. Isi `.env`:
   ```
   BOT_URL=https://alamat-server-bot
   BOT_CONTROL_TOKEN=token-rahasia
   ```
4. `npm run dev` lalu buka http://localhost:3000

## Deploy ke Vercel
1. Push project ke GitHub (`.env` tidak ikut karena ada di `.gitignore`).
2. Di Vercel: Add New > Project > pilih repo.
3. Settings > Environment Variables, tambahkan `BOT_URL` dan `BOT_CONTROL_TOKEN`
   (jangan pakai prefix `NEXT_PUBLIC_`).
4. Deploy. Ubah env = redeploy.

## Hubungkan dengan VPS bot
- Di `.env` bot, set `BOT_CONTROL_TOKEN` dengan nilai yang SAMA persis dengan di Vercel.
- Bot harus menyediakan `GET /status` dan `POST /status` (`{"enabled": true|false}`),
  dengan header `Authorization: Bearer <token>`.
- Port kontrol bot (`CONTROL_PORT`, default 3000) harus bisa diakses dari internet,
  karena IP Vercel tidak tetap (jangan whitelist IP). Pasang HTTPS lewat Caddy/nginx
  lalu isi `BOT_URL` dengan alamat HTTPS-nya.
- Tes cepat dari terminal:
  ```
  curl -H "Authorization: Bearer TOKEN" https://alamat-server-bot/status
  ```

## Penting: lindungi akses panel
Panel ini sengaja tanpa login. Siapa pun yang tahu URL-nya bisa menekan ON/OFF.
Aktifkan **Password Protection / Vercel Authentication** di Vercel
(Settings > Deployment Protection), atau jangan bagikan URL-nya.

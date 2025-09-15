# ETH→ARS Backend (Vercel)

## Endpoints
- `GET /api/price` → precio ETH/ARS (mediana CriptoYa)
- `POST /api/charge` → registra consulta y cobra el fee (Mercado Pago)

## Variables de entorno (Vercel → Project Settings → Environment Variables)
- `CORS_ORIGIN` (ej: `chrome-extension://<ID_DE_TU_EXTENSION>`)
- `MP_ACCESS_TOKEN` (Access Token productivo de Mercado Pago)
- `MP_PAYER_EMAIL` *(opcional)*
- `CRYPTOYA_TIMEOUT_MS` *(opcional, ej: `3000`)*

## Deploy
```bash
vercel login
vercel
vercel env add CORS_ORIGIN
vercel env add MP_ACCESS_TOKEN
vercel env add MP_PAYER_EMAIL
vercel env add CRYPTOYA_TIMEOUT_MS
vercel deploy --prod
```
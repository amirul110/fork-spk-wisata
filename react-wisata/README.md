# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) (or [oxc](https://oxc.rs) when used in [rolldown-vite](https://vite.dev/guide/rolldown)) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.


## Setup Environment Variable

Sebelum `npm run dev`, copy `.env.example` jadi `.env`:

```bash
cp .env.example .env
```

Isi minimal:

```
VITE_API_BASE_URL=http://localhost:5000/api/v1
```

> Backend di-mount di prefix `/api/v1`, jadi base URL **wajib** diakhiri `/api/v1` (tanpa trailing slash).

### Troubleshooting: `POST http://localhost:5173/auth/login 404`

Kalau request login nyasar ke port `5173` (port Vite), berarti `VITE_API_BASE_URL`
tidak terbaca → axios fallback ke origin browser. Cek:

1. File `.env` ada di folder `react-wisata/` (bukan di root repo).
2. Variabel pakai prefix `VITE_` (Vite hanya expose env yang diawali `VITE_`).
3. Restart dev server setelah mengubah `.env` (Vite tidak hot-reload env).


## Switching Local ↔ Production (saat mau hosting)

Yang perlu diubah cuma **dua tempat** (semua via env, tidak ada yang hardcode):

### 1. Frontend — `react-wisata/.env` (atau buat `.env.production`)

```diff
- VITE_API_BASE_URL=http://localhost:5000/api/v1
+ VITE_API_BASE_URL=https://wisatamagetan.xyz/api/v1
```

Lalu build ulang:

```bash
npm run build
```

### 2. Backend — `backend/.env`

```diff
  NODE_ENV=production
- ALLOWED_ORIGINS=http://localhost:5173,http://localhost:5174
+ ALLOWED_ORIGINS=https://wisatamagetan.xyz,https://www.wisatamagetan.xyz
```

> Domain production (`wisatamagetan.xyz`) memang sudah ter-whitelist di
> `backend/src/config/cors.js`, jadi backend siap menerima request dari
> sana tanpa perlu edit code.

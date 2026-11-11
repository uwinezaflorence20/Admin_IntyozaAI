# Intyoza Admin

Admin console for [Intyoza](../Intyoza-SRH-Platform), the youth sexual and reproductive health platform.
It uses the same design tokens as the Intyoza web app (purple brand, light/dark themes).

Built with React 19, TypeScript, Vite, React Router and Tailwind CSS 4.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 — you are redirected to `/admin/login`.

Other scripts: `npm run build` (typecheck + production build to `dist/`), `npm run preview`, `npm run lint`, `npm run typecheck`.

When deploying `dist/`, configure the host to serve `index.html` for every route (SPA fallback), so links like `/admin/community` work on reload.

## Sections

| Page | What it is for |
|---|---|
| Community | Pending reports, spaces and their posts, hiding posts, adding spaces (connected) |
| Learning | Learning categories are connected; lessons and Myth Buster are design only |
| Profile | Details are read from the backend; saving changes is not connected |
| Dashboard, Users, AI Safety, Services | Design only, with empty states |
| Forgot and reset password | Design only: no email is sent and no password changes |

## Backend endpoints

The console uses these endpoints from the backend (see `src/lib/api.ts`):

- `POST /auth/login` → `{ token, user }`; only `user.role === "ADMIN"` can sign in
- `GET /admin/community/reports`, `PATCH /admin/community/posts/:postId/hide`
- `GET|POST /community/spaces`, `GET /community/spaces/:spaceId/posts`
- `GET /learning/categories`, `POST /admin/learning/categories`
- `GET /auth/me`

In development, Vite proxies `/api/v1` to `http://localhost:4000`, so start the backend first.

Pages tagged **Not connected yet** have no backend endpoint. Connect one by replacing its empty function in `src/lib/api.ts` with a real request.

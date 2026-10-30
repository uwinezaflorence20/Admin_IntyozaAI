# Intyoza Admin

Admin console for [Intyoza](../Intyoza-SRH-Platform), the youth sexual and reproductive health platform.
It uses the same design tokens as the Intyoza web app (purple brand, light/dark themes).

Built with React 19, TypeScript, Vite, React Router and Tailwind CSS 4.

## Getting started

```bash
cp .env.example .env.local   # set VITE_ADMIN_DEMO=true to preview without a backend
npm install
npm run dev
```

Open http://localhost:3000 — you are redirected to `/admin/login`.

Other scripts: `npm run build` (typecheck + production build to `dist/`), `npm run preview`, `npm run lint`, `npm run typecheck`.

When deploying `dist/`, configure the host to serve `index.html` for every route (SPA fallback), so links like `/admin/users` work on reload.

## Sections

| Page | What it is for |
|---|---|
| Dashboard | Sign-ups, AI conversations, topics, age groups, language, and what needs attention |
| Users | Aliases, age group, language, role changes, deletion (no chat content is ever shown) |
| AI Safety | Escalations raised by Intyoza AI and follow-up status |
| Community | Pre-moderation queue and reported posts |
| Learning | Lessons, quizzes and Myth Buster content |
| Services | Health facilities that Intyoza refers people to |
| Profile | Admin details and password |

## Backend endpoints

The console expects these endpoints on `VITE_API_URL` (see `src/lib/api.ts`).
Until an endpoint exists (404 or unreachable), its page shows **Sample data** from `src/data/sampleData.ts`.

- `POST /auth/admin/login` → `{ token, user }` with `user.role === "ADMIN"`
- `GET /auth/me`
- `PATCH /admin/me`, `PUT /admin/me/password`
- `GET /admin/overview`, `GET|PATCH|DELETE /admin/users[/:id]`
- `GET /admin/ai/quality`, `GET|PATCH /admin/ai/escalations[/:id]`
- `GET /admin/community/queue`, `GET /admin/community/groups`, `PATCH /admin/community/posts/:id`
- `GET /admin/learning/lessons`, `GET /admin/myths`, `GET /admin/facilities`

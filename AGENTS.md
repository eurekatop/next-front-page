# AGENTS.md

## What This Repo Is
- Next.js pages-router app with React + TypeScript.
- Content is file-based under `content/`; shared UI is in `components/`; route logic is in `pages/`; helpers are in `lib/`.
- i18n locales are `ca`, `es`, `en`, with `ca` as default.

## High-Signal Quirks
- `pages/index.tsx` loads posts, featured projects, and explorations on the server.
- Content helpers read from `BASE_CONTENT_DIR`; if it is unset, post/project lookup can throw.
- `lib/posts.ts` falls back across locales when a slug is missing.
- Homepage, blog, category, RSS, sitemap, and contact routes already exist; prefer extending them over inventing a new routing scheme.

## Commands
- `npm run dev` for local development.
- `npm run build` is the required verification step.
- `npm run start` runs the Next production server.
- `npm run start-server` is a custom Node server entrypoint.
- `npm run generate` runs `generatePost.ts`.
- There is no `lint` script in `package.json`.

## Editing Rules
- Keep changes small and reviewable.
- Preserve the current architecture unless the task explicitly asks for a restructure.
- Do not couple core pages to fragile external services.
- Keep optional integrations fail-soft so public pages still build and render.

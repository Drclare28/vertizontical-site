## Purpose

Quick guidance to make AI coding agents productive in this Fresh/Deno site.
Be concrete: list where logic lives, how routing and assets work, common commands,
and small code examples drawn from this repo.

## Big picture (what this project is)
- Framework: Fresh (Deno + Preact) using file-system routes and the islands model.
- Dev server: Vite for HMR during development (`deno task dev` runs `vite`).
- Server: Deno (production server served from `_fresh/server.js` via `deno serve -A _fresh/server.js`).

Key files to inspect when editing behavior:
- `main.ts` — application boot, middleware, `app.fsRoutes()` registers `routes/` files.
- `client.ts` — imports styles (e.g. `assets/styles.css`) to enable HMR.
- `routes/_app.tsx` and `routes/_layout.tsx` — top-level HTML and layout wrappers (see `routes/_app.tsx`).
- `utils.ts` — project `State` type and `define` helper (used for `define.page` / `define.middleware`).
- `vite.config.ts` — Vite + `@fresh/plugin-vite` + Tailwind plugin configuration.

## Commands (how to build, run, lint)
- Development (HMR): `deno task dev`  — launches Vite dev server.
- Production build: `deno task build`  — builds static server artifacts with Vite.
- Start production server: `deno task start`  — runs `deno serve -A _fresh/server.js`.
- Check / format / lint: `deno task check` (runs `deno fmt --check`, `deno lint`, `deno check`).

If you change import maps or runtime imports, update `deno.json`'s `imports` block. Note many deps are JSResolver (`jsr:`) or `npm:` aliases.

## Project-specific conventions
- Routing: filesystem-based under `routes/`. Put API endpoints under `routes/api/` and pages as `routes/<name>.tsx`.
- Middleware & State: `utils.ts` exports `define` and `State` used across middlewares and pages. Use `define.middleware(...)` to create middleware and `ctx.state` for shared values (see `main.ts`).
- Static files: `assets/` holds images and `assets/styles.css` is imported in `client.ts` for HMR. `_fresh/` is auto-generated — do not edit.
- Components vs Islands: `components/` for server-rendered UI components, `islands/` for client-interactive islands. (Both folders exist; add code there.)

## Integration points / examples
- Example middleware pattern (from `main.ts`):
  - `app.use(define.middleware((ctx) => { /* modify ctx.state */; return ctx.next(); }));`
- Example route usage: `app.fsRoutes()` in `main.ts` wires `routes/` files; prefer file-based route files like `routes/api/hello.ts` or `routes/about.tsx` for handlers/pages.
- Example to add CSS: import the file in `client.ts` (already importing `assets/styles.css`) so Vite picks it up for HMR.

## What to avoid
- Do not edit files under `_fresh/` — they are generated.
- Avoid changing `deno.json` import aliases without updating corresponding code that imports modules (e.g., `fresh`, `preact`).

## Debugging tips
- For quick checks use `console.log` in middleware or route handlers; logs appear in the terminal running `deno task dev`.
- If HMR behaves oddly, restart `deno task dev` (Vite) and check browser console for module errors.

## Where to look for more context
- Start at `main.ts` → `routes/` → `routes/_app.tsx` / `routes/_layout.tsx` → `client.ts` → `assets/`.

If anything here is unclear or you'd like more examples (e.g., a template for a new API route or an island component), tell me which one and I will add it.

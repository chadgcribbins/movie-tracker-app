# CLAUDE.md

Instructions for Claude Code when working in this project.

## Build Commands

- `npm run dev` — start Vite dev server (http://localhost:5173)
- `npm run build` — production build
- `npm run preview` — preview production build
- `npm run build-list` — regenerate master list from source JSONs
- `npm run enrich` — re-enrich movies from TMDB (requires TMDB_API_KEY in .env.local)

## Code Style

- **Plain JSX** — no TypeScript, no state management library
- **2-space indentation** for all JS/JSX
- **camelCase** for variables/functions, **PascalCase** for components
- **Tailwind CSS** for all styling — no custom CSS unless it can't be done with Tailwind (curtain animation is the exception)
- **React hooks only** — `useState`, `useMemo`, `useCallback`, `useEffect`, `useRef`
- **ES modules** throughout (`"type": "module"` in package.json)

## Key Architecture

- `src/data/movies.json` is the source of truth — committed, app works without API key
- TMDB poster CDN at runtime: `https://image.tmdb.org/t/p/w342/{posterPath}`
- localStorage for watched/adopted/submitted state (see `src/utils/storage.js`)
- Director's Chair component uses live TMDB search API (needs `VITE_TMDB_API_KEY` env var)
- Scripts in `scripts/` are Node.js CLI tools for the data pipeline, not part of the app build

## Environment

- TMDB API key goes in `.env.local` as both `TMDB_API_KEY` (for scripts) and `VITE_TMDB_API_KEY` (for client)
- `.env.local` is gitignored

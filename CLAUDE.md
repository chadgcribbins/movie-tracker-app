# Kids Movie Tracker - Project Context

## Overview
A React app to track watched kids/family movies, curated from 6 "best of" lists and enriched via TMDB API. Deployed on Vercel at `movie-tracker-app-psi.vercel.app`.

## Tech Stack
- **React 18** + **Vite 4.3.9** + **Tailwind CSS 3.3.2**
- **lucide-react** for icons
- **TMDB API** (key in `.env.local` as `VITE_TMDB_API_KEY` and `TMDB_API_KEY`)
- No TypeScript, no state management library — plain JSX + hooks
- ES modules (`"type": "module"` in package.json)

## Current State (as of Feb 2026)
- **399 movies** in `src/data/movies.json` (committed, app works without API key)
- **162 franchise collections** with **294 collection movies** (sequels not in main list)
- **5 view modes**: Grid, Genre, Studio, Rating, Franchise
- **Theater curtain** click-to-open reveal animation
- **YouTube trailers** via poster click
- **Director's Chair** button (bottom-right) to submit new movies via TMDB search
- **Export/Import** watched state as JSON
- **localStorage** persistence for watched + adopted state

## Key Data Model
```
movies.json = {
  metadata: { movieCount, collectionCount, generated },
  movies: [{ tmdbId, title, year, posterPath, genres[], runtime, overview,
             certification, voteAverage, collectionId, sources[], consensusScore,
             trailerKey, studioKey }],
  collections: { "id": { name, movieTmdbIds[] } },
  collectionMovies: { "tmdbId": { ...movieFields } }
}
```

## File Structure
```
src/
  App.jsx                    # Main orchestrator
  main.jsx                   # Entry point
  index.css                  # Curtain CSS, animations
  data/movies.json           # All movie data (committed)
  components/
    CurtainReveal.jsx        # Theater curtain animation
    Header.jsx               # Title + progress bar + curtain toggle
    ProgressBar.jsx           # Animated fill bar
    SearchBar.jsx             # Search input
    FilterBar.jsx             # All/Watched/To Watch + sort buttons
    ViewToggle.jsx            # Grid/Genre/Studio/Rating/Franchise toggle
    ExportImport.jsx          # Migrate dropdown (export/import JSON)
    MovieCard.jsx             # Card with poster, genres, watched toggle
    MovieGrid.jsx             # Grid view
    GenreView.jsx             # Group by genre (collapsible)
    StudioView.jsx            # Group by production studio (collapsible)
    RatingView.jsx            # Group by US/UK certification (collapsible)
    FranchiseView.jsx         # Group by collection + standalone
    FranchiseGroup.jsx        # Single franchise with curated + ghosted movies
    DirectorChair.jsx         # Submit-a-movie panel (TMDB search)
    TrailerModal.jsx          # YouTube embed modal
    EmptyState.jsx            # "No results" message
  hooks/
    useWatchedState.js        # watched + adopted Sets, localStorage
    useMovieFilters.js        # search, filter, sort, viewMode
  utils/
    storage.js                # localStorage helpers (watched, adopted, submitted)
    exportImport.js           # Export/import v2 format
scripts/
  master-list.js              # Aggregate source lists
  enrich-tmdb.js              # TMDB enrichment pipeline
  tmdb-cache.json             # TMDB cache (gitignored, ~3MB)
```

## Studio Classification
- Uses TMDB production company IDs mapped to studioKeys
- Priority: animation studios > franchise studios > major studios
- 90.5% classification rate, unclassified go to "Independent & Other"
- StudioView has 30 studio groups (Disney, Pixar, DreamWorks, Marvel, etc.)

## TMDB Integration
- Posters: `https://image.tmdb.org/t/p/w342/{posterPath}` (no API call)
- Trailers: `https://www.youtube.com/embed/{trailerKey}?autoplay=1&rel=0`
- Director's Chair uses live TMDB search API (needs `VITE_TMDB_API_KEY`)

## Mobile Considerations
- View toggle and Migrate button show icons-only on mobile (`hidden sm:inline`)
- Director's Chair is a simple fixed button (`bottom-2 right-4`) with slight rotation
- Cards use 2-column grid on mobile, scaling up to 5-6 on desktop

## Git & Deploy
- GitHub: `chadgcribbins/movie-tracker-app` on `main` branch
- Auto-deploys to Vercel on push
- `.gitignore` covers: node_modules, dist, .env, .env.local, scripts/tmdb-cache.json

## Build Commands
- `npm run dev` — local dev server
- `npm run build` — production build (~554KB JS, 194KB gzipped)
- `npm run build-list` — regenerate master list from source JSONs
- `npm run enrich` — re-enrich from TMDB (requires API key)

## Recent Changes
- Added 30 movies (Mike Myers, SNL classics, Adam Sandler films) — 399 total
- Added Rating view (US/UK certifications: G/U, PG/PG, PG-13/12A, R/15)
- Director's Chair submit-a-movie feature
- Mobile layout fixes (icon-only buttons, tappable Director's Chair)
- Title headers with counts on all view modes
- Happy Madison studio group added

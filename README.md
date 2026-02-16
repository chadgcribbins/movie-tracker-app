# Kids Movie Tracker

A React app to track your family's progress through 399 curated kids and family movies. Aggregated from 6 "best of" lists, enriched with TMDB data, and deployed on Vercel.

## Features

- **399 movies** curated from Fatherly, Rotten Tomatoes, Common Sense Media, Empire, Time Out, and manual picks
- **5 view modes** — Grid, Genre, Studio, Rating (US/UK), and Franchise
- **Theater curtain** reveal animation on load
- **YouTube trailers** — click any poster to watch the trailer
- **Director's Chair** — submit new movies via TMDB search (bottom-right button)
- **Franchise grouping** — 162 collections with ghosted sequel movies you can adopt
- **Studio grouping** — 30 studio categories powered by TMDB production company data
- **Rating grouping** — US MPAA (G, PG, PG-13, R) with UK equivalents (U, PG, 12A, 15)
- **Search & filter** — by title, genre, year, watched/unwatched status
- **Sort** — by consensus score, title, year, or TMDB rating
- **Export/Import** — save and restore watched state as JSON
- **Responsive** — works on mobile and desktop

## Quick Start

```bash
npm install
npm run dev
```

Open http://localhost:5173

## Production Build

```bash
npm run build
npm run preview
```

## Data Pipeline

The movie data is pre-built and committed as `src/data/movies.json` — the app works immediately after clone with no API key needed.

To regenerate the data (requires a [TMDB API key](https://www.themoviedb.org/settings/api)):

```bash
# Add your key to .env.local
echo "TMDB_API_KEY=your_key_here" > .env.local
echo "VITE_TMDB_API_KEY=your_key_here" >> .env.local

# Regenerate master list from source JSONs
npm run build-list

# Enrich with TMDB data (posters, trailers, certifications, collections)
npm run enrich
```

## Tech Stack

- **React 18** — hooks-only, no state management library
- **Vite 4** — build tool
- **Tailwind CSS 3** — styling
- **lucide-react** — icons
- **TMDB API** — movie data, posters, trailers

## Project Structure

```
src/
  App.jsx                     # Main orchestrator
  data/movies.json            # 399 movies + 162 collections (committed)
  components/
    CurtainReveal.jsx         # Theater curtain animation
    Header.jsx                # Title, progress bar, curtain toggle
    MovieCard.jsx             # Movie poster card with watched toggle
    MovieGrid.jsx             # Grid view
    GenreView.jsx             # Group by genre
    StudioView.jsx            # Group by production studio
    RatingView.jsx            # Group by US/UK certification
    FranchiseView.jsx         # Group by collection
    FranchiseGroup.jsx        # Single franchise with adopt/watch
    DirectorChair.jsx         # Submit-a-movie TMDB search panel
    TrailerModal.jsx          # YouTube embed modal
    SearchBar / FilterBar / ViewToggle / ExportImport / ...
  hooks/
    useWatchedState.js        # Watched + adopted state with localStorage
    useMovieFilters.js        # Search, filter, sort, view mode
  utils/
    storage.js                # localStorage helpers
    exportImport.js           # JSON export/import (v2 with adopted state)
scripts/
  master-list.js              # Aggregate 6 source lists
  enrich-tmdb.js              # TMDB enrichment pipeline
```

## Deploy

Auto-deploys to Vercel on push to `main`.

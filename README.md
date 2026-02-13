# 🎬 Kids Movie Tracker

A React app to track your progress through the top 100 kids movies. Mark movies as watched, search through titles, and automatically load movie posters.

## Features

- ✅ Track which movies you've watched (100 total)
- 🎨 Automatically loads movie posters using AI
- 🔍 Search and filter by watched/unwatched status
- 💾 Saves your progress in browser localStorage
- 📱 Responsive design for mobile and desktop

## Setup

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Run the development server:**
   ```bash
   npm run dev
   ```

3. **Open in browser:**
   - The app will be running at `http://localhost:5173`

## Building for Production

```bash
npm run build
npm run preview
```

## How It Works

- The app loads all 100 movies from the curated list
- Posters are fetched automatically in batches using Claude AI
- Your watched status is saved to localStorage
- Filter between all movies, watched, or unwatched
- Search for specific titles

## Tech Stack

- React 18
- Vite (build tool)
- Tailwind CSS (styling)
- Lucide React (icons)
- Anthropic Claude API (poster fetching)

## Development

The main component is in `src/App.jsx`. The movie data is embedded directly in the component, but you could easily move it to a separate JSON file or fetch it from an API.

### Project Structure

```
movie-tracker-app/
├── src/
│   ├── App.jsx          # Main component with movie tracker logic
│   ├── main.jsx         # React app initialization
│   └── index.css        # Global styles with Tailwind
├── index.html           # HTML entry point
├── package.json         # Dependencies and scripts
├── vite.config.js       # Vite configuration
├── tailwind.config.js   # Tailwind CSS configuration
└── postcss.config.js    # PostCSS configuration
```

## Customization

You can customize:
- Movie list in `src/App.jsx` (movieData array)
- Colors and styling in Tailwind classes
- Poster fetching logic (currently uses Claude API)
- localStorage key for saved data

Enjoy tracking your movie watching progress! 🍿

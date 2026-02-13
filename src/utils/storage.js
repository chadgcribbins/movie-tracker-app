const STORAGE_KEY = 'movieTracker_watched';
const ADOPTED_KEY = 'movieTracker_adopted';
const LEGACY_KEY = 'watchedMovies';

function loadSet(key) {
  const raw = localStorage.getItem(key);
  if (raw) {
    try {
      const ids = JSON.parse(raw);
      return new Set(Array.isArray(ids) ? ids : []);
    } catch {
      return new Set();
    }
  }
  return null;
}

/**
 * Load watched tmdbIds from localStorage.
 */
export function loadWatched() {
  const set = loadSet(STORAGE_KEY);
  if (set) return set;

  // Check for legacy format
  const legacy = localStorage.getItem(LEGACY_KEY);
  if (legacy) {
    console.info('Found legacy watchedMovies format. Migration requires rank-to-tmdbId mapping.');
    return new Set();
  }

  return new Set();
}

/**
 * Save watched tmdbIds to localStorage.
 */
export function saveWatched(watchedSet) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(Array.from(watchedSet)));
}

/**
 * Load adopted tmdbIds from localStorage.
 * Adopted = non-curated franchise movies the user added to their list.
 */
export function loadAdopted() {
  return loadSet(ADOPTED_KEY) || new Set();
}

/**
 * Save adopted tmdbIds to localStorage.
 */
export function saveAdopted(adoptedSet) {
  localStorage.setItem(ADOPTED_KEY, JSON.stringify(Array.from(adoptedSet)));
}

/**
 * Clear all state.
 */
export function clearWatched() {
  localStorage.removeItem(STORAGE_KEY);
  localStorage.removeItem(ADOPTED_KEY);
  localStorage.removeItem(LEGACY_KEY);
}

// --- User-submitted movies ---

const SUBMITTED_KEY = 'movieTracker_submitted';

/**
 * Load user-submitted movies from localStorage.
 * Returns an array of movie objects.
 */
export function loadSubmitted() {
  const raw = localStorage.getItem(SUBMITTED_KEY);
  if (raw) {
    try {
      const arr = JSON.parse(raw);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  }
  return [];
}

/**
 * Save user-submitted movies to localStorage.
 */
export function saveSubmitted(moviesArray) {
  localStorage.setItem(SUBMITTED_KEY, JSON.stringify(moviesArray));
}

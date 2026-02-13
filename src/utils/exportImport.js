import { loadWatched, saveWatched } from './storage';

/**
 * Export watched state as a downloadable JSON file.
 */
export function exportWatchedState(movies) {
  const watched = loadWatched();
  const exportData = {
    version: 1,
    exported: new Date().toISOString(),
    watchedTmdbIds: Array.from(watched),
    watchedCount: watched.size,
    movieManifest: movies
      .filter(m => watched.has(m.tmdbId))
      .map(m => ({ tmdbId: m.tmdbId, title: m.title, year: m.year })),
  };

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `movie-tracker-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Import watched state from a JSON file. Returns the new Set of watched IDs.
 */
export function importWatchedState(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = JSON.parse(e.target.result);

        if (!data.watchedTmdbIds || !Array.isArray(data.watchedTmdbIds)) {
          reject(new Error('Invalid file format: missing watchedTmdbIds'));
          return;
        }

        // Merge with existing watched state
        const current = loadWatched();
        for (const id of data.watchedTmdbIds) {
          current.add(id);
        }

        saveWatched(current);
        resolve(current);
      } catch (err) {
        reject(new Error('Failed to parse import file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

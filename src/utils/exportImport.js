import { loadWatched, saveWatched, loadAdopted, saveAdopted } from './storage';

/**
 * Export watched + adopted state as a downloadable JSON file.
 */
export function exportWatchedState(movies) {
  const watched = loadWatched();
  const adopted = loadAdopted();
  const exportData = {
    version: 2,
    exported: new Date().toISOString(),
    watchedTmdbIds: Array.from(watched),
    adoptedTmdbIds: Array.from(adopted),
    watchedCount: watched.size,
    adoptedCount: adopted.size,
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
 * Import watched + adopted state from a JSON file.
 * Returns { watched: Set, adopted: Set }.
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
        const currentWatched = loadWatched();
        for (const id of data.watchedTmdbIds) {
          currentWatched.add(id);
        }
        saveWatched(currentWatched);

        // Merge adopted state (v2+ files)
        const currentAdopted = loadAdopted();
        if (data.adoptedTmdbIds && Array.isArray(data.adoptedTmdbIds)) {
          for (const id of data.adoptedTmdbIds) {
            currentAdopted.add(id);
          }
          saveAdopted(currentAdopted);
        }

        resolve({ watched: currentWatched, adopted: currentAdopted });
      } catch (err) {
        reject(new Error('Failed to parse import file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}

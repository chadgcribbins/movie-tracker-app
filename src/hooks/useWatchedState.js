import { useState, useCallback, useEffect } from 'react';
import { loadWatched, saveWatched, loadAdopted, saveAdopted } from '../utils/storage';

export function useWatchedState() {
  const [watched, setWatched] = useState(() => loadWatched());
  const [adopted, setAdopted] = useState(() => loadAdopted());

  // Persist watched
  useEffect(() => {
    saveWatched(watched);
  }, [watched]);

  // Persist adopted
  useEffect(() => {
    saveAdopted(adopted);
  }, [adopted]);

  const toggleWatched = useCallback((tmdbId) => {
    setWatched(prev => {
      const next = new Set(prev);
      if (next.has(tmdbId)) {
        next.delete(tmdbId);
      } else {
        next.add(tmdbId);
      }
      return next;
    });
  }, []);

  const toggleAdopted = useCallback((tmdbId) => {
    setAdopted(prev => {
      const next = new Set(prev);
      if (next.has(tmdbId)) {
        next.delete(tmdbId);
        // Also remove from watched if un-adopting
        setWatched(w => {
          const nw = new Set(w);
          nw.delete(tmdbId);
          return nw;
        });
      } else {
        next.add(tmdbId);
      }
      return next;
    });
  }, []);

  const isWatched = useCallback((tmdbId) => watched.has(tmdbId), [watched]);
  const isAdopted = useCallback((tmdbId) => adopted.has(tmdbId), [adopted]);

  const setWatchedFromImport = useCallback((newWatched, newAdopted) => {
    setWatched(newWatched);
    if (newAdopted) setAdopted(newAdopted);
  }, []);

  return {
    watched,
    adopted,
    watchedCount: watched.size,
    toggleWatched,
    toggleAdopted,
    isWatched,
    isAdopted,
    setWatchedFromImport,
  };
}

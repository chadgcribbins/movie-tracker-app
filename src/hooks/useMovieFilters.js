import { useState, useMemo } from 'react';

export function useMovieFilters(movies, isWatched) {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all'); // 'all' | 'watched' | 'unwatched'
  const [sortKey, setSortKey] = useState('consensus'); // 'title' | 'year' | 'consensus' | 'rating'
  const [sortDir, setSortDir] = useState('desc'); // 'asc' | 'desc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'genre' | 'studio' | 'franchise'

  const toggleSort = (key) => {
    if (key === sortKey) {
      // Same key — flip direction
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      // New key — pick a sensible default direction
      setSortKey(key);
      const defaultDir = {
        consensus: 'desc',
        title: 'asc',
        year: 'desc',
        rating: 'desc',
      };
      setSortDir(defaultDir[key] || 'desc');
    }
  };

  const filteredMovies = useMemo(() => {
    let result = movies;

    // Search
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      result = result.filter(m =>
        m.title.toLowerCase().includes(q) ||
        (m.genres && m.genres.some(g => g.toLowerCase().includes(q))) ||
        (m.year && String(m.year).includes(q))
      );
    }

    // Filter
    if (filter === 'watched') {
      result = result.filter(m => isWatched(m.tmdbId));
    } else if (filter === 'unwatched') {
      result = result.filter(m => !isWatched(m.tmdbId));
    }

    // Sort
    const dir = sortDir === 'asc' ? 1 : -1;
    result = [...result].sort((a, b) => {
      switch (sortKey) {
        case 'title':
          return dir * a.title.localeCompare(b.title);
        case 'year':
          return dir * ((a.year || 0) - (b.year || 0));
        case 'rating':
          return dir * ((a.voteAverage || 0) - (b.voteAverage || 0));
        case 'consensus':
        default: {
          const scoreDiff = (a.consensusScore || 0) - (b.consensusScore || 0);
          if (scoreDiff !== 0) return dir * scoreDiff;
          return a.title.localeCompare(b.title);
        }
      }
    });

    return result;
  }, [movies, search, filter, sortKey, sortDir, isWatched]);

  return {
    search,
    setSearch,
    filter,
    setFilter,
    sortKey,
    sortDir,
    toggleSort,
    viewMode,
    setViewMode,
    filteredMovies,
  };
}

import React, { useState, useCallback, useMemo } from 'react';
import movieData from './data/movies.json';
import { useWatchedState } from './hooks/useWatchedState';
import { useMovieFilters } from './hooks/useMovieFilters';
import { loadSubmitted, saveSubmitted } from './utils/storage';
import CurtainReveal from './components/CurtainReveal';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import ViewToggle from './components/ViewToggle';
import ExportImport from './components/ExportImport';
import MovieGrid from './components/MovieGrid';
import GenreView from './components/GenreView';
import StudioView from './components/StudioView';
import FranchiseView from './components/FranchiseView';
import RatingView from './components/RatingView';
import EmptyState from './components/EmptyState';
import TrailerModal from './components/TrailerModal';
import DirectorChair from './components/DirectorChair';

export default function App() {
  const [submittedMovies, setSubmittedMovies] = useState(() => loadSubmitted());
  const movies = useMemo(() => {
    const bundled = movieData.movies;
    const bundledIds = new Set(bundled.map(m => m.tmdbId));
    const extras = submittedMovies.filter(m => !bundledIds.has(m.tmdbId));
    return [...bundled, ...extras];
  }, [submittedMovies]);
  const collections = movieData.collections;
  const collectionMovies = movieData.collectionMovies || {};

  const existingTmdbIds = useMemo(() => new Set(movies.map(m => m.tmdbId)), [movies]);

  const handleMovieSubmitted = useCallback((newMovie) => {
    setSubmittedMovies(prev => {
      if (prev.some(m => m.tmdbId === newMovie.tmdbId)) return prev;
      const updated = [...prev, newMovie];
      saveSubmitted(updated);
      return updated;
    });
  }, []);

  const { watched, adopted, watchedCount, toggleWatched, toggleAdopted, isWatched, isAdopted, setWatchedFromImport } = useWatchedState();

  const {
    search, setSearch,
    filter, setFilter,
    sortKey, sortDir, toggleSort,
    viewMode, setViewMode,
    filteredMovies,
  } = useMovieFilters(movies, isWatched);

  const [curtainCloseFn, setCurtainCloseFn] = useState(null);
  const [trailerMovie, setTrailerMovie] = useState(null);

  const handleCurtainToggle = useCallback((closeFn) => {
    setCurtainCloseFn(() => closeFn);
  }, []);

  const handleTrailer = useCallback((movie) => {
    setTrailerMovie(movie);
  }, []);

  const closeTrailer = useCallback(() => {
    setTrailerMovie(null);
  }, []);

  const counts = useMemo(() => ({
    all: movies.length,
    watched: watchedCount,
    unwatched: movies.length - watchedCount,
  }), [movies.length, watchedCount]);

  return (
    <CurtainReveal onToggleCurtain={handleCurtainToggle}>
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-amber-50 to-orange-50 p-4 md:p-8">
        <div className="max-w-7xl mx-auto">
          <Header
            watchedCount={watchedCount}
            totalCount={movies.length}
            onCurtainClose={curtainCloseFn}
          />

          {/* Controls */}
          <div className="bg-white rounded-xl shadow-sm p-4 mb-6 space-y-3">
            <SearchBar value={search} onChange={setSearch} />
            <FilterBar
              filter={filter}
              onFilterChange={setFilter}
              sortKey={sortKey}
              sortDir={sortDir}
              onToggleSort={toggleSort}
              counts={counts}
            />
            <div className="flex items-center gap-3">
              <ViewToggle viewMode={viewMode} onChange={setViewMode} />
              <ExportImport movies={movies} onImport={setWatchedFromImport} />
            </div>
          </div>

          {/* Movie display */}
          {filteredMovies.length > 0 ? (
            viewMode === 'grid' ? (
              <MovieGrid
                movies={filteredMovies}
                isWatched={isWatched}
                onToggle={toggleWatched}
                onTrailer={handleTrailer}
              />
            ) : viewMode === 'genre' ? (
              <GenreView
                movies={filteredMovies}
                isWatched={isWatched}
                onToggle={toggleWatched}
                onTrailer={handleTrailer}
              />
            ) : viewMode === 'studio' ? (
              <StudioView
                movies={filteredMovies}
                isWatched={isWatched}
                onToggle={toggleWatched}
                onTrailer={handleTrailer}
              />
            ) : viewMode === 'rating' ? (
              <RatingView
                movies={filteredMovies}
                isWatched={isWatched}
                onToggle={toggleWatched}
                onTrailer={handleTrailer}
              />
            ) : (
              <FranchiseView
                movies={filteredMovies}
                collections={collections}
                collectionMovies={collectionMovies}
                isWatched={isWatched}
                isAdopted={isAdopted}
                onToggle={toggleWatched}
                onAdopt={toggleAdopted}
                onTrailer={handleTrailer}
              />
            )
          ) : (
            <EmptyState filter={filter} />
          )}
        </div>
      </div>

      {/* Trailer modal */}
      {trailerMovie && (
        <TrailerModal movie={trailerMovie} onClose={closeTrailer} />
      )}

      {/* Director's Chair — submit a movie */}
      <DirectorChair
        existingTmdbIds={existingTmdbIds}
        onMovieSubmitted={handleMovieSubmitted}
      />
    </CurtainReveal>
  );
}

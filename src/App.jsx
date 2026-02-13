import React, { useState, useCallback, useMemo } from 'react';
import movieData from './data/movies.json';
import { useWatchedState } from './hooks/useWatchedState';
import { useMovieFilters } from './hooks/useMovieFilters';
import CurtainReveal from './components/CurtainReveal';
import Header from './components/Header';
import SearchBar from './components/SearchBar';
import FilterBar from './components/FilterBar';
import ViewToggle from './components/ViewToggle';
import ExportImport from './components/ExportImport';
import MovieGrid from './components/MovieGrid';
import GenreView from './components/GenreView';
import FranchiseView from './components/FranchiseView';
import EmptyState from './components/EmptyState';

export default function App() {
  const movies = movieData.movies;
  const collections = movieData.collections;
  const collectionMovies = movieData.collectionMovies || {};

  const { watched, watchedCount, toggleWatched, isWatched, setWatchedFromImport } = useWatchedState();

  const {
    search, setSearch,
    filter, setFilter,
    sortKey, sortDir, toggleSort,
    viewMode, setViewMode,
    filteredMovies,
  } = useMovieFilters(movies, isWatched);

  const [curtainCloseFn, setCurtainCloseFn] = useState(null);

  const handleCurtainToggle = useCallback((closeFn) => {
    setCurtainCloseFn(() => closeFn);
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
              />
            ) : viewMode === 'genre' ? (
              <GenreView
                movies={filteredMovies}
                isWatched={isWatched}
                onToggle={toggleWatched}
              />
            ) : (
              <FranchiseView
                movies={filteredMovies}
                collections={collections}
                collectionMovies={collectionMovies}
                isWatched={isWatched}
                onToggle={toggleWatched}
              />
            )
          ) : (
            <EmptyState filter={filter} />
          )}
        </div>
      </div>
    </CurtainReveal>
  );
}

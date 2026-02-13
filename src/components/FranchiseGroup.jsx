import React from 'react';
import MovieCard from './MovieCard';

export default function FranchiseGroup({
  collection,
  curatedMovies,
  collectionMovies,
  isWatched,
  onToggle,
}) {
  // Build the full ordered list of movies in this franchise
  const allMovieIds = collection.movieTmdbIds;

  // Map of curated movies by tmdbId
  const curatedMap = new Map(curatedMovies.map(m => [m.tmdbId, m]));

  // Build ordered list: curated movies + faded non-curated movies
  const orderedMovies = allMovieIds.map(id => {
    if (curatedMap.has(id)) {
      return { movie: curatedMap.get(id), faded: false };
    }
    // Non-curated franchise movie
    const colMovie = collectionMovies[id];
    if (colMovie) {
      return { movie: colMovie, faded: true };
    }
    return null;
  }).filter(Boolean);

  const totalCount = orderedMovies.length;
  const watchedCount = orderedMovies.filter(m => isWatched(m.movie.tmdbId)).length;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-3 mb-3">
        <h3 className="text-lg font-bold text-gray-800">{collection.name}</h3>
        <span className="text-sm text-gray-500">
          {watchedCount}/{totalCount} watched
        </span>
        {watchedCount === totalCount && totalCount > 0 && (
          <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
            Complete!
          </span>
        )}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
        {orderedMovies.map(({ movie, faded }) => (
          <MovieCard
            key={movie.tmdbId}
            movie={movie}
            isWatched={isWatched(movie.tmdbId)}
            onToggle={onToggle}
            faded={faded}
          />
        ))}
      </div>
    </div>
  );
}

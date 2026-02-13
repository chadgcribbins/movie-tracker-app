import React from 'react';
import MovieCard from './MovieCard';

export default function MovieGrid({ movies, isWatched, onToggle, onTrailer }) {
  return (
    <div>
      <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>All Movies</span>
        <span className="text-sm font-normal text-gray-400">({movies.length})</span>
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
        {movies.map(movie => (
          <MovieCard
            key={movie.tmdbId}
            movie={movie}
            isWatched={isWatched(movie.tmdbId)}
            onToggle={onToggle}
            onTrailer={onTrailer}
          />
        ))}
      </div>
    </div>
  );
}

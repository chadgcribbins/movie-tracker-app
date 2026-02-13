import React from 'react';
import MovieCard from './MovieCard';

export default function MovieGrid({ movies, isWatched, onToggle, onTrailer }) {
  return (
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
  );
}

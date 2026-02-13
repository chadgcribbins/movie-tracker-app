import React, { useMemo } from 'react';
import FranchiseGroup from './FranchiseGroup';
import MovieCard from './MovieCard';

export default function FranchiseView({
  movies,
  collections,
  collectionMovies,
  isWatched,
  onToggle,
}) {
  const { franchises, standalone } = useMemo(() => {
    const franchiseMap = new Map();
    const standaloneMovies = [];

    for (const movie of movies) {
      if (movie.collectionId && collections[movie.collectionId]) {
        const colId = movie.collectionId;
        if (!franchiseMap.has(colId)) {
          franchiseMap.set(colId, []);
        }
        franchiseMap.get(colId).push(movie);
      } else {
        standaloneMovies.push(movie);
      }
    }

    // Sort franchises by name
    const sortedFranchises = Array.from(franchiseMap.entries())
      .map(([colId, curatedMovies]) => ({
        colId,
        collection: collections[colId],
        curatedMovies,
      }))
      .sort((a, b) => a.collection.name.localeCompare(b.collection.name));

    return { franchises: sortedFranchises, standalone: standaloneMovies };
  }, [movies, collections]);

  return (
    <div>
      {/* Franchise groups */}
      {franchises.length > 0 && (
        <div className="mb-8">
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>Franchises</span>
            <span className="text-sm font-normal text-gray-400">({franchises.length})</span>
          </h2>
          {franchises.map(({ colId, collection, curatedMovies }) => (
            <FranchiseGroup
              key={colId}
              collection={collection}
              curatedMovies={curatedMovies}
              collectionMovies={collectionMovies || {}}
              isWatched={isWatched}
              onToggle={onToggle}
            />
          ))}
        </div>
      )}

      {/* Standalone movies */}
      {standalone.length > 0 && (
        <div>
          <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
            <span>Standalone Films</span>
            <span className="text-sm font-normal text-gray-400">({standalone.length})</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
            {standalone.map(movie => (
              <MovieCard
                key={movie.tmdbId}
                movie={movie}
                isWatched={isWatched(movie.tmdbId)}
                onToggle={onToggle}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

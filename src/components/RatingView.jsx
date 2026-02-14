import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const ratingGroups = [
  {
    us: 'G',
    uk: 'U',
    label: 'General Audiences',
    emoji: '🟢',
    color: 'bg-green-100 text-green-800 border-green-300',
    description: 'Suitable for all ages',
  },
  {
    us: 'PG',
    uk: 'PG',
    label: 'Parental Guidance',
    emoji: '🟡',
    color: 'bg-yellow-100 text-yellow-800 border-yellow-300',
    description: 'Some material may not be suitable for young children',
  },
  {
    us: 'PG-13',
    uk: '12A',
    label: 'Parents Strongly Cautioned',
    emoji: '🟠',
    color: 'bg-orange-100 text-orange-800 border-orange-300',
    description: 'Some material may be inappropriate for children under 13',
  },
  {
    us: 'R',
    uk: '15',
    label: 'Restricted',
    emoji: '🔴',
    color: 'bg-red-100 text-red-800 border-red-300',
    description: 'Under 17 requires accompanying parent or guardian',
  },
  {
    us: 'NR',
    uk: 'NR',
    label: 'Not Rated',
    emoji: '⚪',
    color: 'bg-gray-100 text-gray-700 border-gray-300',
    description: 'No official rating',
  },
];

export default function RatingView({ movies, isWatched, onToggle, onTrailer }) {
  const [collapsed, setCollapsed] = useState({});

  const sections = useMemo(() => {
    const certMap = new Map();
    for (const movie of movies) {
      const cert = movie.certification || 'NR';
      if (!certMap.has(cert)) certMap.set(cert, []);
      certMap.get(cert).push(movie);
    }

    return ratingGroups
      .filter(rg => certMap.has(rg.us))
      .map(rg => ({
        ...rg,
        movies: certMap.get(rg.us),
        watchedCount: certMap.get(rg.us).filter(m => isWatched(m.tmdbId)).length,
      }));
  }, [movies, isWatched]);

  const toggleRating = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      <h2 className="text-xl font-bold text-gray-700 mb-4 flex items-center gap-2">
        <span>Ratings</span>
        <span className="text-sm font-normal text-gray-400">({sections.length})</span>
      </h2>

      {sections.map(({ us, uk, label, emoji, color, description, movies: ratingMovies, watchedCount }) => {
        const isCollapsed = collapsed[us];

        return (
          <div key={us} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleRating(us)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{emoji}</span>
              <div className="flex items-center gap-2">
                <span className={`text-sm font-bold px-2 py-0.5 rounded border ${color}`}>
                  {us}
                </span>
                {us !== uk && (
                  <span className={`text-sm font-bold px-2 py-0.5 rounded border ${color}`}>
                    {uk}
                  </span>
                )}
              </div>
              <div className="text-left">
                <h3 className="text-base font-bold text-gray-800 leading-tight">{label}</h3>
                <p className="text-xs text-gray-400 hidden sm:block">{description}</p>
              </div>
              <span className="text-sm text-gray-400 ml-auto sm:ml-0">
                {ratingMovies.length} {ratingMovies.length === 1 ? 'movie' : 'movies'}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium hidden sm:inline">
                {watchedCount}/{ratingMovies.length} watched
              </span>
              <span className="sm:ml-auto text-gray-400">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>

            {!isCollapsed && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {ratingMovies.map(movie => (
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
            )}
          </div>
        );
      })}
    </div>
  );
}

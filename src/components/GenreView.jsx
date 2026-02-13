import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const genreEmojis = {
  'Action': '💥',
  'Adventure': '🗺️',
  'Animation': '🎨',
  'Comedy': '😂',
  'Crime': '🔍',
  'Documentary': '🎥',
  'Drama': '🎭',
  'Family': '👨‍👩‍👧‍👦',
  'Fantasy': '🧙',
  'History': '📜',
  'Horror': '👻',
  'Music': '🎵',
  'Mystery': '🕵️',
  'Romance': '💕',
  'Science Fiction': '🚀',
  'Thriller': '😱',
  'TV Movie': '📺',
  'War': '⚔️',
  'Western': '🤠',
};

function getEmoji(genre) {
  return genreEmojis[genre] || '🎬';
}

export default function GenreView({ movies, isWatched, onToggle }) {
  const [collapsed, setCollapsed] = useState({});

  const genreGroups = useMemo(() => {
    const map = new Map();

    for (const movie of movies) {
      const genres = movie.genres && movie.genres.length > 0 ? movie.genres : ['Uncategorized'];
      for (const genre of genres) {
        if (!map.has(genre)) {
          map.set(genre, []);
        }
        map.get(genre).push(movie);
      }
    }

    return Array.from(map.entries())
      .map(([genre, genreMovies]) => ({
        genre,
        emoji: getEmoji(genre),
        movies: genreMovies,
        watchedCount: genreMovies.filter(m => isWatched(m.tmdbId)).length,
      }))
      .sort((a, b) => b.movies.length - a.movies.length);
  }, [movies, isWatched]);

  const toggleGenre = (genre) => {
    setCollapsed(prev => ({ ...prev, [genre]: !prev[genre] }));
  };

  return (
    <div className="space-y-3">
      {genreGroups.map(({ genre, emoji, movies: genreMovies, watchedCount }) => {
        const isCollapsed = collapsed[genre];

        return (
          <div key={genre} className="bg-white rounded-xl shadow-sm overflow-hidden">
            {/* Genre header */}
            <button
              onClick={() => toggleGenre(genre)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{emoji}</span>
              <h3 className="text-lg font-bold text-gray-800">{genre}</h3>
              <span className="text-sm text-gray-400">
                {genreMovies.length} {genreMovies.length === 1 ? 'movie' : 'movies'}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {watchedCount}/{genreMovies.length} watched
              </span>
              <span className="ml-auto text-gray-400">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>

            {/* Genre movies */}
            {!isCollapsed && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {genreMovies.map(movie => (
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
      })}
    </div>
  );
}

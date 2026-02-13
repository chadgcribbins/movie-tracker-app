import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const studioGroups = [
  { key: 'disney', label: 'Walt Disney Pictures', emoji: '🏰', keys: ['disney'] },
  { key: 'disney_anim', label: 'Walt Disney Animation', emoji: '✨', keys: ['disney_anim'] },
  { key: 'pixar', label: 'Pixar', emoji: '🔮', keys: ['pixar'] },
  { key: 'dreamworks', label: 'DreamWorks', emoji: '🌙', keys: ['dreamworks', 'dreamworks_live'] },
  { key: 'illumination', label: 'Illumination', emoji: '🍌', keys: ['illumination'] },
  { key: 'ghibli', label: 'Studio Ghibli', emoji: '🌿', keys: ['ghibli'] },
  { key: 'marvel', label: 'Marvel Studios', emoji: '🦸', keys: ['marvel'] },
  { key: 'lucasfilm', label: 'Lucasfilm', emoji: '⚔️', keys: ['lucasfilm'] },
  { key: 'warnerbros', label: 'Warner Bros.', emoji: '🎬', keys: ['warnerbros'] },
  { key: 'universal', label: 'Universal Pictures', emoji: '🌍', keys: ['universal'] },
  { key: 'paramount', label: 'Paramount', emoji: '⭐', keys: ['paramount'] },
  { key: 'columbia', label: 'Columbia / Sony', emoji: '🔦', keys: ['columbia'] },
  { key: '20thcentury', label: '20th Century Studios', emoji: '🎞️', keys: ['20thcentury'] },
  { key: 'sony_anim', label: 'Sony Pictures Animation', emoji: '🕷️', keys: ['sony_anim'] },
  { key: 'laika', label: 'Laika', emoji: '🎭', keys: ['laika'] },
  { key: 'bluesky', label: 'Blue Sky Studios', emoji: '🧊', keys: ['bluesky'] },
  { key: 'aardman', label: 'Aardman Animations', emoji: '🐑', keys: ['aardman'] },
  { key: 'cartoon_saloon', label: 'Cartoon Saloon', emoji: '🍀', keys: ['cartoon_saloon'] },
  { key: 'dc', label: 'DC', emoji: '🦇', keys: ['dc'] },
  { key: 'henson', label: 'Jim Henson', emoji: '🐸', keys: ['henson'] },
  { key: 'amblin', label: 'Amblin Entertainment', emoji: '🚲', keys: ['amblin'] },
  { key: 'mgm', label: 'MGM', emoji: '🦁', keys: ['mgm'] },
  { key: 'legendary', label: 'Legendary Pictures', emoji: '🐉', keys: ['legendary'] },
  { key: 'lionsgate', label: 'Lionsgate', emoji: '🚪', keys: ['lionsgate'] },
  { key: 'newline', label: 'New Line Cinema', emoji: '💍', keys: ['newline'] },
  { key: 'miramax', label: 'Miramax', emoji: '🎥', keys: ['miramax'] },
  { key: 'rankinbass', label: 'Rankin/Bass', emoji: '🎄', keys: ['rankinbass'] },
  { key: 'studiocanal', label: 'StudioCanal', emoji: '🎪', keys: ['studiocanal'] },
  { key: 'unitedartists', label: 'United Artists', emoji: '🎩', keys: ['unitedartists'] },
  { key: 'happy_madison', label: 'Happy Madison', emoji: '🏀', keys: ['happy_madison'] },
];

export default function StudioView({ movies, isWatched, onToggle, onTrailer }) {
  const [collapsed, setCollapsed] = useState({});

  const { studioSections, unclassified } = useMemo(() => {
    // Build a lookup: studioKey -> studioGroup key
    const keyToGroup = new Map();
    for (const sg of studioGroups) {
      for (const k of sg.keys) {
        keyToGroup.set(k, sg.key);
      }
    }

    const studioMap = new Map();
    const unmatched = [];

    for (const movie of movies) {
      const groupKey = movie.studioKey ? keyToGroup.get(movie.studioKey) : null;
      if (groupKey) {
        if (!studioMap.has(groupKey)) studioMap.set(groupKey, []);
        studioMap.get(groupKey).push(movie);
      } else {
        unmatched.push(movie);
      }
    }

    const sections = studioGroups
      .filter(sg => studioMap.has(sg.key))
      .map(sg => ({
        ...sg,
        movies: studioMap.get(sg.key),
        watchedCount: studioMap.get(sg.key).filter(m => isWatched(m.tmdbId)).length,
      }))
      .sort((a, b) => b.movies.length - a.movies.length);

    return { studioSections: sections, unclassified: unmatched };
  }, [movies, isWatched]);

  const toggleStudio = (key) => {
    setCollapsed(prev => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <div className="space-y-3">
      {studioSections.map(({ key, label, emoji, movies: studioMovies, watchedCount }) => {
        const isCollapsed = collapsed[key];

        return (
          <div key={key} className="bg-white rounded-xl shadow-sm overflow-hidden">
            <button
              onClick={() => toggleStudio(key)}
              className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
            >
              <span className="text-2xl">{emoji}</span>
              <h3 className="text-lg font-bold text-gray-800">{label}</h3>
              <span className="text-sm text-gray-400">
                {studioMovies.length} {studioMovies.length === 1 ? 'movie' : 'movies'}
              </span>
              <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
                {watchedCount}/{studioMovies.length} watched
              </span>
              <span className="ml-auto text-gray-400">
                {isCollapsed ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
              </span>
            </button>

            {!isCollapsed && (
              <div className="px-4 pb-4">
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {studioMovies.map(movie => (
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

      {unclassified.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleStudio('_other')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🎬</span>
            <h3 className="text-lg font-bold text-gray-800">Independent & Other</h3>
            <span className="text-sm text-gray-400">
              {unclassified.length} movies
            </span>
            <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">
              {unclassified.filter(m => isWatched(m.tmdbId)).length}/{unclassified.length} watched
            </span>
            <span className="ml-auto text-gray-400">
              {collapsed['_other'] ? <ChevronRight size={20} /> : <ChevronDown size={20} />}
            </span>
          </button>

          {!collapsed['_other'] && (
            <div className="px-4 pb-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                {unclassified.map(movie => (
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
      )}
    </div>
  );
}

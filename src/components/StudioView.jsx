import React, { useState, useMemo } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import MovieCard from './MovieCard';

const studioGroups = [
  { key: 'disney', label: 'Walt Disney Animation', emoji: '🏰', match: ['Walt Disney Animation Studios', 'Walt Disney Pictures'] },
  { key: 'pixar', label: 'Pixar', emoji: '🔮', match: ['Pixar Animation Studios', 'Pixar'] },
  { key: 'dreamworks', label: 'DreamWorks Animation', emoji: '🌙', match: ['DreamWorks Animation'] },
  { key: 'illumination', label: 'Illumination', emoji: '🍌', match: ['Illumination Entertainment', 'Illumination'] },
  { key: 'ghibli', label: 'Studio Ghibli', emoji: '🌿', match: ['Studio Ghibli'] },
  { key: 'marvel', label: 'Marvel Studios', emoji: '🦸', match: ['Marvel Studios', 'Marvel Enterprises', 'Marvel Entertainment'] },
  { key: 'dc', label: 'DC / Warner Bros', emoji: '🦇', match: ['DC Comics', 'DC Films', 'DC Entertainment'] },
  { key: 'laika', label: 'Laika', emoji: '🎭', match: ['Laika Entertainment', 'Laika'] },
  { key: 'bluesky', label: 'Blue Sky Studios', emoji: '🧊', match: ['Blue Sky Studios'] },
  { key: 'sony_anim', label: 'Sony Pictures Animation', emoji: '🕷️', match: ['Sony Pictures Animation'] },
  { key: 'aardman', label: 'Aardman Animations', emoji: '🐑', match: ['Aardman Animations'] },
  { key: 'warnerbros', label: 'Warner Bros.', emoji: '🎬', match: ['Warner Bros. Pictures', 'Warner Bros.', 'Warner Bros. Animation', 'Warner Animation Group'] },
  { key: 'universal', label: 'Universal Pictures', emoji: '🌍', match: ['Universal Pictures', 'Universal Studios'] },
  { key: 'paramount', label: 'Paramount', emoji: '⭐', match: ['Paramount Pictures', 'Paramount Animation'] },
  { key: 'columbia', label: 'Columbia / Sony', emoji: '🔦', match: ['Columbia Pictures', 'Sony Pictures', 'TriStar Pictures'] },
  { key: '20thcentury', label: '20th Century Studios', emoji: '🎞️', match: ['20th Century Fox', 'Twentieth Century Fox', '20th Century Studios'] },
  { key: 'amblin', label: 'Amblin Entertainment', emoji: '🚲', match: ['Amblin Entertainment'] },
  { key: 'mgm', label: 'MGM', emoji: '🦁', match: ['Metro-Goldwyn-Mayer'] },
  { key: 'lionsgate', label: 'Lionsgate', emoji: '🚪', match: ['Lionsgate', 'Lions Gate Films'] },
];

function classifyMovie(movie) {
  // Check genres for known studios that map to specific genres/keywords
  const title = (movie.title || '').toLowerCase();
  const overview = (movie.overview || '').toLowerCase();

  // Known studio assignments based on franchise knowledge
  const studioHints = {
    disney: /^(frozen|moana|tangled|encanto|wish|raya|brave|wreck-it ralph|big hero|zootopia|lilo|beauty and the beast|the lion king|aladdin|the little mermaid|mulan|pocahontas|tarzan|hercules|the jungle book|peter pan|pinocchio|dumbo|bambi|snow white|cinderella|sleeping beauty|the aristocats|robin hood|the fox and the hound|oliver|the great mouse|the rescuers|treasure planet|atlantis|bolt|meet the robinsons|chicken little|home on the range|brother bear|the emperor|the princess and the frog|winnie)/i,
    pixar: /^(toy story|finding nemo|finding dory|monsters|the incredibles|cars|ratatouille|wall-e|up|inside out|coco|onward|soul|luca|turning red|elemental|brave|a bug|lightyear|elio)/i,
    dreamworks: /^(shrek|how to train your dragon|kung fu panda|madagascar|megamind|the croods|trolls|boss baby|spirit|puss in boots|turbo|home |rise of the guardians|the bad guys|the wild robot|migration)/i,
    illumination: /^(despicable me|minions|the secret life of pets|sing|the lorax|hop|the grinch|migration)/i,
    ghibli: /^(my neighbor totoro|spirited away|princess mononoke|kiki|howl|ponyo|the wind rises|arrietty|castle in the sky|nausicaä|grave of the fireflies|porco rosso|whisper of the heart|the cat returns|tales from earthsea|from up on poppy hill|the tale of the princess kaguya|when marnie|the boy and the heron)/i,
    marvel: /^(iron man|the avengers|avengers|captain america|thor|guardians of the galaxy|ant-man|doctor strange|black panther|spider-man: homecoming|spider-man: far|spider-man: no way|black widow|shang-chi|eternals|thunderbolts|venom)/i,
    laika: /^(coraline|paranorman|the boxtrolls|kubo|missing link)/i,
    bluesky: /^(ice age|rio|the peanuts|ferdinand|spies in disguise)/i,
    sony_anim: /^(spider-man: into|spider-man: across|spider-man: beyond|cloudy with|hotel transylvania|the mitchells|surf's up)/i,
    aardman: /^(wallace|chicken run|shaun the sheep|a close shave|the wrong trousers|arthur christmas|flushed away|early man|pirates!)/i,
  };

  for (const [studio, pattern] of Object.entries(studioHints)) {
    if (pattern.test(movie.title)) {
      return studio;
    }
  }

  return null;
}

export default function StudioView({ movies, isWatched, onToggle, onTrailer }) {
  const [collapsed, setCollapsed] = useState({});

  const { studioSections, unclassified } = useMemo(() => {
    const studioMap = new Map();
    const unmatched = [];

    for (const movie of movies) {
      const studioKey = classifyMovie(movie);
      if (studioKey) {
        if (!studioMap.has(studioKey)) studioMap.set(studioKey, []);
        studioMap.get(studioKey).push(movie);
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

      {/* Unclassified movies */}
      {unclassified.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <button
            onClick={() => toggleStudio('_other')}
            className="w-full flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors"
          >
            <span className="text-2xl">🎬</span>
            <h3 className="text-lg font-bold text-gray-800">Other Studios</h3>
            <span className="text-sm text-gray-400">
              {unclassified.length} movies
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

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { Search, X, Plus, Check, Star, ChevronDown } from 'lucide-react';

const TMDB_API_KEY = import.meta.env.VITE_TMDB_API_KEY || '';
const POSTER_BASE = 'https://image.tmdb.org/t/p/w92';

export default function DirectorChair({ existingTmdbIds, onMovieSubmitted }) {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [searching, setSearching] = useState(false);
  const [added, setAdded] = useState(new Set());
  const inputRef = useRef(null);
  const debounceRef = useRef(null);

  const toggle = useCallback(() => {
    setIsOpen(prev => {
      if (!prev) {
        setTimeout(() => inputRef.current?.focus(), 350);
      }
      return !prev;
    });
  }, []);

  const searchTMDB = useCallback(async (q) => {
    if (!q.trim()) {
      setResults([]);
      return;
    }
    setSearching(true);
    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(q)}&include_adult=false`
      );
      const data = await res.json();
      setResults((data.results || []).slice(0, 8));
    } catch {
      setResults([]);
    } finally {
      setSearching(false);
    }
  }, []);

  const handleQueryChange = useCallback((e) => {
    const val = e.target.value;
    setQuery(val);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchTMDB(val), 400);
  }, [searchTMDB]);

  const addMovie = useCallback(async (movie) => {
    if (existingTmdbIds.has(movie.id) || added.has(movie.id)) return;

    try {
      const res = await fetch(
        `https://api.themoviedb.org/3/movie/${movie.id}?api_key=${TMDB_API_KEY}&append_to_response=release_dates,videos`
      );
      const detail = await res.json();

      // Extract US certification
      let certification = null;
      const usRelease = (detail.release_dates?.results || []).find(r => r.iso_3166_1 === 'US');
      if (usRelease) {
        const theatrical = usRelease.release_dates.find(d => d.type === 3 && d.certification);
        const any = usRelease.release_dates.find(d => d.certification);
        certification = (theatrical || any)?.certification || null;
      }

      // Extract trailer key
      let trailerKey = null;
      const videos = detail.videos?.results || [];
      const trailer = videos.find(v => v.type === 'Trailer' && v.site === 'YouTube' && v.official) ||
                      videos.find(v => v.type === 'Trailer' && v.site === 'YouTube') ||
                      videos.find(v => v.site === 'YouTube');
      if (trailer) trailerKey = trailer.key;

      const newMovie = {
        tmdbId: detail.id,
        title: detail.title,
        year: detail.release_date ? parseInt(detail.release_date.substring(0, 4)) : null,
        posterPath: detail.poster_path,
        genres: (detail.genres || []).map(g => g.name),
        runtime: detail.runtime,
        overview: detail.overview,
        certification,
        voteAverage: detail.vote_average,
        collectionId: detail.belongs_to_collection?.id || null,
        sources: ['submitted'],
        consensusScore: 0,
        trailerKey,
        studioKey: null,
      };

      onMovieSubmitted(newMovie);
      setAdded(prev => new Set([...prev, movie.id]));
    } catch (err) {
      console.error('Failed to fetch movie details:', err);
    }
  }, [existingTmdbIds, added, onMovieSubmitted]);

  // Close on Escape
  useEffect(() => {
    const handler = (e) => {
      if (e.key === 'Escape' && isOpen) setIsOpen(false);
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen]);

  return (
    <>
      {/* Director's Chair peek - fixed at bottom right area, slightly skewed */}
      <div
        className={`fixed z-40 transition-all duration-500 ease-out ${
          isOpen ? 'opacity-0 pointer-events-none' : ''
        }`}
        style={{
          right: '16.66%',
          bottom: '-30px',
          transform: isOpen ? 'translateY(100%) rotate(-3deg)' : 'rotate(-3deg)',
        }}
      >
        <button
          onClick={toggle}
          className="group relative flex flex-col items-center"
          title="Submit a movie"
        >
          {/* Chair back — wide, tall enough that bottom stays offscreen even on hover */}
          <div className="relative w-36 h-20 bg-gradient-to-b from-gray-800 via-gray-900 to-gray-900 rounded-t-lg border-2 border-b-0 border-gray-600 shadow-lg overflow-hidden group-hover:-translate-y-3 transition-transform duration-200">
            {/* Canvas text on chair back */}
            <div className="absolute inset-x-0 top-2 h-10 mx-2.5 bg-emerald-800 rounded-t-sm flex items-center justify-center">
              <span className="text-[11px] font-bold text-amber-300 tracking-widest uppercase">Director</span>
            </div>
            {/* Chair posts */}
            <div className="absolute bottom-2 left-2 w-2 h-3 bg-gray-700 rounded-b-sm" />
            <div className="absolute bottom-2 right-2 w-2 h-3 bg-gray-700 rounded-b-sm" />
          </div>
          {/* Subtle upward arrow hint */}
          <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <ChevronDown size={18} className="text-gray-400 rotate-180" />
          </div>
        </button>
      </div>

      {/* Slide-up panel */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 transition-transform duration-500 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
      >
        {/* Backdrop */}
        {isOpen && (
          <div
            className="fixed inset-0 bg-black/30 -z-10"
            onClick={() => setIsOpen(false)}
          />
        )}

        <div className="bg-white rounded-t-2xl shadow-2xl max-h-[70vh] flex flex-col">
          {/* Handle + header */}
          <div className="flex items-center justify-between px-5 pt-4 pb-2">
            <div className="flex items-center gap-3">
              {/* Mini director's chair icon */}
              <div className="w-8 h-8 bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-md border border-gray-600 flex items-center justify-center">
                <div className="w-5 h-4 bg-emerald-800 rounded-t-sm flex items-center justify-center">
                  <span className="text-[5px] font-bold text-amber-300 tracking-wider uppercase">Dir</span>
                </div>
              </div>
              <div>
                <h3 className="font-bold text-gray-800 text-lg leading-tight">Submit a Movie</h3>
                <p className="text-xs text-gray-400">Search TMDB to add a movie to your tracker</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            >
              <X size={20} className="text-gray-400" />
            </button>
          </div>

          {/* Search input */}
          <div className="px-5 pb-3">
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleQueryChange}
                placeholder="Search for a movie..."
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-gray-50"
              />
              {query && (
                <button
                  onClick={() => { setQuery(''); setResults([]); }}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Results */}
          <div className="px-5 pb-5 overflow-y-auto flex-1">
            {searching && (
              <div className="text-center py-6 text-gray-400 text-sm">Searching...</div>
            )}

            {!searching && results.length === 0 && query.trim() && (
              <div className="text-center py-6 text-gray-400 text-sm">No results found</div>
            )}

            {!searching && results.length === 0 && !query.trim() && (
              <div className="text-center py-6 text-gray-300 text-sm">
                Type a movie title to search
              </div>
            )}

            {results.map(movie => {
              const year = movie.release_date ? movie.release_date.substring(0, 4) : '—';
              const alreadyExists = existingTmdbIds.has(movie.id);
              const justAdded = added.has(movie.id);

              return (
                <div
                  key={movie.id}
                  className="flex items-center gap-3 py-2.5 border-b border-gray-100 last:border-0"
                >
                  {/* Poster thumbnail */}
                  <div className="w-12 h-[72px] rounded bg-gray-100 overflow-hidden flex-shrink-0">
                    {movie.poster_path ? (
                      <img
                        src={`${POSTER_BASE}${movie.poster_path}`}
                        alt={movie.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-300 text-lg">🎬</div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm text-gray-800 truncate">{movie.title}</p>
                    <div className="flex items-center gap-2 text-xs text-gray-400 mt-0.5">
                      <span>{year}</span>
                      {movie.vote_average > 0 && (
                        <>
                          <span>·</span>
                          <span className="flex items-center gap-0.5">
                            <Star size={10} className="text-amber-400" />
                            {movie.vote_average.toFixed(1)}
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Add button */}
                  {alreadyExists ? (
                    <span className="text-xs text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full">
                      In library
                    </span>
                  ) : justAdded ? (
                    <span className="text-xs text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full flex items-center gap-1">
                      <Check size={12} /> Added
                    </span>
                  ) : (
                    <button
                      onClick={() => addMovie(movie)}
                      className="flex items-center gap-1 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 px-3 py-1.5 rounded-full transition-colors"
                    >
                      <Plus size={12} /> Add
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </>
  );
}

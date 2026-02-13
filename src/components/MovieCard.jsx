import React, { useState, useCallback } from 'react';
import { CheckCircle, Circle, Clock, Star } from 'lucide-react';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export default function MovieCard({ movie, isWatched, onToggle, faded = false }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  const handleToggle = useCallback(() => {
    setJustToggled(true);
    onToggle(movie.tmdbId);
    setTimeout(() => setJustToggled(false), 400);
  }, [movie.tmdbId, onToggle]);

  // A faded movie that's been watched "comes alive"
  const watched = isWatched;
  const dimmed = faded && !watched;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
        ${dimmed ? 'opacity-40 scale-[0.97] hover:opacity-70 hover:scale-100' : 'hover:shadow-xl hover:-translate-y-1'}
        ${watched ? 'ring-2 ring-green-400' : ''}
        ${!watched && !dimmed ? 'card-unwatched' : ''}
        ${faded && watched ? 'ring-2 ring-green-400 ring-dashed' : ''}
        cursor-pointer
      `}
    >
      {/* Poster */}
      <div className="relative aspect-[2/3] bg-gray-200 overflow-hidden">
        {movie.posterPath && !imgError ? (
          <img
            src={`${POSTER_BASE}${movie.posterPath}`}
            alt={movie.title}
            loading="lazy"
            onLoad={() => setImgLoaded(true)}
            onError={() => setImgError(true)}
            className={`w-full h-full object-cover transition-opacity duration-500 ${
              imgLoaded ? 'opacity-100' : 'opacity-0'
            }`}
          />
        ) : (
          <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 bg-gray-100 p-4">
            <div className="text-4xl mb-2">🎬</div>
            <p className="text-sm font-medium text-center">{movie.title}</p>
          </div>
        )}

        {/* Consensus badge */}
        {!faded && movie.consensusScore > 1 && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
            {movie.consensusScore}
          </div>
        )}

        {/* Watched badge */}
        {watched && (
          <div className={`absolute top-2 right-2 bg-green-500 text-white rounded-full p-1.5 shadow-lg ${
            justToggled ? 'animate-watched-pop' : ''
          }`}>
            <CheckCircle size={20} />
          </div>
        )}

        {/* Certification badge */}
        {!dimmed && movie.certification && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            {movie.certification}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className="font-bold text-sm mb-1 text-gray-800 line-clamp-2 leading-tight">
          {movie.title}
        </h3>
        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
          <span>{movie.year}</span>
          {movie.runtime && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Clock size={10} />
                {movie.runtime}m
              </span>
            </>
          )}
          {movie.voteAverage && (
            <>
              <span>·</span>
              <span className="flex items-center gap-0.5">
                <Star size={10} className="text-amber-400" />
                {movie.voteAverage.toFixed(1)}
              </span>
            </>
          )}
        </div>

        {/* Genre pills */}
        {!dimmed && movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres.slice(0, 3).map(g => (
              <span key={g} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Watch button */}
        <button
          onClick={handleToggle}
          className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
            watched
              ? 'bg-green-500 hover:bg-green-600 text-white'
              : dimmed
                ? 'bg-gray-50 hover:bg-gray-100 text-gray-400 border border-dashed border-gray-300'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
          } ${justToggled ? 'scale-95' : ''}`}
        >
          {watched ? (
            <>
              <CheckCircle size={14} />
              Watched
            </>
          ) : dimmed ? (
            <>
              <Circle size={14} />
              Add to List
            </>
          ) : (
            <>
              <Circle size={14} />
              Mark Watched
            </>
          )}
        </button>
      </div>
    </div>
  );
}

import React, { useState, useCallback } from 'react';
import { CheckCircle, Circle, Clock, Star, PlusCircle, MinusCircle, Play } from 'lucide-react';

const POSTER_BASE = 'https://image.tmdb.org/t/p/w342';

export default function MovieCard({ movie, isWatched, isAdopted, onToggle, onAdopt, onTrailer, faded = false }) {
  const [imgLoaded, setImgLoaded] = useState(false);
  const [imgError, setImgError] = useState(false);
  const [justToggled, setJustToggled] = useState(false);

  const handleToggle = useCallback(() => {
    setJustToggled(true);
    onToggle(movie.tmdbId);
    setTimeout(() => setJustToggled(false), 400);
  }, [movie.tmdbId, onToggle]);

  const handleAdopt = useCallback(() => {
    setJustToggled(true);
    if (onAdopt) onAdopt(movie.tmdbId);
    setTimeout(() => setJustToggled(false), 400);
  }, [movie.tmdbId, onAdopt]);

  const handlePosterClick = useCallback(() => {
    if (movie.trailerKey && onTrailer) {
      onTrailer(movie);
    }
  }, [movie, onTrailer]);

  const watched = isWatched;
  const adopted = isAdopted;
  // Ghosted = faded franchise movie that hasn't been adopted
  const ghosted = faded && !adopted;
  const hasTrailer = !!movie.trailerKey;

  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden transition-all duration-300
        ${ghosted ? 'scale-[0.97] hover:scale-100' : 'hover:shadow-xl hover:-translate-y-1'}
        ${watched ? 'ring-2 ring-green-400' : ''}
        ${!watched && !ghosted ? 'card-unwatched' : ''}
        ${faded && adopted ? 'border-2 border-dashed border-blue-400' : ''}
      `}
    >
      {/* Poster — clickable for trailer */}
      <div
        className={`relative aspect-[2/3] bg-gray-200 overflow-hidden group ${hasTrailer ? 'cursor-pointer' : ''} ${ghosted ? 'opacity-40 hover:opacity-70 transition-opacity' : ''}`}
        onClick={handlePosterClick}
      >
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

        {/* Play button overlay on hover */}
        {hasTrailer && !ghosted && (
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-black/30">
            <div className="bg-red-600 rounded-full p-3 shadow-lg transform group-hover:scale-110 transition-transform">
              <Play size={24} className="text-white ml-0.5" fill="white" />
            </div>
          </div>
        )}

        {/* Consensus badge */}
        {!faded && movie.consensusScore > 1 && (
          <div className="absolute top-2 left-2 bg-amber-500 text-white text-xs font-bold rounded-full w-7 h-7 flex items-center justify-center shadow-lg">
            {movie.consensusScore}
          </div>
        )}

        {/* Adopted badge for faded movies that were adopted */}
        {faded && adopted && !watched && (
          <div className="absolute top-2 right-2 bg-blue-500 text-white rounded-full p-1.5 shadow-lg">
            <PlusCircle size={20} />
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
        {!ghosted && movie.certification && (
          <div className="absolute bottom-2 left-2 bg-black/70 text-white text-xs font-bold px-1.5 py-0.5 rounded">
            {movie.certification}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3">
        <h3 className={`font-bold text-sm mb-1 text-gray-800 line-clamp-2 leading-tight ${ghosted ? 'opacity-40' : ''}`}>
          {movie.title}
        </h3>
        <div className={`flex items-center gap-2 text-xs text-gray-500 mb-2 ${ghosted ? 'opacity-40' : ''}`}>
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
        {!ghosted && movie.genres && movie.genres.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {movie.genres.slice(0, 3).map(g => (
              <span key={g} className="text-[10px] bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded-full">
                {g}
              </span>
            ))}
          </div>
        )}

        {/* Buttons for faded (non-curated franchise) movies */}
        {faded ? (
          <div className="space-y-1.5">
            <button
              onClick={handleAdopt}
              className={`relative z-10 w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                adopted
                  ? 'bg-blue-500 hover:bg-blue-600 text-white'
                  : 'bg-blue-100 hover:bg-blue-200 text-blue-700 border border-blue-300'
              } ${justToggled ? 'scale-95' : ''}`}
            >
              {adopted ? (
                <>
                  <MinusCircle size={14} />
                  Hide
                </>
              ) : (
                <>
                  <PlusCircle size={14} />
                  Unhide
                </>
              )}
            </button>
            {adopted && (
              <button
                onClick={handleToggle}
                className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
                  watched
                    ? 'bg-green-500 hover:bg-green-600 text-white'
                    : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                } ${justToggled ? 'scale-95' : ''}`}
              >
                {watched ? (
                  <>
                    <CheckCircle size={14} />
                    Watched
                  </>
                ) : (
                  <>
                    <Circle size={14} />
                    Mark Watched
                  </>
                )}
              </button>
            )}
          </div>
        ) : (
          <button
            onClick={handleToggle}
            className={`w-full py-1.5 px-3 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-1.5 ${
              watched
                ? 'bg-green-500 hover:bg-green-600 text-white'
                : 'bg-gray-100 hover:bg-gray-200 text-gray-700'
            } ${justToggled ? 'scale-95' : ''}`}
          >
            {watched ? (
              <>
                <CheckCircle size={14} />
                Watched
              </>
            ) : (
              <>
                <Circle size={14} />
                Mark Watched
              </>
            )}
          </button>
        )}
      </div>
    </div>
  );
}

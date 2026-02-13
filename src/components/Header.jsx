import React from 'react';
import { Clapperboard } from 'lucide-react';
import ProgressBar from './ProgressBar';

export default function Header({ watchedCount, totalCount, onCurtainClose }) {
  return (
    <header className="mb-6">
      <div className="flex items-center justify-between mb-2">
        <h1 className="text-3xl md:text-4xl font-bold text-gray-800 flex items-center gap-2">
          <span className="text-red-700">🎬</span>
          <span>Kids Movie Tracker</span>
        </h1>
        {onCurtainClose && (
          <button
            onClick={onCurtainClose}
            className="p-2 text-red-700 hover:bg-red-50 rounded-lg transition-colors"
            title="Replay curtain animation"
          >
            <Clapperboard size={24} />
          </button>
        )}
      </div>
      <p className="text-gray-500 text-sm mb-3">
        Curated from 6 best-of lists &middot; {totalCount} movies to explore
      </p>
      <ProgressBar watched={watchedCount} total={totalCount} />
    </header>
  );
}

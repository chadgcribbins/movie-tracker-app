import React from 'react';
import { ChevronUp, ChevronDown } from 'lucide-react';

const filters = [
  { key: 'all', label: 'All', color: 'bg-red-700 text-white' },
  { key: 'watched', label: 'Watched', color: 'bg-green-600 text-white' },
  { key: 'unwatched', label: 'To Watch', color: 'bg-blue-600 text-white' },
];

const sorts = [
  { key: 'consensus', label: 'Most Listed', ascLabel: 'Least Listed', descLabel: 'Most Listed' },
  { key: 'title', label: 'Title', ascLabel: 'A → Z', descLabel: 'Z → A' },
  { key: 'year', label: 'Year', ascLabel: 'Oldest First', descLabel: 'Newest First' },
  { key: 'rating', label: 'Rating', ascLabel: 'Lowest First', descLabel: 'Highest First' },
];

export default function FilterBar({ filter, onFilterChange, sortKey, sortDir, onToggleSort, counts }) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      {/* Filter pills */}
      <div className="flex gap-1.5">
        {filters.map(f => (
          <button
            key={f.key}
            onClick={() => onFilterChange(f.key)}
            className={`px-3 py-1.5 rounded-full text-sm font-medium transition-all ${
              filter === f.key
                ? f.color
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.label}
            {counts[f.key] !== undefined && (
              <span className="ml-1 opacity-80">({counts[f.key]})</span>
            )}
          </button>
        ))}
      </div>

      {/* Sort buttons */}
      <div className="ml-auto flex gap-1">
        {sorts.map(s => {
          const isActive = sortKey === s.key;
          const dirLabel = isActive
            ? (sortDir === 'asc' ? s.ascLabel : s.descLabel)
            : s.label;
          const Arrow = sortDir === 'asc' ? ChevronUp : ChevronDown;

          return (
            <button
              key={s.key}
              onClick={() => onToggleSort(s.key)}
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isActive
                  ? 'bg-red-700 text-white'
                  : 'bg-gray-100 text-gray-500 hover:bg-gray-200'
              }`}
            >
              {dirLabel}
              {isActive && <Arrow size={12} />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

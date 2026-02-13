import React from 'react';
import { LayoutGrid, Film } from 'lucide-react';

const views = [
  { key: 'grid', label: 'Grid', icon: LayoutGrid },
  { key: 'genre', label: 'Genres', icon: null, emoji: '🎭' },
  { key: 'studio', label: 'Studios', icon: null, emoji: '🏢' },
  { key: 'franchise', label: 'Franchises', icon: Film },
];

export default function ViewToggle({ viewMode, onChange }) {
  return (
    <div className="flex border border-gray-300 rounded-lg overflow-hidden">
      {views.map((v, i) => {
        const Icon = v.icon;
        return (
          <button
            key={v.key}
            onClick={() => onChange(v.key)}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium transition-colors ${
              i > 0 ? 'border-l border-gray-300' : ''
            } ${
              viewMode === v.key
                ? 'bg-red-700 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            {Icon ? <Icon size={14} /> : <span className="text-sm">{v.emoji}</span>}
            {v.label}
          </button>
        );
      })}
    </div>
  );
}

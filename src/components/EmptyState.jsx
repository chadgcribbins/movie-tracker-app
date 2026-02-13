import React from 'react';

export default function EmptyState({ filter }) {
  const messages = {
    all: { icon: '🔍', text: "No movies match your search. Try different keywords!" },
    watched: { icon: '🎬', text: "No watched movies yet. Start your movie marathon!" },
    unwatched: { icon: '🎉', text: "You've watched everything! Amazing job!" },
  };

  const { icon, text } = messages[filter] || messages.all;

  return (
    <div className="text-center py-16">
      <div className="text-5xl mb-4">{icon}</div>
      <p className="text-gray-500 text-lg">{text}</p>
    </div>
  );
}

import React, { useState, useEffect, useRef } from 'react';

const milestones = [
  { pct: 25, msg: "Great start! A quarter down!" },
  { pct: 50, msg: "Halfway there! Movie marathon!" },
  { pct: 75, msg: "Almost done! So close!" },
  { pct: 100, msg: "You did it! All movies watched!" },
];

export default function ProgressBar({ watched, total }) {
  const pct = total > 0 ? Math.round((watched / total) * 100) : 0;
  const [milestone, setMilestone] = useState(null);
  const prevPct = useRef(pct);

  useEffect(() => {
    // Check if we just crossed a milestone
    for (const m of milestones) {
      if (prevPct.current < m.pct && pct >= m.pct) {
        setMilestone(m);
        const timer = setTimeout(() => setMilestone(null), 3000);
        return () => clearTimeout(timer);
      }
    }
    prevPct.current = pct;
  }, [pct]);

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-3 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-amber-500 via-red-500 to-red-700"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-sm font-semibold text-gray-600 whitespace-nowrap">
          {watched}/{total} ({pct}%)
        </span>
      </div>

      {/* Milestone celebration */}
      {milestone && (
        <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-amber-100 text-amber-800 px-3 py-1 rounded-full text-sm font-medium animate-bounce shadow-md">
          {milestone.msg}
        </div>
      )}
    </div>
  );
}

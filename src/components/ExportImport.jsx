import React, { useRef, useState, useEffect } from 'react';
import { Download, Upload, ChevronDown } from 'lucide-react';
import { exportWatchedState, importWatchedState } from '../utils/exportImport';

export default function ExportImport({ movies, onImport }) {
  const [open, setOpen] = useState(false);
  const fileRef = useRef(null);
  const menuRef = useRef(null);

  // Close on outside click
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const handleExport = () => {
    exportWatchedState(movies);
    setOpen(false);
  };

  const handleImport = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { watched: newWatched, adopted: newAdopted } = await importWatchedState(file);
      onImport(newWatched, newAdopted);
    } catch (err) {
      alert(`Import failed: ${err.message}`);
    }

    if (fileRef.current) fileRef.current.value = '';
    setOpen(false);
  };

  return (
    <div className="relative ml-auto" ref={menuRef}>
      <button
        onClick={() => setOpen(prev => !prev)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-sm font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
      >
        Migrate
        <ChevronDown size={14} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute right-0 top-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg z-20 min-w-[160px] overflow-hidden">
          <button
            onClick={handleExport}
            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
          >
            <Download size={14} />
            Export Data
          </button>
          <label className="w-full flex items-center gap-2 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer border-t border-gray-100">
            <Upload size={14} />
            Import Data
            <input
              ref={fileRef}
              type="file"
              accept=".json"
              onChange={handleImport}
              className="hidden"
            />
          </label>
        </div>
      )}
    </div>
  );
}

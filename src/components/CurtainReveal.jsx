import React, { useState, useEffect, useCallback } from 'react';

export default function CurtainReveal({ children, onToggleCurtain }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);

  const openCurtain = useCallback(() => {
    if (!isOpen) {
      setIsOpen(true);
    }
  }, [isOpen]);

  const closeCurtain = useCallback(() => {
    setContentVisible(false);
    setIsOpen(false);
  }, []);

  const handleTransitionEnd = useCallback((e) => {
    // Only respond to the transform transition ending on a curtain panel
    if (e.propertyName === 'transform' && isOpen) {
      setContentVisible(true);
    }
  }, [isOpen]);

  // Share the close function with parent (Header's clapperboard button)
  useEffect(() => {
    if (onToggleCurtain) {
      onToggleCurtain(closeCurtain);
    }
  }, [closeCurtain, onToggleCurtain]);

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Content behind curtains */}
      <div
        className={`transition-opacity duration-700 ${
          contentVisible ? 'opacity-100' : 'opacity-0'
        }`}
      >
        {children}
      </div>

      {/* Curtain overlay — clickable to open */}
      {!isOpen && (
        <div
          className="fixed inset-0 z-[52] cursor-pointer"
          onClick={openCurtain}
        />
      )}

      {/* Left curtain */}
      <div
        className={`curtain-panel curtain-left ${isOpen ? 'curtain-open-left' : ''}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="curtain-fabric curtain-fabric-left" />
        <div className="curtain-fold curtain-fold-left" />
        <div className="curtain-fringe" />
      </div>

      {/* Right curtain */}
      <div
        className={`curtain-panel curtain-right ${isOpen ? 'curtain-open-right' : ''}`}
      >
        <div className="curtain-fabric curtain-fabric-right" />
        <div className="curtain-fold curtain-fold-right" />
        <div className="curtain-fringe" />
      </div>

      {/* Valance (top bar) */}
      <div className="curtain-valance" />

      {/* "Click to open" prompt */}
      {!isOpen && (
        <div className="fixed inset-0 z-[53] flex items-center justify-center pointer-events-none">
          <div className="curtain-prompt">
            <span className="text-4xl mb-3 block">🎬</span>
            <span className="text-lg font-semibold tracking-wide">Tap to Open</span>
          </div>
        </div>
      )}

      {/* Shimmer on closed curtain */}
      {!isOpen && (
        <div className="curtain-shimmer" />
      )}
    </div>
  );
}

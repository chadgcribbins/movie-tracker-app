import React, { useState, useEffect, useCallback } from 'react';

export default function CurtainReveal({ children, onToggleCurtain }) {
  const [isOpen, setIsOpen] = useState(false);
  const [contentVisible, setContentVisible] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    // Brief pause before opening curtains
    const timer = setTimeout(() => {
      setIsOpen(true);
    }, 1200);
    return () => clearTimeout(timer);
  }, []);

  const handleTransitionEnd = useCallback(() => {
    if (isOpen && !hasAnimated) {
      setContentVisible(true);
      setHasAnimated(true);
    }
  }, [isOpen, hasAnimated]);

  const closeCurtain = useCallback(() => {
    setContentVisible(false);
    setIsOpen(false);
    setHasAnimated(false);
    // Reopen after a moment
    setTimeout(() => {
      setIsOpen(true);
    }, 2000);
  }, []);

  // Share the close function with parent
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

      {/* Left curtain */}
      <div
        className={`curtain-panel curtain-left ${isOpen ? 'curtain-open-left' : ''}`}
        onTransitionEnd={handleTransitionEnd}
      >
        <div className="curtain-fabric" />
        <div className="curtain-fringe" />
      </div>

      {/* Right curtain */}
      <div
        className={`curtain-panel curtain-right ${isOpen ? 'curtain-open-right' : ''}`}
      >
        <div className="curtain-fabric" />
        <div className="curtain-fringe" />
      </div>

      {/* Shimmer overlay before open */}
      {!isOpen && (
        <div className="curtain-shimmer" />
      )}
    </div>
  );
}

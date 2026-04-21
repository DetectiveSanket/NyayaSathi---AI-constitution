import React, { useEffect, useState } from 'react';

/**
 * AuthLoadingOverlay
 * A full-screen loading overlay shown during auth operations (login, OTP, reset, etc.)
 *
 * Props:
 *  - isLoading   {boolean}  - show/hide overlay
 *  - message     {string}   - custom message, e.g. "Verifying OTP..."
 *  - timeoutMs   {number}   - max wait before showing timeout error (default: 25000)
 *  - onTimeout   {function} - called when timeout hits (use to show error / redirect)
 */
function AuthLoadingOverlay({
  isLoading,
  message = 'Processing...',
  timeoutMs = 25000,
  onTimeout,
}) {
  const [timedOut, setTimedOut] = useState(false);
  const [elapsed, setElapsed] = useState(0);

  // Reset state whenever isLoading turns on
  useEffect(() => {
    if (!isLoading) {
      setTimedOut(false);
      setElapsed(0);
      return;
    }

    setTimedOut(false);
    setElapsed(0);

    // Progress ticker (every 250ms)
    const ticker = setInterval(() => {
      setElapsed((prev) => Math.min(prev + 250, timeoutMs));
    }, 250);

    // Timeout guard
    const guard = setTimeout(() => {
      setTimedOut(true);
      clearInterval(ticker);
      onTimeout?.();
    }, timeoutMs);

    return () => {
      clearInterval(ticker);
      clearTimeout(guard);
    };
  }, [isLoading, timeoutMs, onTimeout]);

  if (!isLoading) return null;

  const progress = Math.min((elapsed / timeoutMs) * 100, 100);

  return (
    <div
      className="fixed inset-0 z-[9999] flex flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse at 50% 30%, rgba(6,182,212,0.13) 0%, rgba(0,0,0,0.97) 70%)',
        backdropFilter: 'blur(8px)',
      }}
      aria-live="polite"
      role="status"
    >
      {/* Animated scales of justice icon */}
      <div className="relative flex items-center justify-center mb-8">
        {/* Outer glow pulse */}
        <div
          className="absolute w-32 h-32 rounded-full animate-pulse"
          style={{ background: 'radial-gradient(circle, rgba(6,182,212,0.18) 0%, transparent 70%)' }}
        />

        {/* Spinning ring */}
        <div
          className="w-24 h-24 rounded-full animate-spin"
          style={{
            background: 'conic-gradient(from 0deg, #06b6d4, #7c3aed, #06b6d4)',
            padding: '3px',
            animationDuration: '1.4s',
          }}
        >
          <div
            className="w-full h-full rounded-full flex items-center justify-center"
            style={{ background: '#040e1a' }}
          >
            {/* Scales of Justice SVG */}
            <svg
              className="w-11 h-11"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M12 3V21M12 3L3 8L5.5 14C5.5 14 3 16 6 16C9 16 6.5 14 6.5 14L9 8M12 3L21 8L18.5 14C18.5 14 21 16 18 16C15 16 17.5 14 17.5 14L15 8"
                stroke="url(#grad)"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="3" r="1.5" fill="#06b6d4" />
              <defs>
                <linearGradient id="grad" x1="3" y1="3" x2="21" y2="21" gradientUnits="userSpaceOnUse">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#7c3aed" />
                </linearGradient>
              </defs>
            </svg>
          </div>
        </div>

        {/* Floating particles */}
        <div
          className="absolute w-3 h-3 rounded-full bg-cyan-400/70 animate-bounce"
          style={{ top: '-8px', left: '10px', animationDuration: '1.1s' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-purple-400/70 animate-bounce"
          style={{ bottom: '-6px', right: '8px', animationDuration: '0.9s', animationDelay: '0.2s' }}
        />
        <div
          className="absolute w-2 h-2 rounded-full bg-cyan-300/50 animate-bounce"
          style={{ top: '10px', right: '-10px', animationDuration: '1.3s', animationDelay: '0.4s' }}
        />
      </div>

      {/* Brand name */}
      <h2 className="text-xl font-bold text-white mb-1 tracking-wide">
        NyayaSathi
      </h2>

      {/* Context message */}
      <p className="text-sm text-white/60 mb-6 text-center px-8">
        {timedOut
          ? '⚠️ This is taking longer than expected. Please check your connection.'
          : message}
      </p>

      {/* Animated dots */}
      {!timedOut && (
        <div className="flex gap-1.5 mb-6">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="w-2 h-2 rounded-full bg-cyan-400 animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      )}

      {/* Progress bar */}
      <div className="w-56 h-1 bg-white/10 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-300"
          style={{
            width: `${progress}%`,
            background: timedOut
              ? 'linear-gradient(90deg, #ef4444, #f97316)'
              : 'linear-gradient(90deg, #06b6d4, #7c3aed)',
          }}
        />
      </div>

      {/* Elapsed hint */}
      <p className="mt-3 text-xs text-white/25 tabular-nums">
        {timedOut
          ? 'Server may be waking up from sleep. Try again in a moment.'
          : `${Math.round(elapsed / 1000)}s`}
      </p>
    </div>
  );
}

export default AuthLoadingOverlay;

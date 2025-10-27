import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';

/**
 * Custom hook to automatically dismiss messages after a specified duration
 * with optional fade-out animation
 * @param {string} message - The message to auto-dismiss
 * @param {function} clearAction - Redux action to clear the message
 * @param {number} duration - Duration in milliseconds (default: 3000ms = 3 seconds)
 * @param {boolean} showCountdown - Whether to show countdown animation (default: false)
 */
export const useAutoDismiss = (message, clearAction, duration = 3000, showCountdown = false) => {
  const dispatch = useDispatch();
  const [isVisible, setIsVisible] = useState(true);
  const [timeLeft, setTimeLeft] = useState(duration);

  useEffect(() => {
    if (message) {
      setIsVisible(true);
      setTimeLeft(duration);
      
      let countdownInterval;
      
      if (showCountdown) {
        countdownInterval = setInterval(() => {
          setTimeLeft(prev => {
            if (prev <= 100) {
              setIsVisible(false);
              return 0;
            }
            return prev - 100;
          });
        }, 100);
      }

      const fadeTimer = setTimeout(() => {
        setIsVisible(false);
      }, duration - 500); // Start fade 500ms before clearing

      const clearTimer = setTimeout(() => {
        dispatch(clearAction());
      }, duration);

      return () => {
        clearTimeout(fadeTimer);
        clearTimeout(clearTimer);
        if (countdownInterval) clearInterval(countdownInterval);
      };
    }
  }, [message, dispatch, clearAction, duration, showCountdown]);

  return {
    isVisible,
    timeLeft,
    progress: duration > 0 ? ((duration - timeLeft) / duration) * 100 : 0
  };
};

export default useAutoDismiss;
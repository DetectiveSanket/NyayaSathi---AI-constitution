import React from 'react';

/**
 * Auto-dismissing notification component with visual countdown
 * @param {string} message - The message to display
 * @param {string} type - Type of notification: 'success', 'error', 'info'
 * @param {boolean} isVisible - Whether the notification is visible
 * @param {number} progress - Progress percentage for countdown bar (0-100)
 * @param {function} onDismiss - Function to call when manually dismissed
 */
const AutoDismissNotification = ({ 
  message, 
  type = 'info', 
  isVisible = true, 
  progress = 0, 
  onDismiss,
  showProgress = false 
}) => {
  if (!message) return null;

  const getNotificationStyles = () => {
    const baseStyles = "relative overflow-hidden transition-all duration-500 ease-in-out transform";
    const visibilityStyles = isVisible 
      ? "opacity-100 translate-y-0 scale-100" 
      : "opacity-0 -translate-y-2 scale-95 pointer-events-none";
    
    const typeStyles = {
      success: "bg-green-500/20 border border-green-500/30",
      error: "bg-red-500/20 border border-red-500/30", 
      info: "bg-blue-500/20 border border-blue-500/30"
    };

    return `${baseStyles} ${visibilityStyles} ${typeStyles[type]} rounded-xl p-4 mb-4`;
  };

  const getIconAndTextColor = () => {
    const colors = {
      success: "text-green-300",
      error: "text-red-300",
      info: "text-blue-300"
    };
    return colors[type];
  };

  const getIcon = () => {
    const iconClass = "w-5 h-5 mr-2 flex-shrink-0";
    
    switch (type) {
      case 'success':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
          </svg>
        );
      case 'error':
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd"/>
          </svg>
        );
      default:
        return (
          <svg className={iconClass} fill="currentColor" viewBox="0 0 20 20">
            <path d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"/>
          </svg>
        );
    }
  };

  return (
    <div className={getNotificationStyles()}>
      <div className={`flex items-center ${getIconAndTextColor()} text-sm`}>
        {getIcon()}
        <span className="flex-1">{message}</span>
        
        {/* Manual dismiss button */}
        {onDismiss && (
          <button
            onClick={onDismiss}
            className="ml-2 p-1 hover:bg-white/10 rounded-full transition-colors"
            aria-label="Dismiss notification"
          >
            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"/>
            </svg>
          </button>
        )}
      </div>
      
      {/* Progress bar for auto-dismiss countdown */}
      {showProgress && progress > 0 && (
        <div className="absolute bottom-0 left-0 h-1 bg-white/20 rounded-b-xl overflow-hidden">
          <div 
            className="h-full bg-white/50 transition-all duration-100 ease-linear"
            style={{ width: `${progress}%` }}
          />
        </div>
      )}
    </div>
  );
};

export default AutoDismissNotification;
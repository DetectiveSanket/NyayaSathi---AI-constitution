import React from 'react'

function Loading() {
    return (
        <div className="min-h-[400px] w-full flex flex-col items-center justify-center bg-primary relative">
            {/* Main Loading Container */}
            <div className="relative flex flex-col items-center gap-8 z-10">
                
                {/* Animated Logo/Icon Container */}
                <div className="relative">
                    {/* Outer Glow Ring - Simplified, using opacity instead of blur */}
                    <div className="absolute inset-0 w-24 h-24 rounded-full bg-gradient-to-r from-purple-500/30 via-violet-500/30 to-purple-500/30 animate-pulse will-change-[opacity]" />
                    
                    {/* Spinning Border Ring */}
                    <div className="relative w-24 h-24">
                        <div className="absolute inset-0 rounded-full border-4 border-transparent bg-gradient-to-r from-purple-500 via-violet-400 to-purple-600 animate-spin will-change-transform [animation-duration:3s]" 
                             style={{
                                 mask: 'linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)',
                                 maskComposite: 'exclude',
                                 WebkitMaskComposite: 'xor',
                                 padding: '3px',
                                 borderRadius: '50%'
                             }} 
                        />
                        
                        {/* Inner Circle with Icon */}
                        <div className="absolute inset-2 rounded-full bg-surface-primary flex items-center justify-center shadow-lg shadow-purple-500/20">
                            {/* Scale/Justice Icon - Legal Theme */}
                            <svg 
                                className="w-10 h-10 text-accent animate-bounce-slow will-change-transform" 
                                viewBox="0 0 24 24" 
                                fill="none" 
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <path 
                                    d="M12 3V21M12 3L3 8L5.5 14C5.5 14 3 16 6 16C9 16 6.5 14 6.5 14L9 8M12 3L21 8L18.5 14C18.5 14 21 16 18 16C15 16 17.5 14 17.5 14L15 8" 
                                    stroke="currentColor" 
                                    strokeWidth="1.5" 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round"
                                />
                                <circle cx="12" cy="3" r="1.5" fill="currentColor"/>
                            </svg>
                        </div>
                    </div>
                    
                    {/* Floating Particles - Using transform for better performance */}
                    <div className="absolute -top-2 -left-2 w-3 h-3 rounded-full bg-purple-400/60 animate-float-slow will-change-transform" />
                    <div className="absolute -bottom-1 -right-3 w-2 h-2 rounded-full bg-violet-400/60 animate-float-medium will-change-transform" />
                    <div className="absolute top-1/2 -left-4 w-2 h-2 rounded-full bg-purple-300/60 animate-float-fast will-change-transform" />
                    <div className="absolute -top-1 right-0 w-2 h-2 rounded-full bg-violet-300/60 animate-float-medium will-change-transform" />
                </div>
                
                {/* Loading Text */}
                <div className="flex flex-col items-center gap-3">
                    <h2 className="text-xl font-semibold text-text-primary tracking-wide">
                        NyayaSathi
                    </h2>
                    
                    {/* Animated Loading Dots */}
                    <div className="flex items-center gap-1">
                        <span className="text-sm text-text-secondary">Loading</span>
                        <div className="flex gap-1 ml-1">
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce will-change-transform [animation-delay:0ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce will-change-transform [animation-delay:150ms]" />
                            <span className="w-1.5 h-1.5 rounded-full bg-accent animate-bounce will-change-transform [animation-delay:300ms]" />
                        </div>
                    </div>
                </div>
                
                {/* Progress Bar */}
                <div className="w-48 h-1 bg-surface-tertiary rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-purple-500 via-violet-400 to-purple-600 rounded-full animate-loading-bar will-change-transform" />
                </div>
            </div>
            
            {/* Background Decorative Elements - Simplified, removed heavy blur */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-purple-500/5 rounded-full animate-pulse will-change-[opacity]" />
                <div className="absolute bottom-1/4 right-1/4 w-48 h-48 bg-violet-500/5 rounded-full animate-pulse will-change-[opacity] [animation-delay:1s]" />
            </div>
        </div>
    )
}

export default Loading
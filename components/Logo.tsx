import React from 'react';

export const Logo: React.FC<{ className?: string }> = ({ className = "h-10 w-10" }) => {
    return (
        <svg
            className={className}
            viewBox="0 0 200 200"
            xmlns="http://www.w3.org/2000/svg"
            aria-label="LexiLaw AI Logo"
        >
            <defs>
                <linearGradient id="lexilaw-main-blue" x1="0%" y1="0%" x2="0%" y2="100%">
                    <stop offset="0%" stopColor="#3b82f6" />
                    <stop offset="50%" stopColor="#2563eb" />
                    <stop offset="100%" stopColor="#1d4ed8" />
                </linearGradient>
                <linearGradient id="lexilaw-accent-blue" x1="0%" y1="0%" x2="100%" y2="0%">
                    <stop offset="0%" stopColor="#dbeafe" />
                    <stop offset="50%" stopColor="#bfdbfe" />
                    <stop offset="100%" stopColor="#93c5fd" />
                </linearGradient>
            </defs>
            
            {/* Blue Ring */}
            <circle cx="100" cy="100" r="95" fill="none" stroke="url(#lexilaw-main-blue)" strokeWidth="10" />
            
            {/* Gavel and Sound Block */}
            <g>
                {/* Sound Block */}
                <path d="M 30 155 L 50 125 L 150 125 L 170 155 L 30 155 Z" fill="url(#lexilaw-main-blue)" stroke="#1e3a8a" strokeWidth="1"/>
                <rect x="50" y="125" width="100" height="30" fill="url(#lexilaw-main-blue)" stroke="#1e3a8a" strokeWidth="1" />
                
                {/* "LAW" Text */}
                <text 
                    x="100" 
                    y="141" 
                    fontFamily="'Plus Jakarta Sans', sans-serif" 
                    fontWeight="bold" 
                    fontSize="22" 
                    fill="url(#lexilaw-accent-blue)" 
                    textAnchor="middle"
                    stroke="#ffffff"
                    strokeWidth="0.5"
                >
                    LAW
                </text>

                {/* Gavel */}
                <g transform="rotate(35 135 60)">
                    {/* Handle */}
                    <rect x="130" y="55" width="10" height="80" rx="3" fill="url(#lexilaw-main-blue)" stroke="#1e3a8a" strokeWidth="1"/>
                    
                    {/* Head */}
                    <path d="M105 40 C 100 40, 100 60, 105 60 L 175 60 C 180 60, 180 40, 175 40 Z" fill="url(#lexilaw-main-blue)" stroke="#1e3a8a" strokeWidth="1" />

                    {/* Blue Bands */}
                    <rect x="125" y="40" width="6" height="20" fill="url(#lexilaw-accent-blue)" stroke="#60a5fa" strokeWidth="0.5" />
                    <rect x="149" y="40" width="6" height="20" fill="url(#lexilaw-accent-blue)" stroke="#60a5fa" strokeWidth="0.5" />
                </g>
            </g>
        </svg>
    );
};
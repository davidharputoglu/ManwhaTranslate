import React from 'react';

interface TranslationRuneLogoProps {
  className?: string;
  size?: number;
}

export const TranslationRuneLogo: React.FC<TranslationRuneLogoProps> = ({
  className = 'w-8 h-8',
  size = 32,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      <defs>
        {/* Background gradient */}
        <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#0f172a" />
          <stop offset="50%" stopColor="#1e1b4b" />
          <stop offset="100%" stopColor="#0b0f17" />
        </linearGradient>

        {/* Border glow gradient */}
        <linearGradient id="borderGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="50%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>

        {/* Rune glow filter */}
        <filter id="runeGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.5" result="blur" />
          <feComposite in="SourceGraphic" in2="blur" operator="over" />
        </filter>

        {/* Arrow glow */}
        <linearGradient id="arrowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#34d399" />
        </linearGradient>
      </defs>

      {/* Outer rounded container with glowing border */}
      <rect
        x="2"
        y="2"
        width="60"
        height="60"
        rx="14"
        fill="url(#bgGrad)"
        stroke="url(#borderGrad)"
        strokeWidth="2.5"
      />

      {/* Decorative corner runes dots */}
      <circle cx="8" cy="8" r="1.5" fill="#38bdf8" opacity="0.6" />
      <circle cx="56" cy="8" r="1.5" fill="#34d399" opacity="0.6" />
      <circle cx="8" cy="56" r="1.5" fill="#818cf8" opacity="0.6" />
      <circle cx="56" cy="56" r="1.5" fill="#38bdf8" opacity="0.6" />

      {/* LEFT SIDE: Ancient Magical Runes (Cyan Glow) */}
      <g filter="url(#runeGlow)" stroke="#38bdf8" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
        {/* Main Rune Stem (Elder Futhark Raido / Asian mystic symbol) */}
        <line x1="16" y1="16" x2="16" y2="48" />
        <path d="M16 18 L24 25 L16 32" fill="none" />
        <line x1="16" y1="32" x2="25" y2="46" />
        
        {/* Small secondary rune accent (Fehu / energy branch) */}
        <line x1="10" y1="26" x2="16" y2="22" strokeWidth="1.6" opacity="0.8" />
        <line x1="10" y1="38" x2="16" y2="34" strokeWidth="1.6" opacity="0.8" />
      </g>

      {/* Mystical particle sparks on left rune */}
      <circle cx="21" cy="21" r="1.2" fill="#38bdf8" />
      <circle cx="23" cy="42" r="1" fill="#818cf8" />

      {/* CENTER: Glowing Dynamic Translation Arrow & Energy Beam */}
      <g>
        {/* Curved energy trail */}
        <path
          d="M 27 32 H 37"
          stroke="url(#arrowGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
        />
        {/* Arrow head */}
        <path
          d="M 34 26 L 40 32 L 34 38"
          stroke="url(#arrowGrad)"
          strokeWidth="3.2"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        {/* Small translation pulse dot */}
        <circle cx="32" cy="32" r="1.5" fill="#ffffff" />
        {/* Small upper spark */}
        <path d="M 31 22 L 33 24 L 35 22" stroke="#38bdf8" strokeWidth="1.2" opacity="0.7" fill="none" />
      </g>

      {/* RIGHT SIDE: Translated Modern Human Script (Clean Gold / White 'A' & 'FR') */}
      <g>
        {/* Modern Letter 'A' with sharp comic serifs */}
        <path
          d="M 44 46 L 50 18 L 56 46"
          stroke="#f8fafc"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
          fill="none"
        />
        <line x1="46.5" y1="37" x2="53.5" y2="37" stroke="#34d399" strokeWidth="2.4" strokeLinecap="round" />
        
        {/* Small golden language badge 'FR' at bottom right */}
        <rect x="44" y="47" width="14" height="7" rx="2" fill="#047857" opacity="0.9" />
        <text
          x="51"
          y="52.5"
          fill="#ffffff"
          fontSize="5.5"
          fontWeight="bold"
          fontFamily="system-ui, sans-serif"
          textAnchor="middle"
        >
          FR
        </text>
      </g>
    </svg>
  );
};

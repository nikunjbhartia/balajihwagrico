import React from 'react';

/* ============================================================================
   Wordmark.jsx — PROMINENT UPPERCASE BRAND LOGO (Final Rebrand Sweep)
   • Scaled SVG monogram to 46×46 with solid, thicker strokes
   • "BALAJI" — Fraunces display-serif 26px / 900 / uppercase / tight tracking
   • "HARDWARE & AGRICO" — 12px / 900 / uppercase / wide tracking
   • Commands absolute authority in the top-left corner of every screen
   ========================================================================== */

export default function Wordmark({ height = 46, activeColor = 'hsl(151, 56%, 24%)' }) {
  return (
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 14 }}
      className="select-none"
    >
      <svg
        width={height}
        height={height}
        viewBox="0 0 120 120"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        {/* Stylized thin circular boundary - responsive to color styles */}
        <circle
          cx="60"
          cy="60"
          r="48"
          stroke={activeColor}
          strokeWidth="4"
          fill="none"
        />
        
        {/* Serif-style B letter path */}
        <path
          d="M28,80 L28,40 C28,40 35,39 39,43 C43,47 42,54 37,57 C43,59 44,69 39,74 C34,79 28,80 28,80 Z M35,53 L35,46 C37,46 38,48 38,50 C38,52 37,53 35,53 Z M35,73 L35,60 C37,60 38,62 38,66 C38,70 37,73 35,73 Z"
          fill="hsl(240, 6%, 5%)"
        />
        
        {/* Serif-style H letter path (tall, prominent) */}
        <path
          d="M46,80 L46,40 L52,40 L52,56 L66,56 L66,40 L72,40 L72,80 L66,80 L66,62 L52,62 L52,80 Z"
          fill="hsl(240, 6%, 5%)"
        />
        
        {/* Serif-style A letter path */}
        <path
          d="M76,80 L85,40 L92,40 L101,80 L94,80 L92,70 L83,70 L81,80 Z M88,49 L84,64 L90,64 Z"
          fill="hsl(240, 6%, 5%)"
        />
        
        {/* Golden horizontal dynamic swoosh cutting across the A crossbar */}
        <path
          d="M75,63 Q92,52 108,57 Q92,65 83,65 Z"
          fill="hsl(33, 39%, 54%)"
        />
      </svg>

      {/* ============ Typographic Brandmark Lettering ============ */}
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'flex-start',
          textAlign: 'left',
        }}
      >
        <span
          style={{
            fontFamily: "'Fraunces', Georgia, serif",
            fontSize: 26,
            fontWeight: 900,
            lineHeight: 1,
            color: 'hsl(240, 6%, 5%)',
            letterSpacing: '-0.02em',
            textTransform: 'uppercase',
          }}
        >
          BALAJI
        </span>
        <span
          style={{
            fontFamily: "'Inter', sans-serif",
            fontSize: 12,
            fontWeight: 900,
            lineHeight: 1,
            color: 'hsl(240, 4%, 26%)',
            letterSpacing: '0.14em',
            textTransform: 'uppercase',
            marginTop: 3,
          }}
        >
          HARDWARE &amp; AGRICO
        </span>
      </div>
    </div>
  );
}

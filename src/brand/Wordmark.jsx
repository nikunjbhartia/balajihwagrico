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
      {/* ============ Bespoke Monogram (Steel Wire Loop + Leaf Vein) ============ */}
      <svg
        width={46}
        height={46}
        viewBox="0 0 40 40"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        style={{ flexShrink: 0, display: 'block' }}
        aria-hidden="true"
      >
        {/* Outer solid steel-wire ring (thicker, full opacity) */}
        <circle
          cx="20"
          cy="20"
          r="17.5"
          stroke="hsl(240, 6%, 5%)"
          strokeWidth="3.25"
          opacity="0.95"
        />
        {/* Accent arc — forest-emerald quadrant */}
        <circle
          cx="20"
          cy="20"
          r="17.5"
          stroke={activeColor}
          strokeWidth="3.25"
          strokeLinecap="round"
          strokeDasharray="48 120"
          style={{ transform: 'rotate(-45deg)', transformOrigin: 'center' }}
        />

        {/* Bold leaf vein — agricultural heritage */}
        <path
          d="M11 29C11 29 15 21 20 20C25 19 29 11 29 11"
          stroke="hsl(240, 6%, 5%)"
          strokeWidth="3.75"
          strokeLinecap="round"
        />
        <path
          d="M20 20C22 16 26 15 26 15"
          stroke={activeColor}
          strokeWidth="3.25"
          strokeLinecap="round"
        />
        <path
          d="M15 21C15 21 17 24 16 26"
          stroke="hsl(240, 5%, 26%)"
          strokeWidth="2.5"
          strokeLinecap="round"
        />

        {/* Industrial brass tip */}
        <circle cx="29" cy="11" r="3" fill="hsl(33, 39%, 54%)" />
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

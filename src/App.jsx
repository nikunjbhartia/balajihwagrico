import React from 'react';
import { LanguageProvider } from './context/LanguageContext';
import DynamicCatalog from './components/features/catalog/DynamicCatalog';
import { useInertiaScroll } from './lib/motion';

/* ──────────────────────────────────────────────────────────────────────────
 * APP SHELL — Balaji Hardware Digital Showroom
 *
 * Responsibilities:
 *   • Mount the global momentum-scroll hook so every viewport receives the
 *     `--scroll-y` (px offset) and `--scroll-v` (px/frame velocity) custom
 *     properties on :root. All parallax / scale-shift visuals in index.css
 *     read these tokens directly — zero re-renders.
 *   • Provide the ambient aurora backdrop layer (purely decorative, drifts
 *     with `--scroll-y` via CSS).
 *   • Hand off routing to <DynamicCatalog/> which owns the hash router.
 * ────────────────────────────────────────────────────────────────────────── */

export default function App() {
  // Global inertial momentum scroll — writes --scroll-y / --scroll-v on :root.
  // Auto-disables under prefers-reduced-motion. Single RAF loop, no jank.
  useInertiaScroll();

  return (
    <LanguageProvider>
      <div className="app-shell">
        {/* Ambient floating radial aurora backdrop (parallax-driven via CSS) */}
        <div className="app-aurora" aria-hidden="true">
          <span className="app-aurora-blob app-aurora-blob--emerald" />
          <span className="app-aurora-blob app-aurora-blob--brass" />
          <span className="app-aurora-blob app-aurora-blob--cobalt" />
        </div>

        {/* Master Showroom Router viewport */}
        <div className="app-viewport">
          <DynamicCatalog />
        </div>
      </div>
    </LanguageProvider>
  );
}

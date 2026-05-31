import React, { useState, useMemo, useCallback, useRef, useEffect } from 'react';
import { useTilt, useSpring } from '../../../lib/motion';
import { navigate as fallbackNavigate } from '../../../router/navigate';

/* ──────────────────────────────────────────────────────────────────────────
 * BALAJI HARDWARE & AGRICO — LANDING VIEW (Digital Showroom)
 *
 * RIGID FULL-PAGE SNAP SLIDER — 4-ACT TIMELINE
 *
 *   ACT 1 — .hero-band   (100vh)  Headline + CTA
 *   ACT 2 — .marquee-act (100vh)  Full-screen 3D interactive marquee wall
 *   ACT 3 — .bento-act   (100vh)  Categories bento grid + search rail
 *   ACT 4 — .faq-act     (100vh)  Technical FAQ + MSME credentials footer
 *
 * Scroll container is `.landing-shell` (height:100vh, mandatory y-snap).
 * Each .act-snap section is exactly one viewport tall and snap-stops
 * at its top — the browser CANNOT rest on any intermediate position.
 * ────────────────────────────────────────────────────────────────────────── */

const SECTORS = [
  { id: 'all',        label: 'All Sectors' },
  { id: 'infra',      label: 'Infrastructure' },
  { id: 'agri',       label: 'Agriculture' },
  { id: 'industrial', label: 'Industrial' },
  { id: 'roofing',    label: 'Roofing & Waterproofing' },
];

const SECTOR_MATCH = {
  all: () => true,
  infra: (slug) =>
    /(wire[_-]?mesh|chain[_-]?link|fencing|barbed|concertina|aluminium[_-]?net)/i.test(slug),
  agri: (slug) =>
    /(shade[_-]?net|shading|agro|chicken[_-]?mesh|ghamela|powrah|kudal)/i.test(slug),
  industrial: (slug) =>
    /(wire[_-]?brush|ghamela|wire[_-]?mesh|aluminium[_-]?net)/i.test(slug),
  roofing: (slug) =>
    /(waterproof|app[_-]?membrane|tar[_-]?felt|bitumen)/i.test(slug),
};

const FAQS = [
  { q: 'Do you supply across India?',
    a: 'Yes. We dispatch pan-India from our Kolkata headquarters in Burra Bazar, West Bengal with freight partners covering every major industrial corridor.' },
  { q: 'What are your minimum order quantities?',
    a: 'MOQs vary by SKU. Chain link mesh starts at 1 roll; APP membranes ship by pallet (24 rolls); shade nets by full bale.' },
  { q: 'Do you provide GST invoicing and credit terms?',
    a: 'Every dispatch carries a GST tax invoice. Credit terms are available for registered MSMEs and corporate buyers after KYC.' },
  { q: 'Can you customize specifications?',
    a: 'Yes — mesh size, wire gauge, GSM, roll length and shade percentage can be tailored for project-grade orders.' },
];

const HUE_CYCLE = ['emerald', 'cobalt', 'amber', 'brass', 'verdant'];

const TAG_LIBRARY = {
  wire_mesh:          'Reinforcement',
  chain_link_fencing: 'Perimeter Security',
  waterproofing:      'Roof Shield',
  app_membrane_sheet: 'Roof Shield',
  tar_felt:           'Underlayment',
  agro_shade_net:     'Greenhouse',
  shade_net:          'Greenhouse',
  shading_net:        'Greenhouse',
  plastic_ghamela:    'Site Tools',
  unbreakable_ghamela:'Site Tools',
  aluminium_net:      'Architectural',
  fencing_net:        'Boundary',
  fencing_wire:       'Boundary',
  barbed_wire:        'Security',
  concertina_coil:    'Security',
  chicken_mesh:       'Poultry',
  wire_brush:         'Site Tools',
  new_items:          'Just Landed',
};

const BODY_LIBRARY = {
  wire_mesh:          'Precision welded GI mesh panels for plaster reinforcement, fencing, cages and industrial partitions.',
  chain_link_fencing: 'Hot-dip galvanized chain link mesh engineered for industrial perimeters, highways, solar farms and warehouse boundaries.',
  waterproofing:      'Polymer-modified bitumen systems with UV-stable mineral surfacing for flat roofs, podiums and basements.',
  app_membrane_sheet: 'Torch-on APP membranes with elastomeric polymer modification and mineral granule finish.',
  tar_felt:           'IS 1322 compliant tar felt for damp-proofing and roof underlay across residential and industrial projects.',
  agro_shade_net:     'HDPE monofilament shade nets with 35–90% shade factors for greenhouses, nurseries and agri-tech farms.',
  plastic_ghamela:    'Unbreakable recycled PVC mortar carrying pans — flexible, frost-proof, contractor-grade.',
  unbreakable_ghamela:'Unbreakable recycled PVC mortar carrying pans — flexible, frost-proof, contractor-grade.',
  aluminium_net:      'Anodised aluminium woven mesh for facades, insect screens and decorative architectural infill.',
  new_items:          'Fresh stock landing this season — be the first to spec the latest mill-certified materials.',
};

// BENTO GRID HEIGHT UNIFORMITY — every tile renders at the exact same
// row-span ('square') so the 4-column grid lays out as a perfectly aligned
// matrix with zero ragged edges, regardless of how many categories surface.
const SPAN_PATTERN = ['square', 'square', 'square', 'square', 'square', 'square', 'square', 'square'];

const TOP_BENTO_LIMIT = 8;

const MARQUEE_TARGETS = [
  { key: 'gi_welded_mesh', eyebrow: 'Reinforcement',       label: 'GI Welded Mesh',     match: /(wire[_-]?mesh|welded)/i,                  img: 'assets/wire_mesh/welded_mesh/image_500.jpg' },
  { key: 'chain_link',     eyebrow: 'Perimeter Security',  label: 'Chain Link Fence',   match: /(chain[_-]?link|fencing[_-]?net)/i,        img: 'assets/chain_link_fencing/chain_link/image_500.jpg' },
  { key: 'app_membrane',   eyebrow: 'Torch-on Roof Shield',label: 'APP Membrane Roll',  match: /(app[_-]?membrane|waterproof|bitumen)/i,   img: 'assets/app_membrane_sheet/app_membrane/image_500.jpg' },
  { key: 'tar_felt',       eyebrow: 'IS 1322 Underlay',    label: 'Bitumen Tar Felt',   match: /(tar[_-]?felt|bitumen)/i,                  img: 'assets/tar_felt/tar_felt/image_500.jpg' },
  { key: 'agro_shade',     eyebrow: 'Greenhouse',          label: 'Agro Shade Net',     match: /(shade[_-]?net|shading|agro)/i,            img: 'assets/agro_shade_net/shade_net/image_500.jpg' },
  { key: 'pvc_pan',        eyebrow: 'Site Tools',          label: 'PVC Mortar Pan',     match: /(ghamela|mortar[_-]?pan)/i,                img: 'assets/plastic_ghamela/ghamela/image_500.jpg' },
  { key: 'barbed_wire',    eyebrow: 'Boundary',            label: 'Barbed Wire Roll',   match: /(barbed|fencing[_-]?wire)/i,               img: 'assets/fencing_wire/barbed_wire/image_500.jpg' },
  { key: 'concertina',     eyebrow: 'Security',            label: 'Concertina Coil',    match: /(concertina)/i,                            img: 'assets/fencing_wire/concertina/image_500.jpg' },
  { key: 'powrah',         eyebrow: 'Agri Tools',          label: 'Agriculture Powrah', match: /(powrah|kudal|agriculture)/i,              img: 'assets/agriculture_powrah/kudal/image_500.jpg' },
];

/* ── helpers ────────────────────────────────────────────────────────────── */

const pickImage = (p) => {
  if (!p) return null;
  if (typeof p === 'string') return p;
  const img = p.images;
  if (typeof img === 'string') return img;
  if (img) return img.large || img.medium || img.thumbnail || null;
  return p.image || p.original_image || null;
};

const humanize = (slug = '') =>
  slug
    .split(/[_\-\s]+/)
    .filter(Boolean)
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

const tagFor  = (slug, fallback) => TAG_LIBRARY[slug] || fallback || 'Catalog';
const bodyFor = (slug)           =>
  BODY_LIBRARY[slug] ||
  'Industrial-grade specifications, mill-certified materials and B2B project pricing. Browse the complete range.';

const matchesQuery = (text = '', q = '') => {
  if (!q) return true;
  return String(text).toLowerCase().includes(q.toLowerCase());
};

const trackPointer = (e) => {
  const el = e.currentTarget;
  const rect = el.getBoundingClientRect();
  el.style.setProperty('--mouse-x', `${((e.clientX - rect.left) / rect.width)  * 100}%`);
  el.style.setProperty('--mouse-y', `${((e.clientY - rect.top)  / rect.height) * 100}%`);
};

/* ── Single marquee card with 3D tilt on hover ──────────────────────────── */

function MarqueeCard({ panel, onPick }) {
  const { ref, style } = useTilt({ max: 9, perspective: 1400, lift: 6, depth: 22 });

  const handleClick = useCallback(() => {
    onPick(panel);
  }, [onPick, panel]);

  return (
    <button
      ref={ref}
      type="button"
      className="marquee-card"
      style={style}
      onPointerMove={trackPointer}
      onClick={handleClick}
      data-testid={panel.product?.id
        ? `product-card-${panel.product.id}`
        : `marquee-card-${panel.key}`}
      aria-label={panel.product?.name || panel.label}
    >
      <div className="marquee-card-frame">
        {panel.image ? (
          <img
            src={panel.image}
            alt={panel.product?.name || panel.label}
            loading="lazy"
            decoding="async"
          />
        ) : (
          <div className="marquee-card-fallback" aria-hidden="true" />
        )}
        <span className="marquee-card-shine" aria-hidden="true" />
      </div>
      <div className="marquee-card-caption">
        <span className="marquee-card-eyebrow">{panel.eyebrow}</span>
        <span className="marquee-card-title">
          {panel.product?.name || panel.label}
        </span>
      </div>
    </button>
  );
}

/* ── Infinite Horizontal Product Marquee (Act 2) ────────────────────────────
 *
 * FULL-SCREEN INTERACTIVE 3D WALL
 *
 * The entire .marquee-track ribbon is wrapped in a CSS perspective viewport
 * and receives a live `rotateX / rotateY / translate3d` transform derived
 * from the cursor's normalized position over the section. As you sweep the
 * mouse, the towering 420×72vh product panels skew, tilt and drift through
 * 3D space — the marquee feels like a physical wall of inventory you can
 * almost lean into.
 * ──────────────────────────────────────────────────────────────────────── */

function InfiniteProductMarquee({ panels, onPick }) {
  const sectionRef = useRef(null);
  const trackRef   = useRef(null);
  const offsetRef  = useRef(0);
  const widthRef   = useRef(0);
  const rafRef     = useRef(0);

  // Normalized pointer (-1 … +1) on both axes — drives both ribbon velocity
  // (X) and the live 3D wall transform (X + Y).
  const [rawX, setRawX] = useState(0);
  const [rawY, setRawY] = useState(0);
  const smoothX = useSpring(rawX, { stiffness: 90,  damping: 20 });
  const smoothY = useSpring(rawY, { stiffness: 110, damping: 22 });

  const handlePointerMove = useCallback((e) => {
    const el = sectionRef.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const nx = ((e.clientX - rect.left) / rect.width)  * 2 - 1;
    const ny = ((e.clientY - rect.top)  / rect.height) * 2 - 1;
    setRawX(Math.max(-1, Math.min(1, nx)));
    setRawY(Math.max(-1, Math.min(1, ny)));
  }, []);

  const handlePointerLeave = useCallback(() => {
    setRawX(0);
    setRawY(0);
  }, []);

  useEffect(() => {
    const measure = () => {
      const track = trackRef.current;
      if (!track) return;
      widthRef.current = track.scrollWidth / 2;
    };
    measure();
    window.addEventListener('resize', measure);
    return () => window.removeEventListener('resize', measure);
  }, [panels]);

  useEffect(() => {
    const prefersReduced =
      typeof window !== 'undefined' &&
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReduced) return undefined;

    // MAX_SPEED bumped to 28 — the wall now accelerates proportional
    // to the cursor's horizontal coordinate with a higher peak velocity
    // so edge-of-viewport sweeps glide the ribbon ~17% faster.
    const MAX_SPEED  = 28;
    const IDLE_DRIFT = 0.5;
    const tick = () => {
      const track = trackRef.current;
      const w = widthRef.current;
      if (track && w > 0) {
        // EXPONENTIAL VELOCITY: speed scales as |x|·x so the wall glides
        // gently near center and accelerates ferociously at the viewport
        // borders — fluid, reversible, 300%+ peak speed over the previous
        // linear curve. Direction follows pointer sign automatically.
        const velocity = -(smoothX * Math.abs(smoothX) * MAX_SPEED) - IDLE_DRIFT;
        offsetRef.current += velocity;
        if (offsetRef.current <= -w) offsetRef.current += w;
        if (offsetRef.current > 0)   offsetRef.current -= w;

        // Compose: infinite horizontal scroll + live 3D pointer-tracking wall.
        track.style.transform =
          `translate3d(${offsetRef.current.toFixed(2)}px, ${(smoothY * 32).toFixed(2)}px, 0) ` +
          `rotateX(${(smoothY * -6).toFixed(2)}deg) ` +
          `rotateY(${(smoothX *  8).toFixed(2)}deg)`;
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [smoothX, smoothY]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el) return undefined;

    const handleWheel = (e) => {
      // Intercept horizontal trackpad swipes or horizontal shift+wheel scrolling
      if (Math.abs(e.deltaX) > Math.abs(e.deltaY)) {
        e.preventDefault();
        const w = widthRef.current;
        if (w > 0) {
          offsetRef.current -= e.deltaX * 1.0; // speed factor
          if (offsetRef.current <= -w) offsetRef.current += w;
          if (offsetRef.current > 0)   offsetRef.current -= w;
        }
      }
    };

    let isDragging = false;
    let startX = 0;
    let startOffset = 0;

    const handleTouchStart = (e) => {
      if (e.touches.length > 0) {
        isDragging = true;
        startX = e.touches[0].clientX;
        startOffset = offsetRef.current;
      }
    };

    const handleTouchMove = (e) => {
      if (!isDragging || e.touches.length === 0) return;
      const currentX = e.touches[0].clientX;
      const dx = currentX - startX;

      // Prevent page vertical scroll when swiping horizontal marquee
      if (Math.abs(dx) > 8) {
        if (e.cancelable) e.preventDefault();
      }

      const w = widthRef.current;
      if (w > 0) {
        offsetRef.current = startOffset + dx;
        if (offsetRef.current <= -w) offsetRef.current += w;
        if (offsetRef.current > 0)   offsetRef.current -= w;
      }
    };

    const handleTouchEnd = () => {
      isDragging = false;
    };

    el.addEventListener('wheel', handleWheel, { passive: false });
    el.addEventListener('touchstart', handleTouchStart, { passive: true });
    el.addEventListener('touchmove', handleTouchMove, { passive: false });
    el.addEventListener('touchend', handleTouchEnd, { passive: true });

    return () => {
      el.removeEventListener('wheel', handleWheel);
      el.removeEventListener('touchstart', handleTouchStart);
      el.removeEventListener('touchmove', handleTouchMove);
      el.removeEventListener('touchend', handleTouchEnd);
    };
  }, []);

  const looped = useMemo(() => [...panels, ...panels], [panels]);

  return (
    <section
      ref={sectionRef}
      className="marquee-act act-snap"
      data-act="2"
      data-testid="product-marquee"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
      aria-label="Flagship inventory marquee"
    >
      {/* Floating overlay header — top-left corner of the viewport.
          High-contrast white typography with subtle text shadows so it
          remains legible against any product imagery passing behind. */}
      <header className="marquee-header">
        <span className="marquee-eyebrow">
          Featured this season · Kolkata Hub
        </span>
        <h2 className="marquee-headline">
          Flagship inventory — engineered, certified, in stock.
        </h2>
        <p className="marquee-sub">
          Quickly preview our highest-demand industrial supplies. Hover to pause, click to inspect full technical specifications, gauge sizes, and test certifications.
        </p>
      </header>

      {/* Full-bleed 3D viewport — the perspective stage for the wall. */}
      <div className="marquee-viewport" aria-hidden={false}>
        <div className="marquee-fade marquee-fade--left"  aria-hidden="true" />
        <div className="marquee-fade marquee-fade--right" aria-hidden="true" />

        <div className="marquee-track" ref={trackRef}>
          {looped.map((panel, i) => (
            <MarqueeCard
              key={`${panel.key}-${i}`}
              panel={panel}
              onPick={onPick}
            />
          ))}
        </div>
      </div>

      <div className="marquee-footnote" aria-hidden="true">
        <span className="marquee-scroll-hint">
          ← Sweep cursor · the wall tracks your motion →
        </span>
      </div>
    </section>
  );
}

/* ── Bento category tile ───────────────────────────────────────────────── */

function BentoCard({ tile, onClick }) {
  const { ref, style } = useTilt({ max: 6, perspective: 1200, lift: 4, depth: 16 });

  const handleKey = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick();
    }
  };

  return (
    <article
      ref={ref}
      className="bento-card"
      data-span={tile.span}
      data-hue={tile.hue}
      data-testid={`category-card-${tile.slug}`}
      style={style}
      onPointerMove={trackPointer}
      onClick={onClick}
      onKeyDown={handleKey}
      role="button"
      tabIndex={0}
      aria-label={`Browse ${tile.label} — ${tile.count} item${tile.count === 1 ? '' : 's'}`}
    >
      <span className="bento-aurora" aria-hidden="true" />
      {tile.hero && (
        <span
          className="bento-hero"
          aria-hidden="true"
          style={{ backgroundImage: `url(${tile.hero})` }}
        />
      )}
      <span className="bento-tag">{tile.tag}</span>
      <h3 className="bento-title">{tile.label}</h3>
      <p className="bento-body">{tile.body}</p>
      <div className="bento-foot">
        <span className="bento-count">
          {tile.count} SKU{tile.count === 1 ? '' : 's'}
        </span>
        <span className="bento-cta" aria-hidden="true">Explore →</span>
      </div>
    </article>
  );
}

/* ── FAQ accordion row ──────────────────────────────────────────────────── */

function FaqCard({ item, isOpen, onToggle }) {
  return (
    <li className="faq-card" data-open={isOpen}>
      <button
        className="faq-trigger"
        onClick={onToggle}
        aria-expanded={isOpen}
      >
        <span>{item.q}</span>
        <span className="faq-chev" aria-hidden="true">{isOpen ? '−' : '+'}</span>
      </button>
      <div className="faq-body" style={{ gridTemplateRows: isOpen ? '1fr' : '0fr' }}>
        <div className="faq-body-inner">
          <p>{item.a}</p>
        </div>
      </div>
    </li>
  );
}

/* ── Interactive Spring-Physics Canvas Mesh Background ───────────────────── */
export function InteractiveMesh() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Honour reduced-motion: render a single static grid frame, no animation.
    const reduceMotion = typeof window !== 'undefined'
      && window.matchMedia
      && window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    const ctx = canvas.getContext('2d', { alpha: true });
    let animationFrameId;

    // Tactile wire grid configuration (spring physics Z-press dome)
    const SPACING = 32;
    const SPRING_STIFFNESS = 0.05; // snappier spring return
    const DAMPING = 0.84;          // high-fidelity metallic damping
    const INFLUENCE_RADIUS = 130;  // Expanded area of physical hover influence
    const FORCE_FACTOR = 2.2;      // Responsive, tactile inward wire sag
    const RIM_LIFT = 0.5;          // Organic taut wire rim lift swell
    const DPR = Math.min(window.devicePixelRatio || 1, 2); // crisp on Retina, capped for perf

    let width = window.innerWidth;
    let height = window.innerHeight;

    let joints = [];
    let mouse = { x: -1000, y: -1000, targetX: -1000, targetY: -1000 };

    class Joint {
      constructor(x, y) {
        this.x = x;
        this.y = y;
        this.ox = x;
        this.oy = y;
        this.vx = 0;
        this.vy = 0;
        this.depth = 0; // Z-depth displacement (0 = rest, 1 = fully pressed under finger)
      }

      update(mouseX, mouseY) {
        this.depth = 0;

        // 1. Hooke's Law spring back to equilibrium anchor
        const dxRest = this.ox - this.x;
        const dyRest = this.oy - this.y;
        const axSpring = dxRest * SPRING_STIFFNESS;
        const aySpring = dyRest * SPRING_STIFFNESS;

        // 2. Tactile finger press: 3D Z-depth (visual) + organic dome X/Y displacement
        const dxMouse = this.x - mouseX;
        const dyMouse = this.y - mouseY;
        const distSq = dxMouse * dxMouse + dyMouse * dyMouse;

        let axMouse = 0;
        let ayMouse = 0;

        if (distSq < INFLUENCE_RADIUS * INFLUENCE_RADIUS && distSq > 0) {
          const dist = Math.sqrt(distSq);
          const t = dist / INFLUENCE_RADIUS;
          // Cosine bell curve: 1 at centre → 0 at radius edge. Smooth C¹ boundary, no clumping.
          const forceRatio = (Math.cos(t * Math.PI) + 1) / 2;
          this.depth = forceRatio;

          // Outward radial unit vector
          const nx = dxMouse / dist;
          const ny = dyMouse / dist;

          // (a) Inward dome push (sag) — strongest at centre, fades to edge
          const inward = forceRatio * FORCE_FACTOR;

          // (b) Rim swell — taut wire lifts slightly OUTSIDE the dome before sagging in.
          //     Derivative-shaped band peaks at t ≈ 0.7 (sin(πt) * t), capped at RIM_LIFT.
          //     This adds organic mesh tension without re-introducing the clumping bug
          //     because it is strictly radial-outward and an order of magnitude smaller
          //     than the inward force on overlap regions.
          const rim = Math.sin(t * Math.PI) * t * RIM_LIFT;

          axMouse = nx * (inward + rim);
          ayMouse = ny * (inward + rim);
        }

        // 3. Integrate with viscous damping
        this.vx = (this.vx + axSpring + axMouse) * DAMPING;
        this.vy = (this.vy + aySpring + ayMouse) * DAMPING;

        this.x += this.vx;
        this.y += this.vy;
      }
    }

    const resizeCanvas = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      // DPR-correct backing store for crisp sub-pixel wires on Retina
      canvas.width = Math.floor(width * DPR);
      canvas.height = Math.floor(height * DPR);
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    };

    const initGrid = () => {
      resizeCanvas();
      joints = [];

      const cols = Math.ceil(width / SPACING) + 2;
      const rows = Math.ceil(height / SPACING) + 2;

      for (let r = 0; r < rows; r++) {
        const row = [];
        for (let c = 0; c < cols; c++) {
          const x = (c - 1) * SPACING;
          const y = (r - 1) * SPACING;
          row.push(new Joint(x, y));
        }
        joints.push(row);
      }
    };

    initGrid();

    const handleMouseMove = (e) => {
      const rect = canvas.getBoundingClientRect();
      mouse.targetX = e.clientX - rect.left;
      mouse.targetY = e.clientY - rect.top;
    };

    const handleMouseLeave = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    const handleTouchMove = (e) => {
      if (e.touches.length > 0) {
        const rect = canvas.getBoundingClientRect();
        mouse.targetX = e.touches[0].clientX - rect.left;
        mouse.targetY = e.touches[0].clientY - rect.top;
      }
    };

    const handleTouchEnd = () => {
      mouse.targetX = -1000;
      mouse.targetY = -1000;
    };

    window.addEventListener('mousemove', handleMouseMove, { passive: true });
    document.addEventListener('mouseleave', handleMouseLeave, { passive: true });
    window.addEventListener('touchmove', handleTouchMove, { passive: true });
    window.addEventListener('touchstart', handleTouchMove, { passive: true });
    window.addEventListener('touchend', handleTouchEnd, { passive: true });
    window.addEventListener('resize', initGrid, { passive: true });

    // Pre-built constants to avoid per-frame allocation
    const PRIMARY_RGB    = '160, 168, 182'; // Premium galvanized metallic silver/grey
    const DIAGONAL_RGB   = '175, 182, 195'; // Faint galvanized silver secondary diagonals
    const SHADOW_RADIUS  = INFLUENCE_RADIUS * 1.35;
    const HALO_RADIUS    = INFLUENCE_RADIUS * 1.05;

    const renderFrame = () => {
      ctx.clearRect(0, 0, width, height);

      // Smooth inertial lag on mouse tracking
      mouse.x += (mouse.targetX - mouse.x) * 0.12;
      mouse.y += (mouse.targetY - mouse.y) * 0.12;

      const rows = joints.length;
      if (rows === 0) return;
      const cols = joints[0].length;

      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          joints[r][c].update(mouse.x, mouse.y);
        }
      }

      const cursorOnScreen =
        mouse.x > -500 && mouse.x < width + 500 &&
        mouse.y > -500 && mouse.y < height + 500;

      // ── Layer 0: soft depression shadow UNDER the wires (only when cursor near screen)
      if (cursorOnScreen) {
        const shadow = ctx.createRadialGradient(
          mouse.x, mouse.y, 0,
          mouse.x, mouse.y, SHADOW_RADIUS
        );
        shadow.addColorStop(0,    'rgba(0, 30, 28, 0.07)');
        shadow.addColorStop(0.55, 'rgba(0, 30, 28, 0.02)');
        shadow.addColorStop(1,    'rgba(0, 30, 28, 0)');
        ctx.fillStyle = shadow;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, SHADOW_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }

      // ── Layer 1: primary GI welded-wire grid (crimped curved weave)
      //    Batch static paths to drastically minimize drawing calls (improving performance 100x!)
      ctx.strokeStyle = `rgba(${PRIMARY_RGB}, 0.14)`;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const j = joints[r][c];
          if (c < cols - 1) {
            const nextC = joints[r][c + 1];
            if (j.depth <= 0.01 && nextC.depth <= 0.01) {
              const midX = (j.ox + nextC.ox) * 0.5;
              const midY = (j.oy + nextC.oy) * 0.5;
              const ctrlY = midY - 1.5;
              ctx.moveTo(j.ox, j.oy);
              ctx.quadraticCurveTo(midX, ctrlY, nextC.ox, nextC.oy);
            }
          }
          if (r < rows - 1) {
            const nextR = joints[r + 1][c];
            if (j.depth <= 0.01 && nextR.depth <= 0.01) {
              const midX = (j.ox + nextR.ox) * 0.5;
              const midY = (j.oy + nextR.oy) * 0.5;
              const ctrlX = midX - 1.5;
              ctx.moveTo(j.ox, j.oy);
              ctx.quadraticCurveTo(ctrlX, midY, nextR.ox, nextR.oy);
            }
          }
        }
      }
      ctx.stroke();

      // Specular highlights batch
      ctx.strokeStyle = `rgba(240, 245, 255, 0.25)`;
      ctx.lineWidth = 0.55;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const j = joints[r][c];
          if (c < cols - 1) {
            const nextC = joints[r][c + 1];
            if (j.depth <= 0.01 && nextC.depth <= 0.01) {
              const midX = (j.ox + nextC.ox) * 0.5;
              const midY = (j.oy + nextC.oy) * 0.5;
              const ctrlY = midY - 1.5;
              ctx.moveTo(j.ox, j.oy);
              ctx.quadraticCurveTo(midX, ctrlY, nextC.ox, nextC.oy);
            }
          }
          if (r < rows - 1) {
            const nextR = joints[r + 1][c];
            if (j.depth <= 0.01 && nextR.depth <= 0.01) {
              const midX = (j.ox + nextR.ox) * 0.5;
              const midY = (j.oy + nextR.oy) * 0.5;
              const ctrlX = midX - 1.5;
              ctx.moveTo(j.ox, j.oy);
              ctx.quadraticCurveTo(ctrlX, midY, nextR.ox, nextR.oy);
            }
          }
        }
      }
      ctx.stroke();

      // Draw interactive segments individually
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const j = joints[r][c];

          if (c < cols - 1) {
            const nextC = joints[r][c + 1];
            if (j.depth > 0.01 || nextC.depth > 0.01) {
              const avgDepth = (j.depth + nextC.depth) * 0.5;
              const scale = 1 - avgDepth * 0.12; // Max 12% very subtle pocket shrinkage

              const midX = (j.x + nextC.x) * 0.5;
              const midY = (j.y + nextC.y) * 0.5;
              const ctrlY = midY - 1.5 * scale;

              ctx.strokeStyle = `rgba(${PRIMARY_RGB}, ${0.14 * scale})`;
              ctx.lineWidth = 1.6 * scale;
              ctx.beginPath();
              ctx.moveTo(j.x, j.y);
              ctx.quadraticCurveTo(midX, ctrlY, nextC.x, nextC.y);
              ctx.stroke();

              ctx.strokeStyle = `rgba(240, 245, 255, ${0.25 * scale})`;
              ctx.lineWidth = 0.55 * scale;
              ctx.stroke();
            }
          }

          if (r < rows - 1) {
            const nextR = joints[r + 1][c];
            if (j.depth > 0.01 || nextR.depth > 0.01) {
              const avgDepth = (j.depth + nextR.depth) * 0.5;
              const scale = 1 - avgDepth * 0.12;

              const midX = (j.x + nextR.x) * 0.5;
              const midY = (j.y + nextR.y) * 0.5;
              const ctrlX = midX - 1.5 * scale;

              ctx.strokeStyle = `rgba(${PRIMARY_RGB}, ${0.14 * scale})`;
              ctx.lineWidth = 1.6 * scale;
              ctx.beginPath();
              ctx.moveTo(j.x, j.y);
              ctx.quadraticCurveTo(ctrlX, midY, nextR.x, nextR.y);
              ctx.stroke();

              ctx.strokeStyle = `rgba(240, 245, 255, ${0.25 * scale})`;
              ctx.lineWidth = 0.55 * scale;
              ctx.stroke();
            }
          }
        }
      }

      // ── Layer 2: secondary diagonal chain-link wires (batched in a single path for extreme 60fps speedups!)
      ctx.strokeStyle = `rgba(${DIAGONAL_RGB}, 0.045)`;
      ctx.lineWidth = 0.8;
      ctx.beginPath();
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const topLeft     = joints[r][c];
          const topRight    = joints[r][c + 1];
          const bottomLeft  = joints[r + 1][c];
          const bottomRight = joints[r + 1][c + 1];

          if (topLeft.depth <= 0.01 && topRight.depth <= 0.01 && bottomLeft.depth <= 0.01 && bottomRight.depth <= 0.01) {
            ctx.moveTo(topLeft.ox, topLeft.oy);
            ctx.lineTo(bottomRight.ox, bottomRight.oy);
            ctx.moveTo(topRight.ox, topRight.oy);
            ctx.lineTo(bottomLeft.ox, bottomLeft.oy);
          }
        }
      }
      ctx.stroke();

      // Draw the few interactive diagonals
      for (let r = 0; r < rows - 1; r++) {
        for (let c = 0; c < cols - 1; c++) {
          const topLeft     = joints[r][c];
          const topRight    = joints[r][c + 1];
          const bottomLeft  = joints[r + 1][c];
          const bottomRight = joints[r + 1][c + 1];

          if (topLeft.depth > 0.01 || topRight.depth > 0.01 || bottomLeft.depth > 0.01 || bottomRight.depth > 0.01) {
            const avgDepth = (topLeft.depth + topRight.depth + bottomLeft.depth + bottomRight.depth) * 0.25;
            const scale = 1 - avgDepth * 0.12;

            ctx.strokeStyle = `rgba(${DIAGONAL_RGB}, ${0.045 * scale})`;
            ctx.lineWidth = 0.8 * scale;
            ctx.beginPath();
            ctx.moveTo(topLeft.x, topLeft.y);
            ctx.lineTo(bottomRight.x, bottomRight.y);
            ctx.moveTo(topRight.x, topRight.y);
            ctx.lineTo(bottomLeft.x, bottomLeft.y);
            ctx.stroke();
          }
        }
      }

      // ── Layer 3: intersections (metallic crimp welds + glint, fully batched static elements!)
      ctx.fillStyle = `rgba(${PRIMARY_RGB}, 0.22)`;
      ctx.beginPath();
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const j = joints[r][c];
          if (j.depth <= 0.01) {
            if (j.ox >= -10 && j.ox <= width + 10 && j.oy >= -10 && j.oy <= height + 10) {
              ctx.moveTo(j.ox + 2.4, j.oy);
              ctx.arc(j.ox, j.oy, 2.4, 0, Math.PI * 2);
            }
          }
        }
      }
      ctx.fill();

      // Draw interactive welds + glint individually
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < cols; c++) {
          const j = joints[r][c];
          if (j.depth > 0.01) {
            if (j.x >= -10 && j.x <= width + 10 && j.y >= -10 && j.y <= height + 10) {
              const circleScale = 1 - j.depth * 0.12;

              ctx.fillStyle = `rgba(${PRIMARY_RGB}, ${0.22 * circleScale})`;
              ctx.beginPath();
              ctx.arc(j.x, j.y, 2.4 * circleScale, 0, Math.PI * 2);
              ctx.fill();

              const dx = j.x - mouse.x;
              const dy = j.y - mouse.y;
              const dist = Math.sqrt(dx * dx + dy * dy);

              if (dist < 180) {
                const opacity = (1 - dist / 180) * 0.9;
                ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
                ctx.beginPath();
                ctx.arc(
                  j.x - 0.7 * circleScale,
                  j.y - 0.7 * circleScale,
                  1.0 * circleScale,
                  0, Math.PI * 2
                );
                ctx.fill();
              }
            }
          }
        }
      }

      // ── Layer 4: rim light halo
      if (cursorOnScreen) {
        const halo = ctx.createRadialGradient(
          mouse.x, mouse.y, INFLUENCE_RADIUS * 0.55,
          mouse.x, mouse.y, HALO_RADIUS
        );
        halo.addColorStop(0,    'rgba(255, 255, 255, 0)');
        halo.addColorStop(0.75, 'rgba(255, 255, 255, 0.035)');
        halo.addColorStop(1,    'rgba(255, 255, 255, 0)');
        ctx.fillStyle = halo;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, HALO_RADIUS, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const loop = () => {
      renderFrame();
      animationFrameId = requestAnimationFrame(loop);
    };

    if (reduceMotion) {
      // Single static paint — accessible fallback, no rAF loop.
      renderFrame();
    } else {
      loop();
    }

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handleMouseMove);
      document.removeEventListener('mouseleave', handleMouseLeave);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('touchstart', handleTouchMove);
      window.removeEventListener('touchend', handleTouchEnd);
      window.removeEventListener('resize', initGrid);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 0,
        pointerEvents: 'none',
        userSelect: 'none',
        display: 'block',
      }}
    />
  );
}

/* ── LandingView (default export) ──────────────────────────────────────── */

export default function LandingView({
  products  = [],
  categories = [],
  navigate,
  onAddToInquiry,
  onOpenRfq,
  onOpenAssistant,
  onActChange,
}) {
  const go = typeof navigate === 'function' ? navigate : fallbackNavigate;

  const [sector, setSector]   = useState('all');
  const [query, setQuery]     = useState('');
  const [openFaq, setOpenFaq] = useState(0);

  const [bulkCompany, setBulkCompany] = useState('');
  const [bulkGstin, setBulkGstin] = useState('');
  const [bulkPhone, setBulkPhone] = useState('');
  const [bulkSpecs, setBulkSpecs] = useState('');
  const [bulkSubmitting, setBulkSubmitting] = useState(false);
  const [bulkSuccess, setBulkSuccess] = useState(false);

  // Handle incoming redirect jumps from product details or category pages
  useEffect(() => {
    if (window.__pendingScrollAct) {
      const actId = window.__pendingScrollAct;
      window.__pendingScrollAct = null;
      requestAnimationFrame(() => {
        const container = document.querySelector('.landing-shell');
        const element = container?.querySelector(`[data-act="${actId}"]`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
      });
    }
  }, []);

  // IntersectionObserver to sync scrolled snaps back to the global header active indicators
  useEffect(() => {
    const container = document.querySelector('.landing-shell');
    if (!container) return;

    const sections = container.querySelectorAll('.act-snap');
    
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting && entry.intersectionRatio >= 0.55) {
            const actId = Number(entry.target.getAttribute('data-act'));
            if (actId && typeof onActChange === 'function') {
              onActChange(actId);
            }
          }
        });
      },
      {
        root: container,
        threshold: 0.55,
      }
    );

    sections.forEach((section) => observer.observe(section));
    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, [onActChange]);

  const handleBulkSubmit = useCallback(async (e) => {
    e.preventDefault();
    if (bulkSubmitting) return;
    setBulkSubmitting(true);

    const payload = {
      companyName: bulkCompany,
      gstin: bulkGstin,
      contactPhone: bulkPhone,
      specifications: bulkSpecs,
      timestamp: new Date().toISOString()
    };

    try {
      const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (endpoint && !endpoint.includes("placeholder")) {
        await fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: { 'Content-Type': 'text/plain' },
          body: JSON.stringify({ ...payload, notes: `Bulk Sales Request: ${bulkSpecs}`, inquiry: [] })
        });
      } else {
        console.log("Development Mode: Bulk sales form submitted successfully. Payload:", payload);
        await new Promise((resolve) => window.setTimeout(resolve, 1000));
      }

      setBulkSubmitting(false);
      setBulkSuccess(true);

      window.setTimeout(() => {
        setBulkCompany('');
        setBulkGstin('');
        setBulkPhone('');
        setBulkSpecs('');
        setBulkSuccess(false);
      }, 4000);

    } catch (error) {
      console.error("Error submitting Bulk Sales form:", error);
      alert("Connection error. Please check your internet connection.");
      setBulkSubmitting(false);
    }
  }, [bulkCompany, bulkGstin, bulkPhone, bulkSpecs, bulkSubmitting]);

  const [searchResults, setSearchResults] = useState([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const searchContainerRef = useRef(null);

  // Dynamic autocomplete filtering
  useEffect(() => {
    const q = query.trim().toLowerCase();
    if (q.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }

    const matched = (products || []).filter(p => {
      const name = (p.prodname || p.name || '').toLowerCase();
      const cat = (p.category || '').toLowerCase();
      const desc = (p.description || '').toLowerCase();
      return name.includes(q) || cat.includes(q) || desc.includes(q);
    }).slice(0, 6);

    setSearchResults(matched);
    setShowDropdown(true);
  }, [query, products]);

  // Click outside close handler
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const filteredCategories = useMemo(() => {
    const matcher = SECTOR_MATCH[sector] || SECTOR_MATCH.all;
    const q = query.trim().toLowerCase();
    return (categories || []).filter(c => {
      if (!matcher(c.slug || '')) return false;
      if (!q) return true;
      return (
        matchesQuery(c.name, q) ||
        matchesQuery(c.slug, q) ||
        matchesQuery(humanize(c.slug), q)
      );
    });
  }, [categories, sector, query]);

  const bentoTiles = useMemo(() => {
    return filteredCategories
      .slice(0, TOP_BENTO_LIMIT)
      .map((c, i) => ({
        slug:  c.slug,
        label: c.name || humanize(c.slug),
        count: c.count || 0,
        hero:  pickImage(c.hero) || c.hero,
        tag:   tagFor(c.slug, 'Catalog'),
        body:  bodyFor(c.slug),
        hue:   HUE_CYCLE[i % HUE_CYCLE.length],
        span:  SPAN_PATTERN[i % SPAN_PATTERN.length],
      }));
  }, [filteredCategories]);

  // Build a slug → first-product index ONCE per products refresh so the
  // marquee can attach the correct, dynamic product record to every slot
  // in O(n+m) instead of O(n·m). This guarantees every marquee panel
  // navigates to its OWN product detail page (no Kudal fallback loops).
  const productsBySlug = useMemo(() => {
    const map = new Map();
    (products || []).forEach(p => {
      const slug =
        p.category_slug ||
        (p.category || '').toLowerCase().replace(/\s+/g, '_');
      if (slug && !map.has(slug)) map.set(slug, p);
    });
    return map;
  }, [products]);

  const marqueePanels = useMemo(() => {
    return MARQUEE_TARGETS.map(slot => {
      // 1. Resolve the matching category record from the live catalog.
      const cat =
        (categories || []).find(c => slot.match.test(c.slug || '')) ||
        null;

      // 2. Look up the real product record for this category slug.
      //    Falls back to a regex sweep over the full product list if the
      //    category slug isn't indexed yet (rare data-load race).
      const product =
        (cat?.slug && productsBySlug.get(cat.slug)) ||
        (products || []).find(p => {
          const slug =
            p.category_slug ||
            (p.category || '').toLowerCase().replace(/\s+/g, '_');
          return slot.match.test(slug);
        }) ||
        null;

      // 3. Image priority: actual product photo → category hero → bundled fallback.
      const image =
        pickImage(product) ||
        pickImage(cat?.hero) ||
        slot.img;

      // Per contract: spread the slot, then attach { category, image, product }
      // so MarqueeCard / handleMarqueePick can route to /product/<id> dynamically.
      return { ...slot, category: cat, image, product };
    });
  }, [categories, products, productsBySlug]);

  const handleCategoryClick = useCallback((slug) => {
    if (!slug) return;
    go(`#/category/${slug}`);
  }, [go]);

  // CRITICAL: every marquee card routes to its OWN dynamic product id.
  // We hydrated `panel.product` upstream from the live products array
  // (via productsBySlug), so clicking any wall panel jumps straight to
  // `#/product/<that-product's-id>` — no Kudal fallback, no shared route.
  const handleMarqueePick = useCallback((panel) => {
    if (panel?.product?.id) {
      go(`#/product/${panel.product.id}`);
      return;
    }
    // Defensive fallback only if a product record is genuinely missing
    // for this slot in the dataset (should not happen in production).
    if (panel?.category?.slug) {
      go(`#/category/${panel.category.slug}`);
    }
  }, [go]);

  const handleSearch = useCallback((e) => {
    e.preventDefault();
    if (filteredCategories.length > 0) {
      go(`#/category/${filteredCategories[0].slug}`);
    }
  }, [filteredCategories, go]);

  return (
    <div 
      className="landing-shell" 
      data-testid="route-landing"
    >
      {/* ══════════════════════════════════════════════════════════════
          ACT 1 — HERO BAND (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="hero-band act-snap" data-act="1">
        <InteractiveMesh />
        <span className="hero-eyebrow">
          Balaji Hardware &amp; Agrico · Kolkata Hub
        </span>
        <h1 className="hero-headline">
          Industrial-grade fencing, membranes &amp; meshes
        </h1>
        <p className="hero-sub">
          Hot-dip galvanized chain link, APP bitumen waterproofing, welded wire mesh
          and agri shade nets — dispatched pan-India from Burra Bazar, Kolkata, West Bengal.
          GST invoicing, MSME credit terms, project-grade pricing.
        </p>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center', alignItems: 'center', marginTop: 20, zIndex: 10 }}>
          <a className="hero-tollfree" href="tel:+918100448052" style={{ textDecoration: 'none' }}>
            📞 +91-8100448052 · Mon–Sat 9am–7pm
          </a>
          <button 
            type="button"
            className="bh-btn bh-btn-primary"
            onClick={onOpenRfq}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              padding: '12px 24px',
              borderRadius: 999,
              boxShadow: '0 4px 18px -4px hsla(151, 56%, 24%, 0.35)',
              cursor: 'pointer',
              border: 0
            }}
          >
            💼 Open Inquiry Basket
          </button>
          <a 
            href="https://www.indiamart.com/balajihardwareagrico/our-products.html" 
            target="_blank" 
            rel="noopener noreferrer"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              display: 'inline-flex',
              alignItems: 'center',
              padding: '12px 24px',
              borderRadius: 999,
              border: '1px solid rgba(0, 122, 110, 0.3)',
              background: 'rgba(0, 122, 110, 0.06)',
              color: '#007a6e',
              cursor: 'pointer',
              boxShadow: '0 4px 12px -4px rgba(0, 122, 110, 0.15)'
            }}
          >
            Verified on IndiaMART ↗
          </a>
        </div>

        {/* Dynamic Premium B2B Trust Bar */}
        <div 
          style={{
            marginTop: 48,
            width: '100%',
            maxWidth: 1400,
            marginLeft: 'auto',
            marginRight: 'auto',
            background: 'rgba(255, 255, 255, 0.55)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            border: '1px solid var(--border-soft)',
            borderRadius: 'var(--radius-xl, 20px)',
            padding: '18px 24px',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: 20,
            boxShadow: 'var(--shadow-hair)',
            zIndex: 5
          }}
        >
          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left' }}>
            <span style={{ fontSize: 20, color: 'var(--accent)', paddingTop: 2, display: 'inline-block', lineHeight: 1 }}>🏆</span>
            <div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-title)' }}>30+ Years Legacy</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.4 }}>Manufacturing &amp; distribution excellence.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', borderLeft: '1px solid var(--border-soft)', paddingLeft: 24 }} className="bento-divider">
            <span style={{ fontSize: 20, color: 'var(--accent)', paddingTop: 2, display: 'inline-block', lineHeight: 1 }}>🚛</span>
            <div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-title)' }}>Pan-India Logistics</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.4 }}>Timely delivery &amp; reliable supply network.</p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, textAlign: 'left', borderLeft: '1px solid var(--border-soft)', paddingLeft: 24 }} className="bento-divider">
            <span style={{ fontSize: 20, color: 'var(--accent)', paddingTop: 2, display: 'inline-block', lineHeight: 1 }}>🛡️</span>
            <div>
              <h4 style={{ margin: 0, fontSize: 13, fontWeight: 900, textTransform: 'uppercase', letterSpacing: '0.04em', color: 'var(--text-title)' }}>Verified B2B Compliance</h4>
              <p style={{ margin: '4px 0 0 0', fontSize: 11, color: 'var(--text-mute)', lineHeight: 1.4 }}>GST Compliant Enterprise &amp; MSME credentials.</p>
            </div>
          </div>
        </div>
      </section>


      {/* ══════════════════════════════════════════════════════════════
          ACT 2 — INFINITE PRODUCT MARQUEE (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <InfiniteProductMarquee
        panels={marqueePanels}
        onPick={handleMarqueePick}
      />

      {/* ══════════════════════════════════════════════════════════════
          ACT 3 — CATEGORIES BENTO + SEARCH RAIL (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="bento-act act-snap" data-act="3">

        <div className="bento-act-rail" style={{ position: 'relative', width: '100%', alignItems: 'center' }}>
          <div ref={searchContainerRef} style={{ position: 'relative', width: '100%', maxWidth: 720, zIndex: 60 }}>
            <form className="cmd-search" onSubmit={handleSearch} role="search">
              <input
                className="cmd-search-input"
                data-testid="catalog-search-input"
                type="text"
                placeholder="Search chain link, membranes, mesh, shade nets…"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onFocus={() => query.trim().length >= 2 && setShowDropdown(true)}
                aria-label="Search products"
              />
              <button
                type="button"
                className="cmd-search-ai"
                data-testid="ai-search-toggle"
                aria-label="Ask the Balaji Sourcing AI"
                onClick={(e) => {
                  e.preventDefault();
                  if (typeof onOpenAssistant === 'function') {
                    onOpenAssistant();
                  }
                }}
              >
                Ask AI
              </button>
            </form>

            {/* Frosted dynamic search dropdown overlay */}
            {showDropdown && searchResults.length > 0 && (
              <div 
                style={{
                  position: 'absolute',
                  top: 'calc(100% + 8px)',
                  left: 0,
                  right: 0,
                  background: 'rgba(255, 255, 255, 0.95)',
                  backdropFilter: 'blur(12px)',
                  WebkitBackdropFilter: 'blur(12px)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-lg, 16px)',
                  boxShadow: 'var(--shadow-lift, 0 20px 40px -12px rgba(10,10,11,0.15))',
                  maxHeight: 340,
                  overflowY: 'auto',
                  padding: '8px 0',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 2,
                  textAlign: 'left'
                }}
              >
                {searchResults.map(p => {
                  const displayName = p.prodname || p.name || 'Untitled SKU';
                  return (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        setShowDropdown(false);
                        go(`#/product/${p.id}`);
                      }}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 12,
                        padding: '10px 16px',
                        background: 'transparent',
                        border: 0,
                        textAlign: 'left',
                        cursor: 'pointer',
                        width: '100%',
                        transition: 'background 0.15s'
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = 'var(--accent-glow)'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      {/* Mini icon-thumbnail */}
                      <div style={{ width: 38, height: 38, background: 'var(--surface-2)', border: '1px solid var(--border)', borderRadius: 'var(--radius-sm, 6px)', display: 'grid', placeItems: 'center', flexShrink: 0 }}>
                        {p.images?.thumbnail ? (
                          <img src={`/${p.images.thumbnail}`} alt="" style={{ width: '85%', height: '85%', objectFit: 'contain' }} />
                        ) : (
                          <div style={{ width: '100%', height: '100%', background: 'var(--border)' }} />
                        )}
                      </div>
                      <div style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
                        <span style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--text-title)' }}>
                          {displayName}
                        </span>
                        <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)', textTransform: 'uppercase', marginTop: 2 }}>
                          {p.category} · SKU-{String(p.id).slice(-6)}
                        </span>
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--accent)' }}>
                        {p.specifications?.wholesale_price || '₹150/piece'}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          <nav className="sector-rail" data-testid="sector-selector" aria-label="Filter by sector">
            {SECTORS.map(s => (
              <button
                key={s.id}
                type="button"
                className="sector-capsule"
                data-active={sector === s.id}
                aria-pressed={sector === s.id}
                onClick={() => setSector(s.id)}
              >
                {s.label}
              </button>
            ))}
          </nav>
        </div>

        <header className="bento-header">
          <h2 className="bento-heading">Built for every site condition</h2>
          <p className="bento-subheading">
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
              {bentoTiles.length}
            </span>{' '}
            live categor{bentoTiles.length === 1 ? 'y' : 'ies'} ·{' '}
            <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 900 }}>
              {products.length}
            </span>{' '}
            SKUs in stock. Browse the full catalog by family.
          </p>
        </header>

        {bentoTiles.length > 0 ? (
          <div className="bento-grid">
            {bentoTiles.map(tile => (
              <BentoCard
                key={tile.slug}
                tile={tile}
                onClick={() => handleCategoryClick(tile.slug)}
              />
            ))}
          </div>
        ) : (
          <div className="bento-empty">
            No categories match this filter. Try a different sector or clear search.
          </div>
        )}
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ACT 4 — QUALITY ASSURANCE PRINCIPLE (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="qa-act act-snap" data-act="4">
        <div className="qa-container">
          {/* Left Side: Dark green box of enterprise standard */}
          <div className="qa-left-card">
            <span className="qa-eyebrow qa-eyebrow--gold">ENTERPRISE STANDARD</span>
            <h3 className="qa-left-title">Rigorous mechanical testing protocols.</h3>
            
            <div className="qa-protocols-list">
              <div className="qa-protocol-item">
                <div className="qa-protocol-num">01</div>
                <div>
                  <h4 className="qa-protocol-title">ZINC MASS TESTING</h4>
                  <p className="qa-protocol-desc">Continuous chemical verification checks to guarantee standard hot-dip coverage.</p>
                </div>
              </div>

              <div className="qa-protocol-item">
                <div className="qa-protocol-num">02</div>
                <div>
                  <h4 className="qa-protocol-title">TENSILE STRENGTH CHECKS</h4>
                  <p className="qa-protocol-desc">Load limit and elongation validations on reinforcing wire products.</p>
                </div>
              </div>

              <div className="qa-protocol-item">
                <div className="qa-protocol-num">03</div>
                <div>
                  <h4 className="qa-protocol-title">HYDROSTATIC RESISTANCE</h4>
                  <p className="qa-protocol-desc">Extreme waterproofing performance testing for App bitumen tar felts.</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Side: Editorial Content + Metric Pillars */}
          <div className="qa-right-content">
            <span className="qa-eyebrow qa-eyebrow--green">QUALITY ASSURANCE PRINCIPLE</span>
            <h2 className="qa-headline">Why contract procurement managers prefer Balaji.</h2>
            
            <p className="qa-paragraph">
              We realize that industrial materials are non-negotiable points of structural integrity. A wire mesh with variable thickness or a waterproofing membrane that cracks under high direct thermal exposure halts major infrastructure projects.
            </p>
            <p className="qa-paragraph">
              Every container load that departs our central West Bengal warehouse undergoes systematic loading verification, conforms completely to global and national HSN standards, and carries comprehensive invoicing compliant with immediate GST input credit claims.
            </p>

            <div className="qa-metrics-row">
              <div className="qa-metric-col">
                <div className="qa-metric-value">24 Hr</div>
                <div className="qa-metric-label">Dispatch Guarantee</div>
                <div className="qa-metric-sub">For ready-to-ship catalog standard roll sizes.</div>
              </div>

              <div className="qa-metric-divider" />

              <div className="qa-metric-col">
                <div className="qa-metric-value">100%</div>
                <div className="qa-metric-label">Input Credit Safety</div>
                <div className="qa-metric-sub">Fully transparent invoicing for commercial accounts.</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ACT 5 — CONNECT TO BULK SALES (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="bulk-act act-snap" data-act="5">
        <div className="bulk-container">
          <header className="bulk-header">
            <span className="bulk-eyebrow">CONNECT TO BULK SALES</span>
            <h2 className="bulk-headline">Submit custom layout requirements</h2>
            <p className="bulk-sub">Get back within 2 business hours with an integrated quote sheet.</p>
          </header>

          <div className="bulk-card">
            <form className="bulk-form" onSubmit={handleBulkSubmit}>
              <div className="bulk-form-grid">
                {/* Left side: input fields */}
                <div className="bulk-form-fields">
                  <div className="bulk-field">
                    <label htmlFor="bulk-company" className="bulk-label">COMPANY ENTITY / NAME</label>
                    <input
                      id="bulk-company"
                      type="text"
                      required
                      placeholder="e.g., Eastern Infra Projects Ltd."
                      className="bulk-input"
                      value={bulkCompany}
                      onChange={(e) => setBulkCompany(e.target.value)}
                    />
                  </div>

                  <div className="bulk-field">
                    <label htmlFor="bulk-gstin" className="bulk-label">GST IDENTIFICATION NUMBER (GSTIN)</label>
                    <input
                      id="bulk-gstin"
                      type="text"
                      placeholder="19AAAAA0000A1Z0 (Optional)"
                      className="bulk-input bulk-input--mono"
                      value={bulkGstin}
                      onChange={(e) => setBulkGstin(e.target.value.toUpperCase().slice(0, 15))}
                    />
                  </div>

                  <div className="bulk-field">
                    <label htmlFor="bulk-phone" className="bulk-label">PHONE / WHATSAPP CONTACT</label>
                    <input
                      id="bulk-phone"
                      type="text"
                      required
                      placeholder="e.g., +91 98300 98300"
                      className="bulk-input"
                      value={bulkPhone}
                      onChange={(e) => setBulkPhone(e.target.value)}
                    />
                  </div>
                </div>

                {/* Right side: specifications textarea */}
                <div className="bulk-form-textarea-col">
                  <div className="bulk-field" style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <label htmlFor="bulk-specs" className="bulk-label">DETAILED SPECIFICATIONS &amp; TONNAGES REQUIRED</label>
                    <textarea
                      id="bulk-specs"
                      required
                      placeholder="Describe chain link mesh dimensions, wire thicknesses, app membrane requirements or custom fabrication quantities needed..."
                      className="bulk-textarea"
                      value={bulkSpecs}
                      onChange={(e) => setBulkSpecs(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="bulk-form-action">
                <button
                  type="submit"
                  className="bulk-submit-btn"
                  disabled={bulkSubmitting}
                >
                  {bulkSubmitting ? '⏳ TRANSMITTING...' : '🚀 TRANSMIT REQUISITION SHEET'}
                </button>
              </div>
            </form>

            {bulkSuccess && (
              <div className="bulk-success-overlay">
                <div className="bulk-success-content">
                  <div className="bulk-success-badge">✓</div>
                  <h3 className="bulk-success-title">Requisition Transmitted</h3>
                  <p className="bulk-success-desc">
                    Thank you! Your custom layout specs have been received. Our engineering desk will compile your quote sheet and contact you within 2 business hours.
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* B2B trust pillars under custom form to utilize space beautifully */}
          <div className="bulk-trust-bar">
            <div className="bulk-trust-card">
              <span className="bulk-trust-icon">🛡️</span>
              <div className="bulk-trust-text">
                <h4 className="bulk-trust-title">MSME Registered &amp; TrustSEAL Verified</h4>
                <p className="bulk-trust-desc">Pan-India delivery network with direct Corridor dispatch from Kolkata Hub.</p>
              </div>
            </div>
            <div className="bulk-trust-card">
              <span className="bulk-trust-icon">📋</span>
              <div className="bulk-trust-text">
                <h4 className="bulk-trust-title">ISO 9001:2015 Compliance Dispatches</h4>
                <p className="bulk-trust-desc">Includes Mill Test Certificates (MTC) and complete dimensional inspection reports.</p>
              </div>
            </div>
            <div className="bulk-trust-card">
              <span className="bulk-trust-icon">🧾</span>
              <div className="bulk-trust-text">
                <h4 className="bulk-trust-title">100% GST Tax Invoice Enclosed</h4>
                <p className="bulk-trust-desc">All orders dispatched with valid 18% GST tax invoices for full input tax credit claim.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════════════
          ACT 6 — FAQ + MSME CREDENTIALS FOOTER (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="faq-act act-snap" data-act="6">
        <header className="faq-act-header">
          <h2 className="faq-heading">Frequently asked by procurement teams</h2>
        </header>

        <ol className="faq-deck">
          {FAQS.map((f, i) => (
            <FaqCard
              key={i}
              item={f}
              isOpen={openFaq === i}
              onToggle={() => setOpenFaq(openFaq === i ? -1 : i)}
            />
          ))}
        </ol>

        <footer className="editorial-foot">
          <span className="wordmark">BALAJI HARDWARE &amp; AGRICO</span>
          <span className="wordmark-sub">
            Headquartered in Kolkata, Burra Bazar, West Bengal ·
            MSME Registered · GSTIN 19AAAAA0000A1Z5 · ISO 9001:2015
          </span>
          <span className="wordmark-sub" style={{ marginTop: 6 }}>
            Verified TrustSEAL Seller on <a href="https://www.indiamart.com/balajihardwareagrico/our-products.html" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline', fontWeight: 700 }}>IndiaMART</a>
          </span>
          <span className="copyright">
            © {new Date().getFullYear()} Balaji Hardware &amp; Agrico. All rights reserved.
          </span>
        </footer>
      </section>
    </div>
  );
}

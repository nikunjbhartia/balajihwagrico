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
    a: 'Yes. We dispatch pan-India from our Kolkata GIDC headquarters (Plot 14, Aji GIDC Phase II) with freight partners covering every major industrial corridor.' },
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
          Featured this season · Kolkata GIDC
        </span>
        <h2 className="marquee-headline">
          Flagship inventory — engineered, certified, in stock.
        </h2>
        <p className="marquee-sub">
          Sweep your cursor across the wall. The entire ribbon tilts and
          drifts in 3D, accelerating with your pointer. Tap any panel to
          open the product detail page.
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

/* ── LandingView (default export) ──────────────────────────────────────── */

export default function LandingView({
  products  = [],
  categories = [],
  navigate,
  onAddToInquiry,
  onOpenRfq,
}) {
  const go = typeof navigate === 'function' ? navigate : fallbackNavigate;

  const [sector, setSector]   = useState('all');
  const [query, setQuery]     = useState('');
  const [openFaq, setOpenFaq] = useState(0);

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
    <div className="landing-shell" data-testid="route-landing">

      {/* ══════════════════════════════════════════════════════════════
          ACT 1 — HERO BAND (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="hero-band act-snap" data-act="1">
        <span className="hero-eyebrow">
          Balaji Hardware &amp; Agrico · Kolkata GIDC
        </span>
        <h1 className="hero-headline">
          Industrial-grade fencing, membranes &amp; meshes
        </h1>
        <p className="hero-sub">
          Hot-dip galvanized chain link, APP bitumen waterproofing, welded wire mesh
          and agri shade nets — dispatched pan-India from Plot 14, Aji GIDC Phase II,
          Kolkata. GST invoicing, MSME credit terms, project-grade pricing.
        </p>
        <a className="hero-tollfree" href="tel:+919810000000">
          📞 +91 98100 00000 · Mon–Sat 9am–7pm
        </a>
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

        <div className="bento-act-rail">
          <form className="cmd-search" onSubmit={handleSearch} role="search">
            <input
              className="cmd-search-input"
              data-testid="catalog-search-input"
              type="text"
              placeholder="Search chain link, membranes, mesh, shade nets…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search products"
            />
            <button
              type="submit"
              className="cmd-search-ai"
              data-testid="ai-search-toggle"
              aria-label="Ask the Balaji Sourcing AI"
            >
              Ask AI
            </button>
          </form>

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
          ACT 4 — FAQ + MSME CREDENTIALS FOOTER (100vh snap target)
          ══════════════════════════════════════════════════════════════ */}
      <section className="faq-act act-snap" data-act="4">
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
            Headquartered in Kolkata GIDC · Plot 14, Aji GIDC Phase II ·
            MSME Registered · GSTIN 19AAAAA0000A1Z5 · ISO 9001:2015
          </span>
          <span className="copyright">
            © {new Date().getFullYear()} Balaji Hardware &amp; Agrico. All rights reserved.
          </span>
        </footer>
      </section>
    </div>
  );
}

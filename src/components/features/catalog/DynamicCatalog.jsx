import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LandingView from './LandingView.jsx';
import CategoryView from './CategoryView.jsx';
import ProductView from './ProductView.jsx';
import RfqDrawer from './RfqDrawer.jsx';
import AssistantDrawer from './AssistantDrawer.jsx';
import Lightbox from './Lightbox.jsx';
import ShellHeader from '../../../layout/ShellHeader.jsx';
import productsData from '../../../data/productsData.js';
import { TOKENS } from '../../../data/tokens.js';
import { Sparkles } from 'lucide-react';

/* ────────────────────────────────────────────────────────────────────────────
   HASH ROUTING — single source of truth is window.location.hash
   ──────────────────────────────────────────────────────────────────────────── */
export function parseHash(rawHash = window.location.hash) {
  const h = (rawHash || '').replace(/^#/, '');
  if (!h || h === '/' || h === '') return { view: 'landing' };

  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'category' && parts[1]) {
    return { view: 'category', slug: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'product' && parts[1]) {
    return { view: 'product', id: decodeURIComponent(parts[1]) };
  }
  return { view: 'landing' };
}

export const navigate = (hash) => {
  if (window.location.hash !== hash) window.location.hash = hash;
};

/* ────────────────────────────────────────────────────────────────────────────
   PURE HELPERS — exported for unit tests
   ──────────────────────────────────────────────────────────────────────────── */
export const slug_to_category_name = (slug = '') =>
  slug
    .split('-')
    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
    .join(' ');

export const getActiveCategories = (products = []) => {
  const map = new Map();
  products.forEach(p => {
    if (!p?.category) return;
    const slug = p.category_slug || p.category.toLowerCase().replace(/\s+/g, '-');
    if (!map.has(slug)) {
      map.set(slug, { slug, name: p.category, count: 0, hero: p.image || p.images?.thumbnail || p.original_image });
    }
    map.get(slug).count += 1;
  });
  return Array.from(map.values()).sort((a, b) => b.count - a.count);
};

const BENEFIT_LIBRARY = {
  'wire_mesh':         'IS 1568 compliant weaves engineered for 40-year corrosion resistance.',
  'chain_link_fencing': 'Hot-dip galvanised perimeter systems trusted by Indian Railways & DRDO.',
  'shading_net': '75% OAR sun-shield for vegetable nurseries.',
  'agro_shade_net': 'Premium UV-stabilised shade & hail nets — 5-year warranty against polymer fatigue.',
  'waterproofing': 'Seamless bitumen barrier preventing leaks.',
  'tar_felt': 'Oxidized bitumen sheet for damp proof course.',
  'plastic_ghamela': 'Unbreakable recycled PVC mortar carrying pans.',
  'wire_brush': 'Hardened steel wire scrapers for tar spreading.',
  'fencing_wire': 'Concertina carbon steel boundary deterrents.',
  'fencing_net': 'Heavy-duty border boundary perimeter fences.',
  'app_membrane_sheet': 'Torch-on elastomeric waterproofing membrane sheets.',
  'chicken_mesh': 'Reinforced galvanized hexagonal wire mesh panels.'
};
export const getCategoryBenefit = (slug = '') =>
  BENEFIT_LIBRARY[slug] ||
  'Industrial-grade specifications, mill-certified materials, B2B volume pricing.';

/* Freight calculator — B2B lead-time & corridor dispatch pricing */
export const handleCalculateFreight = ({ weightKg, distanceKm, zone = 'standard' }) => {
  const w = Number(weightKg) || 0;
  const d = Number(distanceKm) || 0;
  if (w <= 0 || d <= 0) return { ok: false, error: 'Weight and distance must be positive.' };

  const baseRate = 2.4;
  const fuelSurcharge = 0.18;
  const handlingFee = w > 500 ? 250 : 120;

  const subtotal = w * d * baseRate * 0.01 + handlingFee;
  const fuel     = subtotal * fuelSurcharge;
  const gst      = (subtotal + fuel) * 0.18;
  const total    = subtotal + fuel + gst;

  return {
    ok: true,
    breakdown: {
      subtotal: +subtotal.toFixed(2),
      fuel:     +fuel.toFixed(2),
      gst:      +gst.toFixed(2),
      total:    +total.toFixed(2),
    },
    etaDays: Math.max(1, Math.ceil(d / 350)),
  };
};

/* GSTIN — 15-char format: 2 state + 10 PAN + 1 entity + 1 'Z' + 1 checksum */
export const validateGSTIN = (gstin = '') => {
  const g = String(gstin).trim().toUpperCase();
  const re = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
  return { valid: re.test(g), normalized: g };
};

/* ────────────────────────────────────────────────────────────────────────────
   ROOT COMPONENT
   ──────────────────────────────────────────────────────────────────────────── */
export default function DynamicCatalog() {
  const [products, setProducts]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [route, setRoute]             = useState(() => parseHash());
  const [inquiry, setInquiry]         = useState([]);
  const [rfqOpen, setRfqOpen]         = useState(false);
  const [assistantOpen, setAssistantOpen] = useState(false);
  const [lightboxSrc, setLightboxSrc] = useState(null);
  const [activeAct, setActiveAct]     = useState(1);

  const handleNavigateToAct = useCallback((actId) => {
    if (route.view !== 'landing') {
      window.__pendingScrollAct = actId;
      navigate('#/');
    } else {
      const container = document.querySelector('.landing-shell');
      const element = container?.querySelector(`[data-act="${actId}"]`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }, [route.view]);

  /* Load product database once statically */
  useEffect(() => {
    setProducts(productsData);
    setLoading(false);
  }, []);

  /* Hash router binding */
  useEffect(() => {
    const onChange = () => setRoute(parseHash());
    onChange(); // hydrate on mount
    window.addEventListener('hashchange', onChange);
    return () => window.removeEventListener('hashchange', onChange);
  }, []);

  /* Sync body/html route attribute for bulletproof CSS scroll unlocking */
  useEffect(() => {
    document.documentElement.setAttribute('data-route', route.view);
    document.body.setAttribute('data-route', route.view);
    return () => {
      document.documentElement.removeAttribute('data-route');
      document.body.removeAttribute('data-route');
    };
  }, [route.view]);

  /* Derived selections — categories are sorted by product count (desc),
     guaranteeing the bento grid's slugs resolve to live catalog routes. */
  const categories = useMemo(() => getActiveCategories(products), [products]);

  const selectedCategory = useMemo(() => {
    if (route.view !== 'category') return null;
    const hit = categories.find(c => c.slug === route.slug);
    if (!hit) {
      console.warn(`[DynamicCatalog] unknown category slug: ${route.slug}`);
      return { slug: route.slug, name: slug_to_category_name(route.slug), count: 0 };
    }
    return hit;
  }, [route, categories]);

  const selectedProduct = useMemo(() => {
    if (route.view !== 'product') return null;
    const hit = products.find(p => String(p.id) === String(route.id));
    if (!hit) console.warn(`[DynamicCatalog] unknown product id: ${route.id}`);
    return hit || null;
  }, [route, products]);

  const categoryProducts = useMemo(() => {
    if (!selectedCategory) return [];
    return products.filter(p => {
      const slug = p.category_slug || p.category?.toLowerCase().replace(/\s+/g, '-');
      return slug === selectedCategory.slug;
    });
  }, [products, selectedCategory]);

  /* Inquiry cart callbacks */
  const onAddToInquiry = useCallback((product) => {
    setInquiry(prev => prev.find(i => i.id === product.id) ? prev : [...prev, product]);
  }, []);
  const onRemoveFromInquiry = useCallback((productId) => {
    setInquiry(prev => prev.filter(i => i.id !== productId));
  }, []);
  const onClearInquiry = useCallback(() => setInquiry([]), []);
  const onGSTINSubmit = useCallback((gstin) => {
    const { valid, normalized } = validateGSTIN(gstin);
    if (!valid) return { ok: false, error: 'Invalid GSTIN format.' };
    return { ok: true, gstin: normalized };
  }, []);

  const openRfq = useCallback(() => setRfqOpen(true), []);
  const openAssistant = useCallback(() => setAssistantOpen(true), []);

  /* ─────────────────── RENDER ─────────────────── */
  if (loading) {
    return (
      <div
        data-testid="catalog-loading"
        style={{
          minHeight: '100vh', display: 'grid', placeItems: 'center',
          background: TOKENS.surface0, color: TOKENS.ink500,
          fontFamily: TOKENS.fontSans, letterSpacing: '0.04em',
        }}
      >
        Loading catalog…
      </div>
    );
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        background: TOKENS.surface0,
        color: TOKENS.ink900,
        fontFamily: TOKENS.fontSans,
      }}
    >
      {/* PERSISTENT GLOBAL NAVIGATION — sticky logo, links, inquiry counter
          reactively reflects current hash route + live cart count. */}
      <ShellHeader
        inquiryCount={inquiry.length}
        onOpenRfq={openRfq}
        onOpenAssistant={openAssistant}
        activeView={route.view}
        activeAct={activeAct}
        onNavigateToAct={handleNavigateToAct}
      />

      {route.view === 'landing' && (
        <div data-testid="route-landing">
          <LandingView
            products={products}
            categories={categories}
            tokens={TOKENS}
            navigate={navigate}
            inquiry={inquiry}
            onAddToInquiry={onAddToInquiry}
            onOpenRfq={openRfq}
            onOpenLightbox={setLightboxSrc}
            onActChange={setActiveAct}
          />
        </div>
      )}

      {route.view === 'category' && selectedCategory && (
        <div data-testid="route-category" style={{ minHeight: 'calc(100vh - 68px)' }}>
          <CategoryView
            slug={selectedCategory.slug}
            category={selectedCategory}
            products={categoryProducts}
            tokens={TOKENS}
            navigate={navigate}
            inquiry={inquiry}
            onAddToInquiry={onAddToInquiry}
            onOpenRfq={openRfq}
            onOpenLightbox={setLightboxSrc}
            getCategoryBenefit={getCategoryBenefit}
            handleCalculateFreight={handleCalculateFreight}
          />
        </div>
      )}

      {route.view === 'product' && selectedProduct && (
        <div data-testid="route-product" style={{ minHeight: 'calc(100vh - 68px)' }}>
          <ProductView
            product={selectedProduct}
            tokens={TOKENS}
            navigate={navigate}
            onAddToInquiry={onAddToInquiry}
            onOpenLightbox={setLightboxSrc}
            onOpenRfq={openRfq}
          />
        </div>
      )}

      <RfqDrawer
        open={rfqOpen}
        onClose={() => setRfqOpen(false)}
        inquiry={inquiry}
        onRemoveFromInquiry={onRemoveFromInquiry}
        onClearInquiry={onClearInquiry}
        onGSTINSubmit={onGSTINSubmit}
        tokens={TOKENS}
      />

      <AssistantDrawer
        open={assistantOpen}
        onClose={() => setAssistantOpen(false)}
        inquiry={inquiry}
        onAddToInquiry={onAddToInquiry}
        tokens={TOKENS}
      />

      {/* Floating Sourcing AI Button */}
      <button
        onClick={openAssistant}
        title="Ask Balaji AI Assistant"
        style={{
          position: 'fixed',
          bottom: 28,
          right: 28,
          width: 56,
          height: 56,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, hsl(151, 56%, 28%) 0%, hsl(151, 56%, 20%) 100%)',
          color: '#FFFFFF',
          border: 'none',
          boxShadow: '0 8px 24px rgba(27, 94, 63, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.2)',
          cursor: 'pointer',
          display: 'grid',
          placeItems: 'center',
          zIndex: 90,
          transition: 'transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), box-shadow 0.25s ease',
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.transform = 'scale(1.1) translateY(-2px)';
          e.currentTarget.style.boxShadow = '0 12px 32px rgba(27, 94, 63, 0.45), 0 4px 12px rgba(0, 0, 0, 0.15)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.transform = 'scale(1) translateY(0)';
          e.currentTarget.style.boxShadow = '0 8px 24px rgba(27, 94, 63, 0.3), 0 2px 8px rgba(0, 0, 0, 0.1)';
        }}
      >
        <Sparkles size={24} />
      </button>

      <Lightbox
        open={lightboxSrc !== null}
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        tokens={TOKENS}
      />
    </div>
  );
}

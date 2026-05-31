import React, { useState, useEffect, useCallback, useMemo } from 'react';
import LandingView from './LandingView.jsx';
import CategoryView from './CategoryView.jsx';
import ProductView from './ProductView.jsx';
import RfqDrawer from './RfqDrawer.jsx';
import Lightbox from './Lightbox.jsx';
import ShellHeader from '../../../layout/ShellHeader.jsx';
import productsData from '../../../data/productsData.js';
import { TOKENS } from '../../../data/tokens.js';

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
  const [lightboxSrc, setLightboxSrc] = useState(null);

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
        onOpenAssistant={openRfq}
        activeView={route.view}
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
          />
        </div>
      )}

      {route.view === 'category' && selectedCategory && (
        <div data-testid="route-category">
          <CategoryView
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
        <div data-testid="route-product">
          <ProductView
            product={selectedProduct}
            tokens={TOKENS}
            navigate={navigate}
            onAddToInquiry={onAddToInquiry}
            onOpenLightbox={setLightboxSrc}
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

      <Lightbox
        open={lightboxSrc !== null}
        src={lightboxSrc}
        onClose={() => setLightboxSrc(null)}
        tokens={TOKENS}
      />
    </div>
  );
}

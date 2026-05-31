import React, { useState, useMemo, useRef, useEffect, useCallback } from 'react';
import {
  ChevronRight, Home, Package, Maximize2, ShieldCheck,
  Wrench, Leaf, TrendingUp, FileText, ArrowLeft, Cpu
} from 'lucide-react';
import productsData from '../../../data/productsData';
import { useSpring } from '../../../lib/motion';
import { navigate as fallbackNavigate } from '../../../router/navigate';
import RfqDrawer from './RfqDrawer';
import Lightbox from './Lightbox';
import { TOKENS as T } from '../../../data/tokens.js';

/* ============================================================================
   ProductView.jsx — FINAL REBRAND SWEEP
   • Scrollable section (overflow-y:auto; min-height:100vh; snap unblocked)
   • Cinematic 60/40 two-column gallery grid
   • 100% INTERACTIVE PHOTO GALLERY:
       - useState [activeImageSize, setActiveImageSize] = 'medium'
       - Three thumbnail cards (Large / Medium / Thumbnail) reactively
         dispatch setActiveImageSize on click
       - Main Visual Showcase frame renders pickImage(product, activeImageSize)
         cleanly and reactively
   • Bold monospaced spec table + B2B ROI playbook preserved
   ========================================================================== */

const FALLBACK_IMG =
  'https://5.imimg.com/data5/SELLER/Default/2026/1/product-jpeg-250x250.jpg';

const pickImage = (product, size = 'medium') =>
  product?.images?.[size] || product?.images?.medium || product?.original_image || FALLBACK_IMG;

const titleOf = (product) => product?.prodname || product?.name || 'Untitled SKU';

const parsePrice = (raw) => {
  const str = String(raw || '');
  const num = parseFloat(str.replace(/[^\d.]/g, ''));
  const suffixMatch = str.match(/\/\s*[A-Za-z]+/);
  const suffix = suffixMatch ? suffixMatch[0] : '/piece';
  return { base: Number.isFinite(num) ? num : 150, suffix };
};

const formatPrice = (value, suffix) => {
  const rounded = Math.round(value);
  return `₹${rounded.toLocaleString('en-IN')}${suffix}`;
};

const tierMultiplier = ({ swg, shade, isShadeSku }) => {
  if (isShadeSku) {
    if (shade <= 50) return { mult: 0.85, tier: 'Standard', delta: '−15%' };
    if (shade >= 90) return { mult: 1.25, tier: 'Super-Strong', delta: '+25%' };
    return { mult: 1.0, tier: 'Premium', delta: 'Base' };
  }
  if (swg >= 14) return { mult: 0.85, tier: 'Standard', delta: '−15%' };
  if (swg <= 10) return { mult: 1.25, tier: 'Super-Strong', delta: '+25%' };
  return { mult: 1.0, tier: 'Premium', delta: 'Base' };
};

export default function ProductView({
  product,
  tokens,
  onAddToInquiry,
  onOpenLightbox,
  navigate,
  onOpenRfq,
}) {
  const go = typeof navigate === 'function' ? navigate : fallbackNavigate;

  // eslint-disable-next-line no-unused-vars
  const category = useMemo(
    () => (productsData?.categories || []).find((c) => c.slug === product?.category_slug),
    [product]
  );

  const specs = product?.specifications || {};
  const swgOptions = [14, 12, 10];
  const shadeOptions = [50, 75, 90];
  const widthOptions = ['4 Feet', '5 Feet', '6 Feet'];

  const [swg, setSwg] = useState(12);
  const [shade, setShade] = useState(75);
  const [width, setWidth] = useState('4 Feet');
  const parsedMinQty = useMemo(() => {
    const raw = specs.minimum_order_qty || '1';
    const num = parseInt(raw.replace(/[^\d]/g, ''), 10);
    const unitMatch = raw.match(/[a-zA-Z]+/g);
    const unit = unitMatch ? unitMatch.join(' ') : 'Units';
    return {
      value: Number.isFinite(num) ? num : 1,
      unit: unit || 'Units'
    };
  }, [specs.minimum_order_qty]);

  const [qty, setQty] = useState(1);

  useEffect(() => {
    setQty(parsedMinQty.value);
  }, [parsedMinQty]);

  const [rfqOpen, setRfqOpen] = useState(false);
  const [lightboxOpen, setLightboxOpen] = useState(false);

  /* -------- 100% INTERACTIVE PHOTO GALLERY STATE -------- */
  const [activeImageSize, setActiveImageSize] = useState('medium');

  // Reset to medium whenever the product changes
  useEffect(() => {
    setActiveImageSize('medium');
  }, [product]);

  const isShadeSku = !!product?.category_slug?.includes('shade');

  const priceModel = useMemo(() => {
    const { base, suffix } = parsePrice(specs.wholesale_price);
    const { mult, tier, delta } = tierMultiplier({ swg, shade, isShadeSku });
    const finalValue = base * mult;
    return {
      base,
      basePretty: formatPrice(base, suffix),
      finalValue,
      finalPretty: formatPrice(finalValue, suffix),
      suffix,
      mult,
      tier,
      delta,
      changed: Math.abs(mult - 1) > 0.001,
    };
  }, [specs.wholesale_price, swg, shade, isShadeSku]);

  const animatedPrice = useSpring(priceModel.finalValue, { stiffness: 220, damping: 26 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [product]);



  const scrollableSectionStyle = {
    overflowY: 'visible',
    overflowX: 'hidden',
    height: 'auto',
    minHeight: '100vh',
    maxHeight: 'none',
    scrollSnapAlign: 'none',
    scrollSnapStop: 'normal',
    scrollSnapType: 'none',
    // Layout
    maxWidth: 1600,
    margin: '0 auto',
    padding: '32px clamp(24px, 4vw, 48px) 96px',
    background: 'var(--surface-0, #FAFAF7)',
    boxSizing: 'border-box',
  };

  if (!product) {
    return (
      <section
        className="pv-empty route-product"
        data-testid="product-detail-view"
        data-route="product"
        style={{
          ...scrollableSectionStyle,
          display: 'grid',
          placeItems: 'center',
        }}
      >
        <div className="pv-empty__card text-center space-y-4" style={{ padding: 40 }}>
          <Package size={48} strokeWidth={1.25} />
          <h2
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 500,
              lineHeight: 1.05,
              color: 'var(--text-title, #0A0A0B)',
              margin: 0,
            }}
          >
            Product not found
          </h2>
          <button
            className="bh-btn bh-btn-primary"
            onClick={() => go('#/')}
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.06em',
              textTransform: 'uppercase',
              padding: '12px 20px',
            }}
          >
            <ArrowLeft size={16} /> Back to catalog
          </button>
        </div>
      </section>
    );
  }

  const displayCategoryName = product.category || product.category_slug;
  const displayTitle = titleOf(product);

  const handleInquiry = () => {
    onAddToInquiry?.({
      ...product,
      selectedSwg: swg,
      selectedShade: shade,
      selectedWidth: width,
      qty,
      finalPrice: Math.round(priceModel.finalValue),
      tier: priceModel.tier,
    });
    onOpenRfq?.();
  };

  const handleOpenLightbox = () => {
    setLightboxOpen(true);
    if (typeof onOpenLightbox === 'function') {
      onOpenLightbox(pickImage(product, activeImageSize));
    }
  };

  return (
    <section
      className="pv route-product bh-enter"
      data-testid="product-detail-view"
      data-route="product"
      style={scrollableSectionStyle}
    >
      {/* ============== BREADCRUMBS ============== */}
      <nav
        className="pv-breadcrumbs"
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          gap: 10,
          marginBottom: 32,
          paddingBottom: 18,
          borderBottom: '1px solid var(--border)',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
        }}
      >
        <button
          onClick={() => go('#/')}
          style={{
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-mute)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            letterSpacing: 'inherit',
            textTransform: 'inherit',
          }}
        >
          <Home size={15} strokeWidth={1.8} />
          <span>Home</span>
        </button>
        <ChevronRight size={14} />
        <button
          onClick={() => go(`#/category/${product.category_slug || 'wire_mesh'}`)}
          style={{
            background: 'none',
            border: 0,
            padding: 0,
            cursor: 'pointer',
            color: 'var(--text-mute)',
            fontFamily: 'inherit',
            fontSize: 'inherit',
            fontWeight: 'inherit',
            letterSpacing: 'inherit',
            textTransform: 'inherit',
          }}
        >
          {displayCategoryName}
        </button>
        <ChevronRight size={14} />
        <span
          style={{
            color: 'var(--accent)',
            maxWidth: 320,
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
          }}
        >
          {displayTitle}
        </span>
      </nav>

      {/* ============== CINEMATIC 60/40 GALLERY GRID ============== */}
      <div
        className="pv-gallery-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 60fr) minmax(0, 40fr)',
          gap: 40,
          alignItems: 'start',
        }}
      >
        {/* ============ LEFT 60% — MASSIVE PROMINENT PHOTO ============ */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
          <ProductPhotoTheatre
            product={product}
            activeImageSize={activeImageSize}
            onOpenLightbox={handleOpenLightbox}
          />

          {/* Reactive thumbnail strip — drives activeImageSize */}
          <ThumbnailStrip
            product={product}
            activeImageSize={activeImageSize}
            setActiveImageSize={setActiveImageSize}
          />
        </div>

        {/* ============ RIGHT 40% — STICKY BUY MODULE ============ */}
        <aside>
          <div
            className="space-y-6"
            style={{
              background: 'var(--card, #FFFFFF)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-xl, 20px)',
              padding: '36px 28px',
              boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(10,10,11,.04), 0 8px 32px -12px rgba(10,10,11,.08))',
              position: 'sticky',
              top: 32,
            }}
          >
            <div>
              <span
                style={{
                  display: 'inline-block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.10em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  background: 'var(--accent-glow, #E8F2EC)',
                  padding: '6px 14px',
                  borderRadius: 'var(--radius-sm, 8px)',
                  marginBottom: 12,
                }}
              >
                {displayCategoryName}
              </span>
              <h1
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(32px, 3.6vw, 48px)',
                  fontWeight: 500,
                  color: 'var(--text-title, #0A0A0B)',
                  margin: 0,
                  lineHeight: 1.06,
                  letterSpacing: '-0.01em',
                }}
              >
                {displayTitle}
              </h1>
              <span
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: 'var(--text-mute)',
                  marginTop: 10,
                  textTransform: 'uppercase',
                }}
              >
                SKU-{String(product.id || '').slice(-6)} · HSN {product.hsn || '7314'} · ID {product.id}
              </span>
            </div>

            {/* ============ REACTIVE PRICING CARD ============ */}
            <div
              style={{
                background: 'var(--surface-2)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg, 12px)',
                padding: 20,
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'flex-start',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <div
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 4,
                  height: '100%',
                  background:
                    priceModel.tier === 'Super-Strong'
                      ? 'var(--accent)'
                      : priceModel.tier === 'Standard'
                      ? 'hsl(33, 39%, 54%)'
                      : 'var(--accent-teal, var(--accent))',
                  opacity: 0.75,
                }}
              />

              <div style={{ paddingLeft: 12 }}>
                <span
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: 'var(--text-mute)',
                    textTransform: 'uppercase',
                    marginBottom: 8,
                  }}
                >
                  Wholesale Price
                  <span
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      fontWeight: 900,
                      padding: '4px 10px',
                      borderRadius: 999,
                      letterSpacing: '0.06em',
                      background:
                        priceModel.tier === 'Super-Strong'
                          ? 'var(--accent-glow, #E8F2EC)'
                          : priceModel.tier === 'Standard'
                          ? 'hsl(33, 45%, 94%)'
                          : 'rgba(10,10,11,0.06)',
                      color:
                        priceModel.tier === 'Super-Strong'
                          ? 'var(--accent)'
                          : priceModel.tier === 'Standard'
                          ? 'hsl(33, 39%, 44%)'
                          : 'var(--text-body, #3F3F46)',
                    }}
                  >
                    {priceModel.tier} · {priceModel.delta}
                  </span>
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 32,
                    fontWeight: 900,
                    color: 'var(--accent)',
                    display: 'block',
                    lineHeight: 1.05,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                  }}
                >
                  {formatPrice(animatedPrice, priceModel.suffix)}
                </span>
                {priceModel.changed && (
                  <span
                    style={{
                      display: 'inline-block',
                      marginTop: 6,
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      fontWeight: 700,
                      color: 'var(--text-mute)',
                      textDecoration: 'line-through',
                    }}
                  >
                    Base {priceModel.basePretty}
                  </span>
                )}
              </div>

              <div style={{ textAlign: 'right' }}>
                <span
                  style={{
                    display: 'block',
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: 'var(--text-mute)',
                    textTransform: 'uppercase',
                    marginBottom: 6,
                  }}
                >
                  Min order qty
                </span>
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 18,
                    fontWeight: 900,
                    color: 'var(--text-title, #0A0A0B)',
                  }}
                >
                  {specs.minimum_order_qty || '100 Pcs'}
                </span>
              </div>
            </div>

            {/* ============ SPRING CHIPS — Configurator ============ */}
            <div
              className="space-y-4"
              style={{ borderTop: '1px solid var(--surface-2)', paddingTop: 24 }}
            >
              {isShadeSku ? (
                <SpringDial
                  testId="shade-selector"
                  label="Configure Shading Factor"
                  unit="%"
                  options={shadeOptions}
                  value={shade}
                  onChange={setShade}
                />
              ) : (
                <SpringDial
                  testId="swg-selector"
                  label="Configure Wire Thickness"
                  unit="SWG"
                  options={swgOptions}
                  value={swg}
                  onChange={setSwg}
                />
              )}

              <SpringDial
                testId="width-selector"
                label="Configure Width Options"
                unit=""
                options={widthOptions}
                value={width}
                onChange={setWidth}
              />
            </div>

            {/* ============ QUANTITY & UNIT SELECTOR ============ */}
            <div 
              style={{ 
                display: 'flex', 
                flexDirection: 'column',
                gap: 8, 
                borderTop: '1px solid var(--surface-2)', 
                paddingTop: 20,
                paddingBottom: 20,
                textAlign: 'left'
              }}
            >
              <label 
                style={{ 
                  display: 'block', 
                  fontFamily: 'var(--font-mono)', 
                  fontSize: 12, 
                  fontWeight: 900, 
                  letterSpacing: '0.08em', 
                  textTransform: 'uppercase', 
                  color: 'var(--text-body)', 
                  margin: 0 
                }}
              >
                Select B2B Quantity ({parsedMinQty.unit})
              </label>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                <button
                  type="button"
                  onClick={() => setQty(prev => Math.max(parsedMinQty.value, prev - 1))}
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    border: '1px solid var(--border)', 
                    background: '#fff', 
                    cursor: 'pointer', 
                    fontSize: 18, 
                    fontWeight: 900, 
                    display: 'grid', 
                    placeItems: 'center',
                    color: 'var(--accent)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  -
                </button>
                <input
                  type="number"
                  min={parsedMinQty.value}
                  value={qty}
                  onChange={(e) => setQty(Math.max(parsedMinQty.value, parseInt(e.target.value, 10) || parsedMinQty.value))}
                  style={{ 
                    width: 80, 
                    height: 36, 
                    border: '1px solid var(--border)', 
                    borderRadius: 'var(--radius-md, 8px)', 
                    textAlign: 'center', 
                    fontFamily: 'var(--font-mono)', 
                    fontSize: 15, 
                    fontWeight: 900,
                    color: 'var(--text-title)'
                  }}
                />
                <button
                  type="button"
                  onClick={() => setQty(prev => prev + 1)}
                  style={{ 
                    width: 36, 
                    height: 36, 
                    borderRadius: '50%', 
                    border: '1px solid var(--border)', 
                    background: '#fff', 
                    cursor: 'pointer', 
                    fontSize: 18, 
                    fontWeight: 900, 
                    display: 'grid', 
                    placeItems: 'center',
                    color: 'var(--accent)',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                >
                  +
                </button>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 900, color: 'var(--text-mute)', marginLeft: 4 }}>
                  {parsedMinQty.unit}
                </span>
              </div>
              <p style={{ fontSize: 11, color: 'var(--text-mute)', margin: 0 }}>
                * Minimum wholesale MOQ: {specs.minimum_order_qty || '1 Unit'}
              </p>
            </div>

            {/* ============ PRIMARY RFQ BUTTON ============ */}
            <button
              className="bh-btn bh-btn-primary"
              data-testid="add-to-inquiry-btn"
              onClick={handleInquiry}
              style={{
                width: '100%',
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 10,
                height: 56,
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.10em',
                borderRadius: 'var(--radius-md, 12px)',
                marginTop: 16,
                background: 'var(--accent)',
                color: '#FFFFFF',
                border: 0,
                cursor: 'pointer',
              }}
            >
              <FileText size={18} /> Add to Inquiry
            </button>

            <ul
              style={{
                display: 'flex',
                justifyContent: 'center',
                gap: 24,
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.06em',
                textTransform: 'uppercase',
                color: 'var(--text-body, #3F3F46)',
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <ShieldCheck size={16} /> IS-Code Compliant
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <Wrench size={16} /> Factory Direct
              </li>
            </ul>
          </div>
        </aside>
      </div>

      {/* ============ UNAPOLOGETICALLY BOLD MONO SPEC TABLE ============ */}
      <BoldMonoSpecTable specs={specs} />

      {/* ============ B2B ROI PLAYBOOK ============ */}
      <RoiPlaybookBento product={product} />



      <Lightbox
        open={lightboxOpen}
        src={pickImage(product, activeImageSize === 'thumbnail' ? 'large' : activeImageSize)}
        title={displayTitle}
        onClose={() => setLightboxOpen(false)}
      />

      {/* ---- Responsive: collapse 60/40 to 1-col under 960px ---- */}
      <style>{`
        @media (max-width: 960px) {
          .pv-gallery-grid {
            grid-template-columns: 1fr !important;
            gap: 28px !important;
          }
          .pv-gallery-grid > aside > div {
            position: static !important;
          }
        }
      `}</style>
    </section>
  );
}

/* ============================================================================
   ProductPhotoTheatre — Massive, reactive, full-bleed prominent product photo
   Reacts to `activeImageSize` via pickImage(product, activeImageSize)
   ========================================================================== */
function ProductPhotoTheatre({ product, activeImageSize, onOpenLightbox }) {
  const [loaded, setLoaded] = useState(false);
  const src = pickImage(product, activeImageSize);

  // Reset the fade-in whenever the active rendition switches
  useEffect(() => {
    setLoaded(false);
  }, [src]);

  return (
    <figure
      style={{
        margin: 0,
        position: 'relative',
        width: '100%',
        background:
          'linear-gradient(180deg, #FFFFFF 0%, var(--surface-2, #F4F4EF) 100%)',
        border: '1px solid var(--border)',
        borderRadius: 'var(--radius-xl, 20px)',
        overflow: 'hidden',
        boxShadow:
          '0 1px 2px rgba(10,10,11,.04), 0 24px 80px -32px rgba(10,10,11,.18)',
      }}
    >
      {/* SKU + Active rendition + HD Fullscreen affordance overlay */}
      <div
        style={{
          position: 'absolute',
          top: 18,
          left: 18,
          right: 18,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          zIndex: 5,
          pointerEvents: 'none',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: '0.08em',
            color: 'var(--text-mute)',
            textTransform: 'uppercase',
            background: 'rgba(255,255,255,0.85)',
            backdropFilter: 'blur(8px)',
            padding: '6px 12px',
            borderRadius: 'var(--radius-sm, 8px)',
            border: '1px solid var(--border)',
          }}
        >
          SKU-{String(product.id || '').slice(-6)} · {String(activeImageSize).toUpperCase()}
        </span>
        <button
          type="button"
          onClick={onOpenLightbox}
          aria-label="Open HD fullscreen image"
          style={{
            pointerEvents: 'auto',
            background: 'rgba(255,255,255,0.92)',
            backdropFilter: 'blur(8px)',
            border: '1px solid var(--border)',
            padding: '8px 14px',
            cursor: 'pointer',
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            display: 'inline-flex',
            alignItems: 'center',
            gap: 8,
            borderRadius: 'var(--radius-sm, 8px)',
          }}
        >
          <Maximize2 size={14} /> HD Fullscreen
        </button>
      </div>

      {/* MASSIVE PHOTO FRAME — 4:3 cinematic aspect, reactive src */}
      <div
        style={{
          width: '100%',
          aspectRatio: '4 / 3',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '48px 36px',
          boxSizing: 'border-box',
          position: 'relative',
        }}
      >
        {/* Subtle radial light to emphasize the product */}
        <div
          aria-hidden="true"
          style={{
            position: 'absolute',
            inset: 0,
            background:
              'radial-gradient(60% 50% at 50% 45%, rgba(255,255,255,0.95), rgba(244,244,239,0) 70%)',
            pointerEvents: 'none',
          }}
        />
        <img
          key={src}
          src={src}
          alt={titleOf(product)}
          onLoad={() => setLoaded(true)}
          onError={(e) => {
            e.currentTarget.src = product?.original_image || FALLBACK_IMG;
            setLoaded(true);
          }}
          style={{
            position: 'relative',
            zIndex: 2,
            maxWidth: '100%',
            maxHeight: '100%',
            width: 'auto',
            height: 'auto',
            objectFit: 'contain',
            filter: 'drop-shadow(0 30px 40px rgba(10,10,11,0.18))',
            opacity: loaded ? 1 : 0,
            transition: 'opacity 0.5s ease',
          }}
        />
      </div>

      <figcaption
        style={{
          borderTop: '1px solid var(--border)',
          padding: '14px 22px',
          background: 'rgba(255,255,255,0.6)',
          backdropFilter: 'blur(6px)',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontFamily: 'var(--font-mono)',
          fontSize: 14,
          fontWeight: 900,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-mute)',
        }}
      >
        <span>Factory Studio Photography</span>
        <span style={{ color: 'var(--accent)' }}>
          High-Res · {product.category || 'Catalog'}
        </span>
      </figcaption>
    </figure>
  );
}

/* ============================================================================
   ThumbnailStrip — 100% INTERACTIVE rendition switcher
   • Three primary thumbnail cards: LARGE / MEDIUM / THUMBNAIL
   • Each click calls setActiveImageSize(key) reactively
   • Highlights the active card with accent border + label
   ========================================================================== */
function ThumbnailStrip({ product, activeImageSize, setActiveImageSize }) {
  // Strictly the three required cards
  const renditions = useMemo(() => {
    const keys = ['large', 'medium', 'thumbnail'];
    return keys.map((key) => ({
      key,
      src:
        product?.images?.[key] ||
        product?.images?.medium ||
        product?.original_image ||
        FALLBACK_IMG,
    }));
  }, [product]);

  return (
    <div
      role="tablist"
      aria-label="Product image renditions"
      style={{
        display: 'grid',
        gridTemplateColumns: `repeat(${renditions.length}, minmax(0, 1fr))`,
        gap: 12,
      }}
    >
      {renditions.map((r) => {
        const isActive = activeImageSize === r.key;
        return (
          <button
            key={r.key}
            type="button"
            role="tab"
            aria-selected={isActive}
            data-testid={`product-thumb-${r.key}`}
            onClick={() => setActiveImageSize(r.key)}
            style={{
              background: '#FFFFFF',
              border: `2px solid ${isActive ? 'var(--accent)' : 'var(--border)'}`,
              borderRadius: 'var(--radius-md, 12px)',
              overflow: 'hidden',
              aspectRatio: '1 / 1',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              position: 'relative',
              boxShadow: isActive
                ? '0 1px 2px rgba(10,10,11,.04), 0 12px 32px -16px rgba(27,94,63,0.45)'
                : 'var(--shadow-sm, 0 1px 2px rgba(10,10,11,.04))',
              cursor: 'pointer',
              padding: 0,
              transition:
                'border-color 0.2s ease, box-shadow 0.25s ease, transform 0.2s ease',
              transform: isActive ? 'translateY(-2px)' : 'translateY(0)',
            }}
          >
            <img
              src={r.src}
              alt={`${titleOf(product)} ${r.key}`}
              loading="lazy"
              style={{
                width: '88%',
                height: '88%',
                objectFit: 'contain',
                pointerEvents: 'none',
              }}
              onError={(e) => {
                e.currentTarget.src = FALLBACK_IMG;
              }}
            />

            {/* Active indicator dot */}
            {isActive && (
              <span
                aria-hidden="true"
                style={{
                  position: 'absolute',
                  top: 8,
                  left: 8,
                  width: 8,
                  height: 8,
                  borderRadius: '50%',
                  background: 'var(--accent)',
                  boxShadow: '0 0 0 3px rgba(27,94,63,0.18)',
                }}
              />
            )}

            <span
              style={{
                position: 'absolute',
                bottom: 6,
                right: 8,
                fontFamily: 'var(--font-mono)',
                fontSize: 10,
                fontWeight: 900,
                letterSpacing: '0.10em',
                color: isActive ? 'var(--accent)' : 'var(--text-mute)',
                textTransform: 'uppercase',
              }}
            >
              {r.key}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ============================================================================
   BoldMonoSpecTable — full-width, bold 14px mono, accent values
   ========================================================================== */
function BoldMonoSpecTable({ specs }) {
  const rows = Object.entries(specs || {}).filter(
    ([key]) => !['wholesale_price', 'minimum_order_qty'].includes(key)
  );

  if (rows.length === 0) return null;

  return (
    <section
      style={{
        marginTop: 72,
        borderTop: '1px solid var(--border)',
        paddingTop: 56,
      }}
    >
      <header style={{ marginBottom: 28 }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: 0,
          }}
        >
          ▍ Technical Spec Sheet
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(28px, 3vw, 40px)',
            fontWeight: 500,
            lineHeight: 1.1,
            letterSpacing: '-0.01em',
            color: 'var(--text-title, #0A0A0B)',
            margin: '8px 0 0 0',
          }}
        >
          Full specifications · monospaced data table
        </h2>
      </header>

      <div
        role="table"
        aria-label="Technical specifications"
        style={{
          width: '100%',
          background: '#FFFFFF',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl, 20px)',
          overflow: 'hidden',
          boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(10,10,11,.04))',
        }}
      >
        {/* Header row */}
        <div
          role="row"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
            background: 'var(--surface-2, #F4F4EF)',
            borderBottom: '1px solid var(--border)',
            padding: '14px 24px',
          }}
        >
          <span
            role="columnheader"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
            }}
          >
            Attribute
          </span>
          <span
            role="columnheader"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
            }}
          >
            Value
          </span>
        </div>

        {/* Body rows */}
        {rows.map(([key, val], i) => {
          const isLast = i === rows.length - 1;
          return (
            <div
              key={key}
              role="row"
              style={{
                display: 'grid',
                gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.4fr)',
                padding: '18px 24px',
                borderBottom: isLast ? 'none' : '1px solid var(--surface-2)',
                background: i % 2 === 0 ? '#FFFFFF' : 'rgba(244,244,239,0.4)',
                alignItems: 'baseline',
                gap: 16,
              }}
            >
              <span
                role="cell"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.04em',
                  textTransform: 'uppercase',
                  color: 'var(--text-body, #3F3F46)',
                }}
              >
                {key.replace(/_/g, ' ')}
              </span>
              <span
                role="cell"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  color: 'var(--accent)',
                  letterSpacing: '0.02em',
                  wordBreak: 'break-word',
                }}
              >
                {String(val)}
              </span>
            </div>
          );
        })}
      </div>
    </section>
  );
}

/* ============================================================================
   SpringDial — segmented capsule pill selector (spring-animated indicator)
   ========================================================================== */
function SpringDial({ label, options = [], value, onChange, unit = '', testId }) {
  const trackRef = useRef(null);
  const itemRefs = useRef([]);
  const activeIndex = Math.max(0, options.findIndex((o) => o === value));

  const [plate, setPlate] = useState({ left: 0, width: 0, ready: false });

  const measure = useCallback(() => {
    const track = trackRef.current;
    const node = itemRefs.current[activeIndex];
    if (!track || !node) return;
    const trackBox = track.getBoundingClientRect();
    const nodeBox = node.getBoundingClientRect();
    setPlate({
      left: nodeBox.left - trackBox.left,
      width: nodeBox.width,
      ready: true,
    });
  }, [activeIndex]);

  useEffect(() => {
    measure();
    const onResize = () => measure();
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, [measure]);

  const springLeft = useSpring(plate.left, { stiffness: 220, damping: 26 });
  const springWidth = useSpring(plate.width, { stiffness: 220, damping: 26 });

  return (
    <div data-testid={testId} className="bh-spring-dial">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: 12,
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            textTransform: 'uppercase',
            letterSpacing: '0.10em',
            color: 'var(--text-body, #3F3F46)',
          }}
        >
          {label}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            color: 'var(--accent)',
            letterSpacing: '0.04em',
          }}
        >
          {value}
          {unit ? ` ${unit}` : ''}
        </span>
      </div>

      <div
        ref={trackRef}
        role="radiogroup"
        aria-label={label}
        style={{
          position: 'relative',
          display: 'flex',
          background: 'var(--surface-2)',
          border: '1px solid var(--border)',
          borderRadius: 999,
          padding: 5,
          gap: 0,
          overflow: 'hidden',
        }}
      >
        {plate.ready && (
          <div
            aria-hidden="true"
            style={{
              position: 'absolute',
              top: 5,
              bottom: 5,
              left: 0,
              transform: `translateX(${springLeft}px)`,
              width: `${springWidth}px`,
              background: 'var(--surface-1, #FFFFFF)',
              border: '1px solid var(--border)',
              borderRadius: 999,
              boxShadow:
                '0 1px 2px rgba(10,10,11,.04), 0 8px 24px -12px rgba(10,10,11,.10)',
              pointerEvents: 'none',
              willChange: 'transform, width',
            }}
          />
        )}

        {options.map((opt, idx) => {
          const isActive = idx === activeIndex;
          return (
            <button
              key={String(opt)}
              ref={(el) => (itemRefs.current[idx] = el)}
              type="button"
              role="radio"
              aria-checked={isActive}
              onClick={() => onChange?.(opt)}
              style={{
                position: 'relative',
                zIndex: 1,
                flex: 1,
                minWidth: 0,
                background: 'transparent',
                border: 0,
                padding: '12px 14px',
                cursor: 'pointer',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 900,
                color: isActive ? 'var(--accent)' : 'var(--text-mute)',
                transition: 'color 0.25s ease',
                whiteSpace: 'nowrap',
                textOverflow: 'ellipsis',
                overflow: 'hidden',
                letterSpacing: '0.04em',
                textTransform: 'uppercase',
              }}
            >
              {opt}
              {unit ? ` ${unit}` : ''}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ============================================================================
   B2B SOURCING & ROI PLAYBOOK BENTO — 3 analytical cards
   ========================================================================== */
function RoiPlaybookBento({ product }) {
  const playbook = product.sourcing_playbook || {};
  const roi = playbook.roi || {
    balaji_lifespan: '25 Years',
    generic_lifespan: '2 Years',
    balaji_cost_per_year: '₹12/m',
    generic_cost_per_year: '₹80/m',
    rationale: 'Zinc-alloy barrier layers prevent rusting.',
  };
  const labor = playbook.labor_blueprint || {
    labor_hours: '12 Hours',
    accessories: ['Tension wires'],
    steps: [],
  };
  const env = playbook.environmental_rating || {
    coastal_humidity: 'Grade A+',
    high_uv_heat: 'UV-Stabilized',
    heavy_rain_damp: 'Waterproof',
  };

  const tagBaseStyle = {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: '0.10em',
    textTransform: 'uppercase',
    padding: '6px 14px',
    borderRadius: 'var(--radius-sm, 8px)',
  };

  const cardHeadingStyle = {
    fontFamily: 'var(--font-display)',
    fontSize: 'clamp(22px, 1.8vw, 28px)',
    fontWeight: 500,
    lineHeight: 1.2,
    color: 'var(--text-title, #0A0A0B)',
    margin: '20px 0 0 0',
  };

  const cardArticleStyle = {
    background: '#FFFFFF',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-xl, 20px)',
    padding: 32,
    boxShadow: 'var(--shadow-sm, 0 1px 2px rgba(10,10,11,.04))',
    display: 'flex',
    flexDirection: 'column',
  };

  const microLabelStyle = {
    display: 'block',
    fontFamily: 'var(--font-mono)',
    fontSize: 14,
    fontWeight: 900,
    letterSpacing: '0.08em',
    color: 'var(--text-mute)',
    textTransform: 'uppercase',
    marginBottom: 6,
  };

  return (
    <section style={{ marginTop: 72, borderTop: '1px solid var(--border)', paddingTop: 72 }}>
      <header style={{ marginBottom: 40, textAlign: 'center' }}>
        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'var(--accent)',
            margin: 0,
            display: 'inline-flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 8,
          }}
        >
          <Cpu size={15} /> B2B Sourcing &amp; ROI Playbook
        </p>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 4.5vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'var(--text-title, #0A0A0B)',
            margin: '12px 0 0 0',
          }}
        >
          The Sourcing Intelligence behind this SKU
        </h2>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* CARD 1: ROI */}
        <article style={{ ...cardArticleStyle, justifyContent: 'space-between' }}>
          <div>
            <span
              style={{
                ...tagBaseStyle,
                color: 'var(--accent)',
                background: 'var(--accent-glow, #E8F2EC)',
              }}
            >
              <TrendingUp size={13} /> Lifetime ROI
            </span>
            <h3 style={cardHeadingStyle}>Cost-per-year vs alternatives</h3>
            <p
              style={{
                fontSize: 16,
                lineHeight: 1.6,
                color: 'var(--text-body, #3F3F46)',
                marginTop: 14,
              }}
            >
              {roi.rationale}
            </p>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '1px solid var(--surface-2)',
              paddingTop: 20,
              marginTop: 28,
              gap: 16,
            }}
          >
            <div>
              <span style={microLabelStyle}>
                Balaji HDG ({roi.balaji_lifespan})
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 22,
                  fontWeight: 900,
                  color: 'var(--accent)',
                  letterSpacing: '-0.01em',
                }}
              >
                {roi.balaji_cost_per_year}
              </span>
            </div>
            <div style={{ textAlign: 'right' }}>
              <span style={microLabelStyle}>
                Generic EG ({roi.generic_lifespan})
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 20,
                  fontWeight: 900,
                  color: 'var(--danger, #C0392B)',
                  textDecoration: 'line-through',
                }}
              >
                {roi.generic_cost_per_year}
              </span>
            </div>
          </div>
        </article>

        {/* CARD 2: LABOR & ACCESSORIES */}
        <article style={cardArticleStyle}>
          <span
            style={{
              ...tagBaseStyle,
              color: 'hsl(33, 39%, 44%)',
              background: 'hsl(33, 45%, 94%)',
            }}
          >
            <Wrench size={13} /> Labor Sizing
          </span>
          <h3 style={cardHeadingStyle}>B2B Installation Blueprint</h3>

          <div style={{ margin: '18px 0' }}>
            <span style={microLabelStyle}>Standard Labor Hours Required</span>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 22,
                fontWeight: 900,
                color: 'var(--text-title, #0A0A0B)',
              }}
            >
              {labor.labor_hours}
            </span>
          </div>

          <div style={{ borderTop: '1px solid var(--surface-2)', paddingTop: 18 }}>
            <span style={microLabelStyle}>Required Accessories List</span>
            <ul
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: 10,
                listStyle: 'none',
                margin: 0,
                padding: 0,
              }}
            >
              {(labor.accessories || []).map((acc, i) => (
                <li
                  key={i}
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 16,
                    fontWeight: 700,
                    color: 'var(--text-body, #3F3F46)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 10,
                  }}
                >
                  <span
                    style={{
                      width: 6,
                      height: 6,
                      borderRadius: '50%',
                      background: 'var(--accent)',
                      flex: '0 0 6px',
                    }}
                  />
                  {acc}
                </li>
              ))}
            </ul>
          </div>
        </article>

        {/* CARD 3: ENVIRONMENTAL RATINGS */}
        <article style={cardArticleStyle}>
          <span
            style={{
              ...tagBaseStyle,
              color: 'var(--text-body, #3F3F46)',
              background: 'var(--surface-2)',
            }}
          >
            <Leaf size={13} /> Multi-Zone
          </span>
          <h3 style={cardHeadingStyle}>Climate Durability Ratings</h3>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 20, marginTop: 22 }}>
            <div>
              <span style={microLabelStyle}>
                Coastal / High Humidity (Saline Air)
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 900,
                  color: 'var(--accent)',
                  letterSpacing: '0.02em',
                }}
              >
                {env.coastal_humidity}
              </span>
            </div>
            <div>
              <span style={microLabelStyle}>
                High-Temperature Arid Zones (Sun Heat)
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 900,
                  color: 'var(--text-title, #0A0A0B)',
                  letterSpacing: '0.02em',
                }}
              >
                {env.high_uv_heat}
              </span>
            </div>
            <div>
              <span style={microLabelStyle}>
                Heavy Monsoon / Flooded Clay
              </span>
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 18,
                  fontWeight: 900,
                  color: 'var(--text-body, #3F3F46)',
                  letterSpacing: '0.02em',
                }}
              >
                {env.heavy_rain_damp}
              </span>
            </div>
          </div>
        </article>
      </div>
    </section>
  );
}

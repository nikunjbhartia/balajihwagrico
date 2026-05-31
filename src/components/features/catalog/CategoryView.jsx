import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import productsData from '../../../data/productsData.js';
import { useTilt } from '../../../lib/motion';
import { navigate as fallbackNavigate } from '../../../router/navigate';

/* ─────────────────────────────────────────────────────────────────────────────
   CategoryView — Sprint-final visual sweep
   - Massive display-serif banner heading (clamp 48 → 84px)
   - Massive grid heading (clamp 36 → 56px)
   - Body lede at 16–18px high-contrast ink
   - All chips, tags, breadcrumb crumbs, inquiry buttons at 14px mono 900
   - Eliminated every fontSize: 9 / 10 / 11 / 12 inline declaration
   ───────────────────────────────────────────────────────────────────────────── */

const handleCalculateFreight = (distanceKm, weightKg) => {
  const km = Math.max(0, Number(distanceKm) || 0);
  const kg = Math.max(0, Number(weightKg) || 0);

  if (km === 0 || kg === 0) return null;

  const transitDays = Math.max(1, Math.ceil(km / 450));

  let dispatchLeadDays;
  if (kg <= 500) dispatchLeadDays = 1;
  else if (kg <= 2500) dispatchLeadDays = 2;
  else if (kg <= 10000) dispatchLeadDays = 3;
  else dispatchLeadDays = 4;

  const baseHandling = 480;
  const perKmPerKg = 0.42;
  const subtotal = baseHandling + km * kg * perKmPerKg * 0.001 * 100;
  const gstInclusive = Math.round(subtotal * 1.18);

  let dispatchZone;
  if (km <= 300) dispatchZone = 'Zone A — Eastern Corridor';
  else if (km <= 900) dispatchZone = 'Zone B — Pan-East & Central';
  else if (km <= 1800) dispatchZone = 'Zone C — National Mainline';
  else dispatchZone = 'Zone D — Extended National Reach';

  return {
    transitDays,
    dispatchLeadDays,
    gstInclusiveCost: gstInclusive,
    dispatchZone,
  };
};

const CategoryView = ({
  slug,
  category: passedCategory,
  products: passedProducts,
  tokens,
  navigate,
  inquiry,
  onAddToInquiry,
  onOpenRfq,
  onOpenLightbox,
  getCategoryBenefit,
  handleCalculateFreight: passedCalculateFreight,
}) => {
  const go = typeof navigate === 'function' ? navigate : fallbackNavigate;

  const allProducts = productsData;

  const categories = useMemo(() => {
    const seen = new Map();
    for (const p of allProducts) {
      const s = p?.category_slug;
      if (s && !seen.has(s)) {
        seen.set(s, { slug: s, name: p?.category || s });
      }
    }
    return Array.from(seen.values());
  }, [allProducts]);

  const category = useMemo(
    () => passedCategory || categories.find((c) => c?.slug === slug) || categories[0] || null,
    [passedCategory, categories, slug]
  );

  const products = useMemo(
    () => passedProducts || allProducts.filter((p) => p?.category_slug === category?.slug),
    [passedProducts, allProducts, category]
  );

  const [sortKey, setSortKey] = useState('featured');
  const [searchTerm, setSearchTerm] = useState('');
  const [openFaqIndex, setOpenFaqIndex] = useState(null);

  const [distance, setDistance] = useState('');
  const [weight, setWeight] = useState('');
  const [freightResult, setFreightResult] = useState(null);



  const bannerRef = useRef(null);
  useTilt({ max: 4, perspective: 1400 });

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [slug]);

  useEffect(() => {
    setFreightResult(handleCalculateFreight(distance, weight));
  }, [distance, weight]);

  const visibleProducts = useMemo(() => {
    let list = [...products];
    const q = searchTerm.trim().toLowerCase();
    if (q) {
      list = list.filter((p) => {
        const name = (p?.prodname || p?.name || '').toLowerCase();
        const sku = (p?.sku || p?.id || '').toString().toLowerCase();
        const desc = (p?.description || '').toLowerCase();
        return name.includes(q) || sku.includes(q) || desc.includes(q);
      });
    }
    const priceOf = (p) => {
      const raw = p?.specifications?.wholesale_price || '';
      const num = parseFloat(String(raw).replace(/[^\d.]/g, ''));
      return Number.isFinite(num) ? num : 0;
    };
    switch (sortKey) {
      case 'price-asc':
        list.sort((a, b) => priceOf(a) - priceOf(b));
        break;
      case 'price-desc':
        list.sort((a, b) => priceOf(b) - priceOf(a));
        break;
      case 'newest':
        list.sort((a, b) => (b?.releasedAt || 0) - (a?.releasedAt || 0));
        break;
      default:
        break;
    }
    return list;
  }, [products, searchTerm, sortKey]);

  const placeholderSlots = useMemo(() => {
    const count = visibleProducts.length;
    if (count >= 3 || count === 0) return [];
    const needed = 3 - count;
    return Array.from({ length: needed }).map((_, i) => ({
      id: `placeholder-${i}`,
      label: i === 0 ? 'Standard Factory Slabs' : 'Coming Soon',
      sublabel: i === 0
        ? 'Custom-run SKUs on RFQ confirmation'
        : 'Next manufacturing cycle dispatch',
    }));
  }, [visibleProducts.length]);

  const handleCardPointerMove = useCallback((e) => {
    const card = e.currentTarget;
    const rect = card.getBoundingClientRect();
    card.style.setProperty('--mouse-x', `${e.clientX - rect.left}px`);
    card.style.setProperty('--mouse-y', `${e.clientY - rect.top}px`);
  }, []);

  const handleEstimate = useCallback(
    (e) => {
      e.preventDefault();
      setFreightResult(handleCalculateFreight(distance, weight));
    },
    [distance, weight]
  );

  const faqs = useMemo(
    () => [
      {
        q: 'Which BIS / IS specifications apply to this category?',
        a: 'Every SKU in this category is dispatched IS-compliant. Primary references are IS 280 (mild steel wire), IS 4826 (hot-dip zinc coating), and IS 2629 (recommended practice for HDG). Mill Test Certificates accompany every consignment.',
      },
      {
        q: 'What zinc coating GSM is standard versus premium?',
        a: 'Standard line carries 80–120 GSM zinc. Heavy-duty / coastal grade carries 240–275 GSM zinc-iron alloy metallurgy, delivering up to 11× longer service life in saline humidity.',
      },
      {
        q: 'What are the minimum order quantities (MOQ) for B2B procurement?',
        a: 'MOQ varies per SKU and is typically 1 bundle (≈ 25–50 kg) for retail packs and 500 kg+ for direct-from-factory pricing slabs. Contact RFQ for project-volume slabs.',
      },
      {
        q: 'How is dimensional tolerance validated before dispatch?',
        a: 'Each batch is gauge-checked on calibrated micrometers against IS tolerance class. Sample swatches and gauge readings are attached to the Mill Test Certificate.',
      },
      {
        q: 'Is custom SWG / shade / width available on request?',
        a: 'Yes. Custom SWG, aperture, shade, and roll width are available at production-run MOQ. Engineering drawings are reviewed within 48 hours of RFQ submission.',
      },
    ],
    []
  );

  if (!category) {
    return (
      <section className="category-shell category-shell--empty" data-testid="category-detail-view">
        <div className="category-empty" style={{ textAlign: 'center', padding: '96px 24px' }}>
          <p
            className="category-empty__eyebrow"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              margin: 0,
            }}
          >
            Catalogue
          </p>
          <h1
            className="category-empty__title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 5.5vw, 84px)',
              fontWeight: 500,
              lineHeight: 1.04,
              color: 'var(--text-title, #0A0A0B)',
              margin: '16px 0 32px 0',
            }}
          >
            Category unavailable
          </h1>
          <button
            className="bh-btn bh-btn-ghost"
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
            ← Return to landing
          </button>
        </div>
      </section>
    );
  }

  return (
    <section
      className="category-shell"
      data-testid="category-detail-view"
      data-route="route-category"
      style={{
        maxWidth: 1600,
        width: '100%',
        margin: '0 auto',
        padding: '32px clamp(20px, 4vw, 48px) 96px',
      }}
    >
      {/* ── Breadcrumbs ─────────────────────────────────────────────── */}
      <nav
        className="breadcrumbs"
        aria-label="Breadcrumb"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          marginBottom: 36,
          paddingBottom: 18,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <ol
          className="breadcrumbs__track"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            listStyle: 'none',
            margin: 0,
            padding: 0,
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: '0.06em',
            textTransform: 'uppercase',
          }}
        >
          <li className="breadcrumbs__crumb">
            <a
              href="#/"
              className="breadcrumbs__link"
              onClick={(e) => {
                e.preventDefault();
                go('#/');
              }}
              style={{
                color: 'var(--text-mute)',
                textDecoration: 'none',
                cursor: 'pointer',
              }}
            >
              Home
            </a>
          </li>
          <li className="breadcrumbs__separator" aria-hidden="true" style={{ color: 'var(--text-mute)' }}>
            /
          </li>
          <li
            className="breadcrumbs__crumb breadcrumbs__crumb--current"
            aria-current="page"
            style={{ color: 'var(--accent)' }}
          >
            {category.name}
          </li>
        </ol>
      </nav>

      {/* ── Cinematic Category Banner ───────────────────────────────── */}
      <header
        ref={bannerRef}
        className="category-banner"
        style={{
          background: 'linear-gradient(135deg, var(--accent) 0%, var(--accent-teal, #1B5E3F) 100%)',
          borderRadius: 'var(--radius-xl)',
          padding: '64px 40px',
          color: '#FFFFFF',
          marginBottom: 56,
          boxShadow: '0 8px 32px -8px hsla(151, 56%, 24%, 0.25)',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            position: 'absolute',
            top: '-40%',
            right: '-10%',
            width: 420,
            height: 420,
            borderRadius: '50%',
            background: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />

        <div style={{ position: 'relative', zIndex: 10 }}>
          <p
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.20em',
              textTransform: 'uppercase',
              color: 'rgba(255,255,255,0.85)',
              margin: 0,
            }}
          >
            Verified B2B Division
          </p>
          <h1
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(48px, 5.5vw, 84px)',
              fontWeight: 500,
              lineHeight: 1.02,
              letterSpacing: '-0.015em',
              margin: '16px 0 20px 0',
              color: '#FFFFFF',
            }}
          >
            {category.name}
          </h1>
          <p
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: 'rgba(255,255,255,0.92)',
              fontWeight: 500,
              margin: 0,
              fontStyle: 'italic',
              maxWidth: 720,
            }}
          >
            "IS-compliant B2B solutions engineered for industrial lifetimes."
          </p>
        </div>
      </header>

      {/* ── Filter / Sort / Search Rail ─────────────────────────────── */}
      <div
        className="category-rail"
        style={{
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: 24,
          marginBottom: 40,
          paddingBottom: 20,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <div className="category-rail__search" style={{ flex: 1, maxWidth: 360 }}>
          <input
            type="text"
            className="input input--search"
            placeholder="Search within this category…"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            data-testid="catalog-search-input"
            style={{
              width: '100%',
              padding: '14px 18px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              outline: 'none',
              fontSize: 16,
              fontWeight: 500,
              color: 'var(--text-title, #0A0A0B)',
              background: 'var(--surface-1, #FFFFFF)',
            }}
            aria-label="Search this category"
          />
        </div>
        <div
          className="category-rail__sort"
          style={{ display: 'flex', alignItems: 'center', gap: 12 }}
        >
          <label
            className="category-rail__sort-label"
            htmlFor="sort-select"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              color: 'var(--text-body, #3F3F46)',
            }}
          >
            Sort
          </label>
          <select
            id="sort-select"
            className="select"
            value={sortKey}
            onChange={(e) => setSortKey(e.target.value)}
            style={{
              padding: '12px 18px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md)',
              background: 'var(--surface-1, #FFFFFF)',
              fontSize: 14,
              fontWeight: 700,
              color: 'var(--text-title, #0A0A0B)',
              outline: 'none',
            }}
          >
            <option value="featured">Featured</option>
            <option value="price-asc">Price · Low → High</option>
            <option value="price-desc">Price · High → Low</option>
            <option value="newest">Recently Released</option>
          </select>
        </div>
        <div
          className="category-rail__count"
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 14,
            fontWeight: 900,
            letterSpacing: '0.04em',
            color: 'var(--text-body, #3F3F46)',
          }}
        >
          <span style={{ color: 'var(--accent)' }}>{visibleProducts.length}</span> of{' '}
          <span style={{ color: 'var(--text-title, #0A0A0B)' }}>{products.length}</span> SKUS
        </div>
      </div>

      {/* ── Grid heading ───────────────────────────────────────────── */}
      <header style={{ marginBottom: 32 }}>
        <h2
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'clamp(36px, 4.5vw, 56px)',
            fontWeight: 500,
            lineHeight: 1.05,
            letterSpacing: '-0.01em',
            color: 'var(--text-title, #0A0A0B)',
            margin: 0,
          }}
        >
          Live inventory · ready to dispatch
        </h2>
        <p
          style={{
            fontSize: 18,
            lineHeight: 1.55,
            color: 'var(--text-body, #3F3F46)',
            marginTop: 12,
            marginBottom: 0,
            maxWidth: 760,
          }}
        >
          Every SKU below ships with a Mill Test Certificate and GST tax invoice.
          Tap a card to enter the configurator and lock your spec.
        </p>
      </header>

      {/* ── Product Grid ───────────────────────────────────────────── */}
      <div
        className="product-grid"
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
          gap: 28,
          marginBottom: 72,
        }}
      >
        {visibleProducts.map((product) => {
          const displayName = product.prodname || product.name || 'Untitled SKU';
          const idStr = String(product.id || '');
          const skuTail = idStr.slice(-6) || 'NA';
          return (
            <article
              key={product.id}
              className="product-card bh-card animate-fade-in"
              data-testid={`product-card-${product.id}`}
              onPointerMove={handleCardPointerMove}
              onClick={() => go(`#/product/${product.id}`)}
              role="button"
              tabIndex={0}
              style={{
                padding: 22,
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                cursor: 'pointer',
                background: 'var(--card, #FFFFFF)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: '0 1px 2px rgba(10,10,11,.04), 0 8px 32px -12px rgba(10,10,11,.08)',
              }}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  go(`#/product/${product.id}`);
                }
              }}
            >
              <div
                className="product-card__media"
                style={{
                  height: 200,
                  background: 'var(--surface-2)',
                  border: '1px solid var(--surface-3)',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  display: 'grid',
                  placeItems: 'center',
                  marginBottom: 20,
                }}
              >
                {product.images?.thumbnail ? (
                  <img
                    src={`/${product.images.thumbnail}`}
                    alt={displayName}
                    style={{ width: '90%', height: '90%', objectFit: 'contain' }}
                  />
                ) : (
                  <div
                    className="product-card__media-placeholder"
                    aria-hidden="true"
                    style={{ background: 'var(--surface-3)', width: '100%', height: '100%' }}
                  />
                )}
              </div>
              <div className="product-card__body" style={{ textAlign: 'left' }}>
                <p
                  className="product-card__sku"
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 900,
                    letterSpacing: '0.08em',
                    color: 'var(--text-mute)',
                    textTransform: 'uppercase',
                    margin: '0 0 8px 0',
                  }}
                >
                  SKU-{skuTail}
                </p>
                <h3
                  className="product-card__title"
                  style={{
                    fontFamily: 'var(--font-display)',
                    fontSize: 24,
                    fontWeight: 500,
                    lineHeight: 1.15,
                    color: 'var(--text-title, #0A0A0B)',
                    margin: '0 0 16px 0',
                  }}
                >
                  {displayName}
                </h3>
                <div
                  className="product-card__footer"
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    borderTop: '1px solid var(--surface-2)',
                    paddingTop: 14,
                    gap: 10,
                  }}
                >
                  <span
                    className="product-card__price"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 18,
                      fontWeight: 900,
                      letterSpacing: '0.02em',
                      color: 'var(--accent)',
                    }}
                  >
                    {product.specifications?.wholesale_price || '₹150/piece'}
                  </span>
                  <button
                    type="button"
                    className="bh-btn bh-btn-ghost"
                    data-testid="add-to-inquiry-btn"
                    style={{
                      padding: '8px 16px',
                      fontFamily: 'var(--font-mono)',
                      fontSize: 14,
                      fontWeight: 900,
                      letterSpacing: '0.06em',
                      textTransform: 'uppercase',
                      height: 36,
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--accent)',
                      color: 'var(--accent)',
                      background: 'transparent',
                      cursor: 'pointer',
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (typeof onAddToInquiry === 'function') onAddToInquiry(product);
                    }}
                  >
                    + Inquiry
                  </button>
                </div>
              </div>
            </article>
          );
        })}

        {/* ── Frosted "Coming Soon" placeholder skeleton cards ───── */}
        {placeholderSlots.map((slot) => (
          <article
            key={slot.id}
            className="product-card product-card--placeholder"
            aria-hidden="true"
            style={{
              padding: 22,
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              background: 'linear-gradient(180deg, rgba(255,255,255,0.65) 0%, rgba(244,244,239,0.55) 100%)',
              border: '1px dashed var(--border)',
              borderRadius: 'var(--radius-lg)',
              backdropFilter: 'blur(14px) saturate(1.2)',
              WebkitBackdropFilter: 'blur(14px) saturate(1.2)',
              boxShadow: '0 1px 2px rgba(10,10,11,0.03), 0 8px 32px -16px rgba(10,10,11,0.06)',
              position: 'relative',
              overflow: 'hidden',
              minHeight: 300,
            }}
          >
            <div
              aria-hidden="true"
              style={{
                position: 'absolute',
                inset: 0,
                background:
                  'radial-gradient(circle at 50% 0%, rgba(27,94,63,0.04) 0%, transparent 60%)',
                pointerEvents: 'none',
              }}
            />

            <div
              className="product-card__media product-card__media--skeleton"
              style={{
                height: 200,
                background:
                  'linear-gradient(135deg, var(--surface-2) 0%, var(--surface-1, #FFFFFF) 50%, var(--surface-2) 100%)',
                border: '1px dashed var(--surface-3)',
                borderRadius: 'var(--radius-md)',
                marginBottom: 20,
                display: 'grid',
                placeItems: 'center',
                position: 'relative',
                overflow: 'hidden',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.16em',
                  textTransform: 'uppercase',
                  color: 'var(--accent)',
                  background: 'rgba(255,255,255,0.78)',
                  border: '1px solid var(--border)',
                  borderRadius: 999,
                  padding: '8px 18px',
                  backdropFilter: 'blur(6px)',
                }}
              >
                ✦ {slot.label}
              </span>
            </div>

            <div className="product-card__body" style={{ textAlign: 'left', position: 'relative' }}>
              <p
                className="product-card__sku"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  margin: '0 0 8px 0',
                }}
              >
                SKU-PENDING
              </p>
              <h3
                className="product-card__title"
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 22,
                  fontWeight: 500,
                  lineHeight: 1.2,
                  color: 'var(--text-title, #0A0A0B)',
                  margin: '0 0 8px 0',
                  fontStyle: 'italic',
                  opacity: 0.92,
                }}
              >
                {slot.label}
              </h3>
              <p
                style={{
                  fontSize: 16,
                  lineHeight: 1.5,
                  color: 'var(--text-body, #3F3F46)',
                  margin: '0 0 16px 0',
                }}
              >
                {slot.sublabel}
              </p>
              <div
                className="product-card__footer"
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  borderTop: '1px dashed var(--surface-2)',
                  paddingTop: 14,
                  gap: 10,
                }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-mono)',
                    fontSize: 14,
                    fontWeight: 900,
                    color: 'var(--text-body, #3F3F46)',
                    letterSpacing: '0.04em',
                  }}
                >
                  RFQ · On Request
                </span>
              </div>
            </div>
          </article>

        ))}

        {visibleProducts.length === 0 && (
          <div
            className="product-grid__empty"
            style={{
              gridColumn: '1 / -1',
              textAlign: 'center',
              padding: '64px 0',
              fontSize: 18,
              color: 'var(--text-body, #3F3F46)',
            }}
          >
            <p>No SKUs match your search. Try a broader term.</p>
          </div>
        )}
      </div>

      {/* ── B2B Sourcing Delivery Estimator ─────────────────────────── */}
      <section
        className="freight-card"
        data-testid="freight-calc"
        aria-labelledby="freight-title"
        style={{
          background: 'var(--card, #FFFFFF)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-xl)',
          padding: 40,
          boxShadow: 'var(--shadow-luxe, 0 1px 2px rgba(10,10,11,.04), 0 8px 32px -12px rgba(10,10,11,.08))',
          marginBottom: 72,
        }}
      >
        <header className="freight-card__header" style={{ marginBottom: 28 }}>
          <p
            className="freight-card__eyebrow"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              margin: 0,
            }}
          >
            Logistics Intelligence
          </p>
          <h2
            id="freight-title"
            className="freight-card__title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(32px, 3.6vw, 44px)',
              fontWeight: 500,
              lineHeight: 1.08,
              color: 'var(--text-title, #0A0A0B)',
              margin: '12px 0',
            }}
          >
            B2B Sourcing Delivery Estimator
          </h2>
          <p
            className="freight-card__subtitle"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--text-body, #3F3F46)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Project lead-time days and GST-inclusive dispatch zone pricing
            from our Kolkata factory gates.
          </p>
        </header>

        <form
          className="freight-card__form"
          onSubmit={handleEstimate}
          style={{ display: 'flex', flexWrap: 'wrap', gap: 20, alignItems: 'end' }}
        >
          <div className="freight-card__field" style={{ flex: 1, minWidth: 220 }}>
            <label
              htmlFor="freight-distance"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-body, #3F3F46)',
                marginBottom: 10,
              }}
            >
              Distance to Project Site (KM)
            </label>
            <input
              id="freight-distance"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className="input"
              placeholder="e.g. 650"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-2)',
                outline: 'none',
                fontSize: 16,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--text-title, #0A0A0B)',
              }}
            />
          </div>
          <div className="freight-card__field" style={{ flex: 1, minWidth: 220 }}>
            <label
              htmlFor="freight-weight"
              style={{
                display: 'block',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 900,
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
                color: 'var(--text-body, #3F3F46)',
                marginBottom: 10,
              }}
            >
              Consignment Load Weight (KG)
            </label>
            <input
              id="freight-weight"
              type="number"
              min="0"
              step="1"
              inputMode="numeric"
              className="input"
              placeholder="e.g. 1200"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
              style={{
                width: '100%',
                padding: '14px 18px',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-md)',
                background: 'var(--surface-2)',
                outline: 'none',
                fontSize: 16,
                fontFamily: 'var(--font-mono)',
                fontWeight: 700,
                color: 'var(--text-title, #0A0A0B)',
              }}
            />
          </div>
          <div className="freight-card__action" style={{ flex: 1, minWidth: 220 }}>
            <button
              type="submit"
              className="bh-btn bh-btn-primary"
              style={{
                width: '100%',
                height: 52,
                justifyContent: 'center',
                fontFamily: 'var(--font-mono)',
                fontSize: 14,
                fontWeight: 900,
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                background: 'var(--accent)',
                color: '#FFFFFF',
                border: 0,
                borderRadius: 'var(--radius-md)',
                cursor: 'pointer',
              }}
            >
              Calculate Lead-Time
            </button>
          </div>
        </form>

        {freightResult && (
          <div
            className="freight-card__result animate-fade-in"
            role="status"
            aria-live="polite"
            style={{
              marginTop: 28,
              padding: 24,
              background: 'var(--accent-glow, #E8F2EC)',
              borderRadius: 'var(--radius-lg)',
              display: 'flex',
              flexWrap: 'wrap',
              gap: 32,
              border: '1px solid hsla(151, 56%, 24%, 0.14)',
            }}
          >
            <div className="freight-card__result-item">
              <p
                className="freight-card__result-label"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  margin: '0 0 6px 0',
                }}
              >
                Estimated Transit Days
              </p>
              <p
                className="freight-card__result-value"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 26,
                  fontWeight: 900,
                  color: 'var(--text-title, #0A0A0B)',
                  margin: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {freightResult.transitDays} {freightResult.transitDays === 1 ? 'day' : 'days'}
              </p>
            </div>
            <div className="freight-card__result-item">
              <p
                className="freight-card__result-label"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  margin: '0 0 6px 0',
                }}
              >
                Kolkata Factory Dispatch Lead Time
              </p>
              <p
                className="freight-card__result-value"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 26,
                  fontWeight: 900,
                  color: 'var(--text-title, #0A0A0B)',
                  margin: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                {freightResult.dispatchLeadDays}{' '}
                {freightResult.dispatchLeadDays === 1 ? 'working day' : 'working days'}
              </p>
            </div>
            <div className="freight-card__result-item">
              <p
                className="freight-card__result-label"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.08em',
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                  margin: '0 0 6px 0',
                }}
              >
                B2B GST-Inclusive Logistics Cost
              </p>
              <p
                className="freight-card__result-value"
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 26,
                  fontWeight: 900,
                  color: 'var(--accent)',
                  margin: 0,
                  fontVariantNumeric: 'tabular-nums',
                }}
              >
                ₹{freightResult.gstInclusiveCost.toLocaleString('en-IN')}
              </p>
            </div>
            <div
              className="freight-card__result-zone"
              style={{ display: 'flex', alignItems: 'center', marginLeft: 'auto' }}
            >
              <span
                style={{
                  display: 'inline-block',
                  background: 'hsl(33, 45%, 94%)',
                  color: 'hsl(33, 39%, 44%)',
                  padding: '10px 18px',
                  borderRadius: 999,
                  fontFamily: 'var(--font-mono)',
                  fontSize: 14,
                  fontWeight: 900,
                  letterSpacing: '0.06em',
                  textTransform: 'uppercase',
                }}
              >
                {freightResult.dispatchZone}
              </span>
            </div>
          </div>
        )}
      </section>

      {/* ── Technical Safeguards FAQ ────────────────────────────────── */}
      <section
        className="faq-section"
        aria-labelledby="faq-title"
        style={{ borderTop: '1px solid var(--border)', paddingTop: 56 }}
      >
        <header className="faq-section__header" style={{ marginBottom: 36 }}>
          <p
            className="faq-section__eyebrow"
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 14,
              fontWeight: 900,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--accent)',
              margin: 0,
            }}
          >
            Technical Safeguards
          </p>
          <h2
            id="faq-title"
            className="faq-section__title"
            style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(36px, 4.5vw, 56px)',
              fontWeight: 500,
              lineHeight: 1.05,
              letterSpacing: '-0.01em',
              color: 'var(--text-title, #0A0A0B)',
              margin: '12px 0',
            }}
          >
            Category Specifications · FAQ
          </h2>
          <p
            className="faq-section__subtitle"
            style={{
              fontSize: 18,
              lineHeight: 1.55,
              color: 'var(--text-body, #3F3F46)',
              margin: 0,
              maxWidth: 720,
            }}
          >
            Compliance, tolerance, MOQ and metallurgy answered upfront.
          </p>
        </header>

        <ul
          className="faq-list"
          style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 16,
            listStyle: 'none',
            margin: 0,
            padding: 0,
          }}
        >
          {faqs.map((faq, idx) => {
            const open = openFaqIndex === idx;
            return (
              <li
                key={idx}
                className={`faq-item ${open ? 'faq-item--open' : ''}`}
                style={{
                  background: 'var(--card, #FFFFFF)',
                  border: `1px solid ${open ? 'var(--accent)' : 'var(--border)'}`,
                  borderRadius: 'var(--radius-lg)',
                  overflow: 'hidden',
                  boxShadow: open
                    ? '0 1px 2px rgba(10,10,11,.04), 0 8px 32px -12px rgba(10,10,11,.10)'
                    : 'none',
                }}
              >
                <button
                  type="button"
                  className="faq-item__trigger"
                  aria-expanded={open}
                  aria-controls={`faq-panel-${idx}`}
                  onClick={() => setOpenFaqIndex(open ? null : idx)}
                  style={{
                    width: '100%',
                    padding: '24px 28px',
                    background: 'transparent',
                    border: 0,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    textAlign: 'left',
                    cursor: 'pointer',
                    gap: 16,
                  }}
                >
                  <span
                    className="faq-item__q"
                    style={{
                      flex: 1,
                      fontFamily: 'var(--font-display)',
                      fontSize: 20,
                      fontWeight: 500,
                      lineHeight: 1.3,
                      color: open ? 'var(--accent)' : 'var(--text-title, #0A0A0B)',
                    }}
                  >
                    {faq.q}
                  </span>
                  <span
                    className="faq-item__chevron"
                    style={{
                      fontFamily: 'var(--font-mono)',
                      fontSize: 20,
                      fontWeight: 900,
                      color: 'var(--accent)',
                      transform: open ? 'rotate(180deg)' : 'rotate(0deg)',
                      transition: 'transform 0.3s',
                    }}
                  >
                    {open ? '−' : '+'}
                  </span>
                </button>
                {open && (
                  <div
                    id={`faq-panel-${idx}`}
                    className="faq-item__panel"
                    role="region"
                    style={{ padding: '0 28px 24px 28px', borderTop: '1px solid var(--surface-2)' }}
                  >
                    <p
                      style={{
                        fontSize: 16,
                        color: 'var(--text-body, #3F3F46)',
                        lineHeight: 1.65,
                        margin: '16px 0 0 0',
                      }}
                    >
                      {faq.a}
                    </p>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      </section>
    </section>
  );
};

export default CategoryView;

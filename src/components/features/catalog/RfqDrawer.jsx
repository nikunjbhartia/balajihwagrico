import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';

/**
 * RfqDrawer — macOS-style slide-over B2B inquiry drawer
 *
 * Props (contract-locked, do not rename):
 *   open                  : boolean
 *   onClose               : () => void
 *   inquiry               : Array<{ id, name, sku, image, swg, width, shade,
 *                                   tierPrice, qty, moq, unit, hsn }>
 *   onRemoveFromInquiry   : (productId) => void
 *   onClearInquiry        : () => void
 *   onGSTINSubmit         : (gstin) => void
 *   tokens                : optional design-token overrides (consumed via CSS vars)
 *
 * Strict Indian corporate GSTIN format (15 chars):
 *   2 digit state code | 5 alpha PAN | 4 digit PAN | 1 alpha PAN |
 *   1 entity char | literal 'Z' | 1 alnum checksum
 */

const GSTIN_REGEX = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;

const INR = (n) =>
  typeof n === 'number'
    ? '₹' + n.toLocaleString('en-IN', { maximumFractionDigits: 0 })
    : '—';

const RfqDrawer = ({
  open = false,
  onClose = () => {},
  inquiry = [],
  onRemoveFromInquiry = () => {},
  onClearInquiry = () => {},
  onGSTINSubmit = () => {},
  tokens = null,
}) => {
  const [gstin, setGstin] = useState('');
  const [touched, setTouched] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [verified, setVerified] = useState(false);
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [contactPhone, setContactPhone] = useState('');
  const [deliveryPincode, setDeliveryPincode] = useState('');
  const [notes, setNotes] = useState('');

  const panelRef = useRef(null);
  const firstFieldRef = useRef(null);

  // ── Derived: validation state ────────────────────────────────────────────
  const gstinValid = useMemo(() => GSTIN_REGEX.test(gstin), [gstin]);
  const showGstinError = touched && gstin.length > 0 && !gstinValid;
  const formReady =
    gstinValid &&
    companyName.trim().length >= 2 &&
    contactName.trim().length >= 2 &&
    /^[6-9]\d{9}$/.test(contactPhone) &&
    /^\d{6}$/.test(deliveryPincode) &&
    inquiry.length > 0;

  // ── Totals ───────────────────────────────────────────────────────────────
  const totals = useMemo(() => {
    let lineCount = 0;
    let units = 0;
    let subtotal = 0;
    inquiry.forEach((it) => {
      const qty = Number(it?.qty) || Number(it?.moq) || 10;
      const price = 3500;
      lineCount += 1;
      units += qty;
      subtotal += qty * price;
    });
    const gst = Math.round(subtotal * 0.18);
    return { lineCount, units, subtotal, gst, grand: subtotal + gst };
  }, [inquiry]);

  // ── ESC to close + focus management ──────────────────────────────────────
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    
    const t = setTimeout(() => {
      firstFieldRef.current && firstFieldRef.current.focus();
    }, 320);
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prevOverflow;
      clearTimeout(t);
    };
  }, [open, onClose]);

  useEffect(() => {
    if (open) {
      setVerified(false);
      setSubmitting(false);
    }
  }, [open]);

  const handleGstinChange = useCallback((e) => {
    const raw = e.target.value || '';
    const cleaned = raw.toUpperCase().replace(/[^0-9A-Z]/g, '').slice(0, 15);
    setGstin(cleaned);
    if (!touched) setTouched(true);
  }, [touched]);

  const handleSubmit = useCallback(
    async (e) => {
      e.preventDefault();
      if (submitting) return;
      setTouched(true);

      if (!formReady) {
        if (!gstinValid) {
          alert("Please enter a valid 15-character corporate GSTIN.");
          firstFieldRef.current?.focus();
          return;
        }
        if (companyName.trim().length < 2) {
          alert("Please enter a valid company name.");
          return;
        }
        if (contactName.trim().length < 2) {
          alert("Please enter your contact name.");
          return;
        }
        if (!/^[6-9]\d{9}$/.test(contactPhone)) {
          alert("Please enter a valid 10-digit contact phone number.");
          return;
        }
        if (!/^\d{6}$/.test(deliveryPincode)) {
          alert("Please enter a valid 6-digit delivery pincode.");
          return;
        }
        if (inquiry.length === 0) {
          alert("Your inquiry basket is empty!");
          return;
        }
        return;
      }

      setSubmitting(true);

      const payload = {
        gstin,
        companyName,
        contactName,
        contactPhone,
        deliveryPincode,
        notes,
        inquiry,
        totals,
      };

      try {
        // Vite loads custom environment variables prefixed with VITE_
        const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;

        if (endpoint && !endpoint.includes("placeholder")) {
          // Submit to Google Sheets via Apps Script Web App
          await fetch(endpoint, {
            method: 'POST',
            mode: 'no-cors', // Bypasses redirect CORS preflights commonly returned by Google Script redirects
            headers: {
              'Content-Type': 'text/plain',
            },
            body: JSON.stringify(payload),
          });
        } else {
          // Fallback to local simulation in development mode
          console.log("Development Mode: Form submitted successfully. Payload:", payload);
          await new Promise((resolve) => window.setTimeout(resolve, 800));
        }

        try {
          onGSTINSubmit(gstin);
        } catch (_) {}

        setSubmitting(false);
        setVerified(true);

        window.setTimeout(() => {
          onClearInquiry();
        }, 1500);

        window.setTimeout(() => {
          setGstin('');
          setTouched(false);
          setCompanyName('');
          setContactName('');
          setContactPhone('');
          setDeliveryPincode('');
          setNotes('');
          setVerified(false);
          onClose();
        }, 2600);

      } catch (error) {
        console.error("Error submitting B2B Inquiry:", error);
        alert("There was a connection error while submitting your inquiry. Please check your internet connection and try again.");
        setSubmitting(false);
      }
    },
    [
      formReady,
      submitting,
      gstin,
      companyName,
      contactName,
      contactPhone,
      deliveryPincode,
      notes,
      inquiry,
      totals,
      onGSTINSubmit,
      onClearInquiry,
      onClose,
      gstinValid,
    ]
  );

  const handleWhatsAppSubmit = useCallback(
    (e) => {
      if (e) e.preventDefault();
      if (submitting) return;
      setTouched(true);

      if (!formReady) {
        if (!gstinValid) {
          alert("Please enter a valid 15-character corporate GSTIN.");
          firstFieldRef.current?.focus();
          return;
        }
        if (companyName.trim().length < 2) {
          alert("Please enter a valid company name.");
          return;
        }
        if (contactName.trim().length < 2) {
          alert("Please enter your contact name.");
          return;
        }
        if (!/^[6-9]\d{9}$/.test(contactPhone)) {
          alert("Please enter a valid 10-digit contact phone number.");
          return;
        }
        if (!/^\d{6}$/.test(deliveryPincode)) {
          alert("Please enter a valid 6-digit delivery pincode.");
          return;
        }
        if (inquiry.length === 0) {
          alert("Your inquiry basket is empty!");
          return;
        }
        return;
      }

      setSubmitting(true);

      const payload = {
        gstin,
        companyName,
        contactName,
        contactPhone,
        deliveryPincode,
        notes,
        inquiry,
        totals,
      };

      // 1. Construct formatted WhatsApp B2B inquiry message
      const number = "918100448052";
      
      let itemLines = "";
      inquiry.forEach((item, idx) => {
        const specText = item.specifications 
          ? `brand: ${item.specifications.brand || 'Balaji'}, price: ${item.specifications.wholesale_price || 'RFQ'}`
          : 'Standard specs';
        itemLines += `${idx + 1}. *${item.prodname || item.name}* (ID: ${item.id})\n   Specs: ${specText}\n`;
      });

      const text = `*BALAJI HARDWARE & AGRICO — B2B Inquiry*\n\n` +
        `*Company:* ${companyName}\n` +
        `*GSTIN:* ${gstin}\n` +
        `*Contact:* ${contactName}\n` +
        `*Phone:* ${contactPhone}\n` +
        `*Delivery Pincode:* ${deliveryPincode}\n` +
        `*Notes:* ${notes || 'None'}\n\n` +
        `*Items Requested:*\n${itemLines}\n` +
        `*Total Line Items:* ${totals.lineCount}\n\n` +
        `Please send us the B2B proforma invoice with verified 18% GST tax and freight estimation.`;

      const encodedText = encodeURIComponent(text);
      const waUrl = `https://api.whatsapp.com/send?phone=${number}&text=${encodedText}`;

      // IMPORTANT: Open WhatsApp synchronously inside direct click gesture context!
      // This bypasses modern browser popup blockers completely.
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      // 2. Submit to Google Sheets in background (non-blocking async task)
      const endpoint = import.meta.env.VITE_GOOGLE_SHEETS_URL;
      if (endpoint && !endpoint.includes("placeholder")) {
        fetch(endpoint, {
          method: 'POST',
          mode: 'no-cors',
          headers: {
            'Content-Type': 'text/plain',
          },
          body: JSON.stringify(payload),
        }).catch((err) => console.error("Background Sheets Save Error:", err));
      }

      // Show success view
      setSubmitting(false);
      setVerified(true);

      window.setTimeout(() => {
        onClearInquiry();
      }, 1500);

      window.setTimeout(() => {
        setGstin('');
        setTouched(false);
        setCompanyName('');
        setContactName('');
        setContactPhone('');
        setDeliveryPincode('');
        setNotes('');
        setVerified(false);
        onClose();
      }, 2600);
    },
    [
      formReady,
      submitting,
      gstin,
      companyName,
      contactName,
      contactPhone,
      deliveryPincode,
      notes,
      inquiry,
      totals,
      onClearInquiry,
      onClose,
      gstinValid,
    ]
  );

  const tokenStyle = tokens && typeof tokens === 'object' ? tokens : undefined;

  return (
    <div
      className={`rfq-drawer-root ${open ? 'is-open' : ''}`}
      data-testid="rfq-drawer"
      aria-hidden={!open}
      style={tokenStyle}
    >
      <button
        type="button"
        className="rfq-drawer-scrim"
        aria-label="Close inquiry drawer"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <aside
        ref={panelRef}
        className="rfq-drawer-panel"
        role="dialog"
        aria-modal="true"
        aria-labelledby="rfq-drawer-title"
      >
        <header className="rfq-drawer-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '16px 24px 20px 24px', borderBottom: '1px solid var(--border-soft)', position: 'relative' }}>
          <div className="rfq-drawer-titleblock">
            <p className="rfq-drawer-eyebrow" style={{ margin: 0, color: 'var(--accent)' }}>B2B Proforma · Wholesale Inquiry</p>
            <h2 id="rfq-drawer-title" className="rfq-drawer-title" style={{ margin: '4px 0 0 0' }}>
              Request for Quotation
            </h2>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
            <div className="rfq-drawer-count" aria-live="polite" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 2 }}>
              <span className="rfq-count-num" style={{ fontSize: 16, fontWeight: 900 }}>{totals.lineCount}</span>
              <span className="rfq-count-lbl" style={{ fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-mute)' }}>
                {totals.lineCount === 1 ? 'item' : 'items'}
              </span>
            </div>
            <button
              type="button"
              className="rfq-close-btn"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              aria-label="Close inquiry drawer"
              style={{
                background: 'var(--surface-2, #F4F4F0)',
                border: 'none',
                width: 36,
                height: 36,
                borderRadius: '50%',
                display: 'grid',
                placeItems: 'center',
                fontSize: 16,
                color: 'var(--text-body)',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
            >
              ✕
            </button>
          </div>
        </header>

        <div className="rfq-drawer-body">
          <section className="rfq-section" aria-labelledby="rfq-basket-h">
            <div className="rfq-section-head">
              <h3 id="rfq-basket-h" className="rfq-section-title">
                Inquiry Basket
              </h3>
              {inquiry.length > 0 && (
                <button
                  type="button"
                  className="rfq-link-btn"
                  onClick={onClearInquiry}
                >
                  Clear all
                </button>
              )}
            </div>

            {inquiry.length === 0 ? (
              <div className="rfq-empty">
                <div className="rfq-empty-mark" aria-hidden="true">
                  <svg viewBox="0 0 64 64" width="48" height="48">
                    <circle cx="32" cy="32" r="28" fill="none" stroke="currentColor" strokeWidth="1.25" opacity="0.35" />
                    <path d="M20 28h24l-3 18H23z" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" />
                    <path d="M26 28v-4a6 6 0 0 1 12 0v4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  </svg>
                </div>
                <p className="rfq-empty-title">Your inquiry basket is empty</p>
                <p className="rfq-empty-sub">
                  Add SKUs from the catalogue to request a wholesale proforma.
                </p>
              </div>
            ) : (
              <ul className="rfq-basket-list">
                {inquiry.map((item) => {
                  const qty = Number(item?.qty) || Number(item?.moq) || 10;
                  const price = 3500;
                  const line = qty * price;
                  return (
                    <li className="rfq-basket-item" key={item.id}>
                      <div className="rfq-basket-thumb" aria-hidden="true">
                        {item.images?.thumbnail ? (
                          <img src={`/${item.images.thumbnail}`} alt="" loading="lazy" decoding="async" />
                        ) : (
                          <div className="rfq-basket-thumb-fallback" />
                        )}
                      </div>

                      <div className="rfq-basket-meta">
                        <div className="rfq-basket-name">
                          {item.prodname || item.name || 'Unnamed SKU'}
                        </div>
                        <div className="rfq-basket-sku">
                          <span className="rfq-mono">SKU-{item.id.slice(-6)}</span>
                        </div>

                        <div className="rfq-basket-specs">
                          {item.selectedSwg ? (
                            <span className="rfq-chip" data-testid="swg-selector">
                              SWG {item.selectedSwg}
                            </span>
                          ) : null}
                          {item.selectedWidth ? (
                            <span className="rfq-chip" data-testid="width-selector">
                              {item.selectedWidth}
                            </span>
                          ) : null}
                          {item.selectedShade ? (
                            <span className="rfq-chip rfq-chip--shade" data-testid="shade-selector">
                              {item.selectedShade}%
                            </span>
                          ) : null}
                        </div>

                        <div className="rfq-basket-pricing">
                          <span className="rfq-tier-label">Tier price</span>
                          <span className="rfq-tier-price rfq-mono">
                            {INR(price)}
                            <span className="rfq-unit"> / Pcs</span>
                          </span>
                          <span className="rfq-tier-sep">·</span>
                          <span className="rfq-tier-qty">
                            Qty <strong>{qty.toLocaleString('en-IN')}</strong>
                          </span>
                        </div>
                      </div>

                      <div className="rfq-basket-right">
                        <div className="rfq-line-total rfq-mono">
                          {INR(line)}
                        </div>
                        <button
                          type="button"
                          className="rfq-remove-btn"
                          onClick={() => onRemoveFromInquiry(item.id)}
                        >
                          Remove
                        </button>
                      </div>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          {inquiry.length > 0 && (
            <section className="rfq-section rfq-section--totals">
              <dl className="rfq-totals">
                <div className="rfq-totals-row">
                  <dt>Total units</dt>
                  <dd className="rfq-mono">
                    {totals.units.toLocaleString('en-IN')}
                  </dd>
                </div>
                <div className="rfq-totals-row">
                  <dt>Subtotal</dt>
                  <dd className="rfq-mono">{INR(totals.subtotal)}</dd>
                </div>
                <div className="rfq-totals-row">
                  <dt>GST @ 18%</dt>
                  <dd className="rfq-mono">{INR(totals.gst)}</dd>
                </div>
                <div className="rfq-totals-row rfq-totals-row--grand">
                  <dt>Estimated total</dt>
                  <dd className="rfq-mono">{INR(totals.grand)}</dd>
                </div>
              </dl>
            </section>
          )}

          {inquiry.length > 0 && (
            <section className="rfq-section" aria-labelledby="rfq-verify-h">
              <div className="rfq-section-head">
                <h3 id="rfq-verify-h" className="rfq-section-title">
                  Corporate Verification
                </h3>
                <span className="rfq-badge-gold" style={{ background: 'var(--gold-soft)', color: 'var(--gold)', padding: '2px 8px', borderRadius: 9, fontSize: 10, fontWeight: 'bold' }}>B2B only</span>
              </div>

              <form className="rfq-form" onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 16 }}>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-body)' }}>
                    GSTIN (15-char format)
                  </span>
                  <input
                    ref={firstFieldRef}
                    type="text"
                    spellCheck="false"
                    className={`rfq-input rfq-input--mono ${showGstinError ? 'is-invalid' : ''}`}
                    data-testid="gstin-input"
                    placeholder="22AAAAA0000A1Z5"
                    value={gstin}
                    onChange={handleGstinChange}
                    onBlur={() => setTouched(true)}
                    maxLength={15}
                    style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: 13, fontFamily: 'var(--font-mono)', textTransform: 'uppercase' }}
                  />
                  {showGstinError && (
                    <span style={{ fontSize: 10, color: 'var(--danger)', fontWeight: 'bold', marginTop: 4 }}>
                      Invalid GSTIN.
                    </span>
                  )}
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-body)' }}>Company name</span>
                    <input
                      type="text"
                      required
                      placeholder="Legal entity name"
                      value={companyName}
                      onChange={e => setCompanyName(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-body)' }}>Contact name</span>
                    <input
                      type="text"
                      required
                      placeholder="Full name"
                      value={contactName}
                      onChange={e => setContactName(e.target.value)}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: 13 }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-body)' }}>Contact phone</span>
                    <input
                      type="text"
                      required
                      placeholder="10-digit mobile"
                      value={contactPhone}
                      onChange={e => setContactPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    <span style={{ fontSize: 11, fontWeight: 'bold', textTransform: 'uppercase', color: 'var(--text-body)' }}>Delivery pincode</span>
                    <input
                      type="text"
                      required
                      placeholder="6-digit PIN"
                      value={deliveryPincode}
                      onChange={e => setDeliveryPincode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      style={{ width: '100%', padding: '12px 16px', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', outline: 'none', fontSize: 13, fontFamily: 'var(--font-mono)' }}
                    />
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginTop: 12 }}>
                  <button
                    type="submit"
                    className="bh-btn bh-btn-primary"
                    disabled={submitting}
                    style={{ width: '100%', justifyContent: 'center', height: 48, textTransform: 'uppercase', letterSpacing: '0.04em', fontSize: 13, borderRadius: 'var(--radius-md)' }}
                  >
                    {submitting ? 'Verifying…' : 'Submit RFQ Inquiry'}
                  </button>
                  <button
                    type="button"
                    className="bh-btn"
                    disabled={submitting}
                    onClick={handleWhatsAppSubmit}
                    style={{
                      width: '100%',
                      justifyContent: 'center',
                      height: 48,
                      textTransform: 'uppercase',
                      letterSpacing: '0.04em',
                      fontSize: 13,
                      borderRadius: 'var(--radius-md)',
                      background: '#25D366',
                      color: '#ffffff',
                      border: 'none',
                      fontWeight: 900,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: 8,
                      cursor: submitting ? 'not-allowed' : 'pointer',
                      boxShadow: '0 4px 12px rgba(37, 211, 102, 0.25)',
                      opacity: submitting ? 0.7 : 1
                    }}
                  >
                    {submitting ? '⏳ Preparing Inquiry...' : '💬 Inquire via WhatsApp'}
                  </button>
                </div>
              </form>
            </section>
          )}
        </div>

        {verified && (
          <div className="rfq-success" style={{ position: 'absolute', inset: 0, background: 'rgba(255,255,255,0.95)', zIndex: 40, display: 'grid', placeItems: 'center', padding: 32 }}>
            <div style={{ textAlign: 'center' }} className="space-y-4">
              <div style={{ width: 56, height: 56, background: 'var(--accent)', color: '#FFF', borderRadius: '50%', display: 'grid', placeItems: 'center', margin: '0 auto', fontSize: 22 }}>✓</div>
              <p className="font-serif" style={{ fontSize: 20, color: 'var(--text-title)', margin: 0 }}>Inquiry verified</p>
              <p style={{ fontSize: 13, color: 'var(--text-mute)', margin: 0, lineHeight: 1.5 }}>
                Your wholesale proforma inquiry has been queued successfully. We will contact you soon!
              </p>
            </div>
          </div>
        )}
      </aside>
    </div>
  );
};

export default RfqDrawer;

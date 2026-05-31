import React, { useEffect, useRef, useState, useMemo } from 'react';
import { X } from 'lucide-react';

const Lightbox = ({
  open = false,
  onClose = () => {},
  src = null,
  title = 'High Resolution Zoom'
}) => {
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    if (open) {
      setZoom(false);
    }
  }, [open]);

  // ESC key listener
  useEffect(() => {
    if (!open) return;
    const onKey = (e) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);

  if (!open || !src) return null;

  return (
    <div
      data-testid="lightbox"
      className="animate-fade-in"
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: 'rgba(10, 10, 11, 0.96)',
        backdropFilter: 'blur(12px)',
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        padding: 24
      }}
      onClick={onClose}
    >
      <button
        onClick={onClose}
        style={{
          position: 'absolute', top: 24, right: 24,
          background: 'rgba(255,255,255,0.1)', border: '1px solid rgba(255,255,255,0.1)',
          color: '#FFFFFF', cursor: 'pointer', borderRadius: '50%', width: 40, height: 40,
          display: 'grid', placeItems: 'center', transition: 'background 0.2s', zIndex: 210
        }}
      >
        <X size={18} />
      </button>

      <div
        style={{ maxWidth: '90%', maxHeight: '80vh', overflow: 'hidden', borderRadius: 'var(--radius-lg)', boxShadow: '0 24px 64px -16px rgba(0,0,0,0.5)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <img
          src={src.startsWith('http') ? src : `/${src}`}
          alt={title}
          style={{
            maxWidth: '100%', maxHeight: '80vh', objectFit: 'contain', display: 'block',
            transform: zoom ? 'scale(2)' : 'scale(1)',
            cursor: zoom ? 'zoom-out' : 'zoom-in',
            transition: 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1)'
          }}
          onClick={() => setZoom(z => !z)}
          onError={(e) => {
            e.target.src = 'https://5.imimg.com/data5/SELLER/Default/2026/1/product-jpeg-250x250.jpg';
          }}
        />
      </div>
    </div>
  );
};

export default Lightbox;

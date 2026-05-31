import React, { useState } from 'react';
import { TOKENS as T } from '../../../data/tokens.js';
import { ArrowUpRight, Shield } from 'lucide-react';

export default function ProductCard({ product, onAddToInquiry }) {
  const [hover, setHover] = useState(false);

  const specs = product.specifications || {};
  const wholesalePrice = specs.wholesale_price || '₹150/piece';
  const moq = specs.minimum_order_qty || '100 Pcs';

  // Dynamic mouse perspective tilt vectors
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e) => {
    const el = e.currentTarget;
    const rect = el.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const xc = rect.width / 2;
    const yc = rect.height / 2;
    const rotX = (yc - y) / 10; // max 10 deg
    const rotY = (x - xc) / 10;
    setTilt({ x: rotX, y: rotY });
  };

  const handleMouseLeave = () => {
    setHover(false);
    setTilt({ x: 0, y: 0 });
  };

  return (
    <div
      data-testid={`product-card-${product.id}`}
      onMouseEnter={() => setHover(true)}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className="bh-card"
      style={{
        padding: 20,
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%',
        minHeight: 380,
        position: 'relative',
        overflow: 'hidden',
        transform: hover 
          ? `perspective(1000px) translate3d(0, -4px, 8px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)` 
          : 'perspective(1000px) translate3d(0,0,0) rotateX(0deg) rotateY(0deg)',
        boxShadow: hover ? T.shadowLg : T.shadowSm,
        borderColor: hover ? T.accent + '44' : T.ink300,
        transition: 'transform 0.35s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.35s, border-color 0.35s',
      }}
    >
      {/* Mono SKU & Sector banner */}
      <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center', marginBottom: 14 }} className="justify-between">
        <span className="bh-mono text-[10px] font-bold text-slate-400 uppercase tracking-wider">
          SKU-{product.id.slice(-6)}
        </span>
        <span style={{
          display: 'inline-flex', alignItems: 'center', gap: 4,
          fontSize: 9, fontWeight: 'bold', textTransform: 'uppercase',
          color: T.accent, background: T.accentSoft,
          padding: '3px 8px', borderRadius: T.r8
        }}>
          <Shield size={10} /> IS-Compliant
        </span>
      </div>

      {/* Center centerpiece image stage */}
      <div
        style={{
          flex: 1, height: 180, borderRadius: T.r12,
          background: T.surface2, border: `1px solid ${T.surface3}`,
          display: 'flex', alignItems: 'center', justify: 'center',
          overflow: 'hidden', marginBottom: 16, position: 'relative'
        }}
      >
        <img
          src={product.images?.thumbnail ? `/${product.images.thumbnail}` : product.original_image}
          alt={product.prodname || product.name}
          style={{
            width: '90%', height: '90%', objectFit: 'contain',
            transform: hover ? 'scale(1.05)' : 'scale(1)',
            transition: 'transform 0.4s ease'
          }}
          onError={(e) => {
            e.target.src = product.original_image || 'https://5.imimg.com/data5/SELLER/Default/2026/1/product-jpeg-250x250.jpg';
          }}
        />
      </div>

      {/* Details */}
      <div style={{ textAlign: 'left', spaceY: 6 }} className="space-y-1.5">
        <h4 style={{
          fontFamily: T.fontSans, fontSize: 16, fontWeight: 'bold',
          color: T.ink900, margin: 0, display: 'flex', alignItems: 'center', gap: 6,
          lineHeight: 1.25
        }}>
          <span style={{ flex: 1 }} className="group-hover:text-accent transition-colors duration-300">
            {product.prodname || product.name}
          </span>
          <ArrowUpRight size={14} style={{ opacity: hover ? 1 : 0.4, transform: hover ? 'translate(1px, -1px)' : 'none', transition: 'all 0.3s' }} />
        </h4>
        
        <span style={{ fontSize: 11, color: T.ink500, display: 'block', italic: true }}>
          {product.category || 'Multi-Sector Solutions'}
        </span>

        {/* B2B Price & MOQ Footer */}
        <div style={{
          display: 'flex', justifyBetween: 'space-between', alignItems: 'center',
          borderTop: `1px solid ${T.surface2}`, paddingTop: 12, marginTop: 12
        }} className="justify-between">
          <div>
            <span style={{ display: 'block', fontSize: 9, color: T.ink500, textTransform: 'uppercase', fontWeight: 'bold' }}>Wholesale Base</span>
            <span className="bh-mono" style={{ fontSize: 14, fontWeight: 'black', color: T.accent }}>{wholesalePrice}</span>
          </div>
          <div style={{ textAlign: 'right' }}>
            <span style={{ display: 'block', fontSize: 9, color: T.ink500, textTransform: 'uppercase', fontWeight: 'bold' }}>MOQ Target</span>
            <span className="bh-mono" style={{ fontSize: 12, fontWeight: 'bold', color: T.ink700 }}>{moq}</span>
          </div>
        </div>

      </div>

    </div>
  );
}

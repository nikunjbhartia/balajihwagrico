import React from 'react';
import Wordmark from '../brand/Wordmark.jsx';
import { useLanguage } from '../context/LanguageContext.jsx';
import { navigate } from '../router/navigate.js';
import { ShoppingCart, Sparkles, Calculator, Store } from 'lucide-react';
import { TOKENS as T } from '../data/tokens.js';

export default function ShellHeader({ 
  inquiryCount = 0, 
  onOpenRfq, 
  onOpenAssistant, 
  activeView = 'landing' 
}) {
  const { language, setLanguage, t } = useLanguage();

  const handleLanguageToggle = () => {
    if (language === 'en') setLanguage('hi');
    else if (language === 'hi') setLanguage('bn');
    else setLanguage('en');
  };

  return (
    <header 
      style={{
        position: 'sticky', 
        top: 0, 
        zIndex: 50,
        backdropFilter: 'saturate(180%) blur(20px)',
        background: 'rgba(250, 250, 247, 0.82)',
        borderBottom: '1px solid hsl(240, 5%, 91%)',
        boxShadow: '0 1px 2px rgba(10, 10, 11, 0.02)'
      }}
    >
      <div 
        style={{ 
          maxWidth: 1240, 
          margin: '0 auto', 
          padding: '14px 24px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 24 
        }}
      >
        
        {/* LEFT: Typographic Brandmark */}
        <button 
          onClick={() => navigate('#/')} 
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', outline: 'none' }}
        >
          <Wordmark height={34} />
        </button>

        {/* CENTER: Clean Spacious Navigation Links */}
        <nav style={{ display: 'none', gap: 8 }} className="md:flex">
          <button 
            onClick={() => navigate('#/')}
            className="bh-btn bh-btn-ghost"
            style={{
              padding: '8px 16px',
              fontSize: 13,
              borderColor: activeView === 'landing' ? 'hsl(240, 6%, 5%)' : 'transparent',
              background: activeView === 'landing' ? '#FFFFFF' : 'transparent',
              fontWeight: 'bold'
            }}
          >
            <Store size={14} />
            {language === 'hi' ? 'उत्पाद शोरूम' : language === 'bn' ? 'পণ্য শোরুম' : 'Solutions Showroom'}
          </button>

          <button 
            onClick={onOpenRfq}
            className="bh-btn bh-btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13, borderColor: 'transparent' }}
          >
            <Calculator size={14} />
            {t('navCalculator')}
          </button>

          <button 
            onClick={onOpenAssistant}
            className="bh-btn bh-btn-ghost"
            style={{ padding: '8px 16px', fontSize: 13, borderColor: 'transparent', color: T.accent }}
          >
            <Sparkles size={14} />
            {t('navChat')}
          </button>
        </nav>

        {/* RIGHT: Trilingual Toggle Pill & Inquiry Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          
          {/* Trilingual Language Switcher Pill */}
          <button
            onClick={handleLanguageToggle}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '6px 14px',
              borderRadius: 999,
              border: '1px solid hsl(240, 5%, 91%)',
              background: '#FFFFFF',
              cursor: 'pointer',
              fontSize: 11,
              fontWeight: 'bold',
              color: 'hsl(240, 5%, 26%)',
              transition: 'all 0.2s',
              boxShadow: T.shadowSm
            }}
            onMouseEnter={(e) => e.currentTarget.style.borderColor = 'hsl(240, 6%, 5%)'}
            onMouseLeave={(e) => e.currentTarget.style.borderColor = 'hsl(240, 5%, 91%)'}
          >
            <span>🌐</span>
            <span style={{ textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              {language === 'en' ? 'English' : language === 'hi' ? 'हिंदी' : 'বাংলা'}
            </span>
          </button>

          {/* Inquiry Basket Counter Button */}
          <button
            data-testid="inquiry-cart"
            onClick={onOpenRfq}
            className="bh-btn bh-btn-primary"
            style={{
              padding: '8px 18px',
              fontSize: 13,
              height: 38,
              boxShadow: '0 4px 14px -4px hsla(240, 6%, 5%, 0.12)'
            }}
          >
            <ShoppingCart size={14} />
            <span className="hidden sm:inline">Inquiry</span>
            {inquiryCount > 0 && (
              <span 
                className="bh-mono" 
                style={{
                  background: 'hsl(151, 56%, 24%)', 
                  color: '#FFFFFF', 
                  borderRadius: 999,
                  padding: '1px 6px', 
                  fontSize: 10, 
                  minWidth: 18, 
                  textAlign: 'center',
                  fontWeight: 'black',
                  marginLeft: 2
                }}
              >
                {inquiryCount}
              </span>
            )}
          </button>

        </div>

      </div>
    </header>
  );
}

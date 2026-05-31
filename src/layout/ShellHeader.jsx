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
  activeView = 'landing',
  activeAct = 1,
  onNavigateToAct = () => {}
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
          maxWidth: 1600, 
          margin: '0 auto', 
          padding: '14px 48px', 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          gap: 24 
        }}
      >
        
        {/* LEFT: Typographic Brandmark */}
        <button 
          onClick={() => onNavigateToAct(1)} 
          style={{ background: 'none', border: 0, padding: 0, cursor: 'pointer', outline: 'none' }}
        >
          <Wordmark height={34} />
        </button>

        {/* CENTER: Clean Spacious Navigation Links */}
        <nav className="shell-nav">
          <button 
            onClick={() => onNavigateToAct(2)}
            className={`bh-btn bh-btn-ghost ${activeView === 'landing' && activeAct === 2 ? 'is-active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              background: 'transparent',
              color: activeView === 'landing' && activeAct === 2 ? T.accent : 'var(--text-body)',
              fontWeight: activeView === 'landing' && activeAct === 2 ? '900' : '500',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {language === 'hi' ? 'फ्लैगशिप उत्पाद' : language === 'bn' ? 'ফ্ল্যাগশিপ পণ্য' : 'Flagship Products'}
            {activeView === 'landing' && activeAct === 2 && (
              <span style={{
                position: 'absolute',
                bottom: -4,
                left: 16,
                right: 16,
                height: 2,
                background: T.accent,
                borderRadius: 999,
              }} />
            )}
          </button>

          <button 
            onClick={() => onNavigateToAct(3)}
            className={`bh-btn bh-btn-ghost ${activeView === 'landing' && activeAct === 3 ? 'is-active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              background: 'transparent',
              color: activeView === 'landing' && activeAct === 3 ? T.accent : 'var(--text-body)',
              fontWeight: activeView === 'landing' && activeAct === 3 ? '900' : '500',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {language === 'hi' ? 'सेक्टर्स और ग्रिड' : language === 'bn' ? 'সেক্টর ও গ্রিড' : 'Sectors & Grid'}
            {activeView === 'landing' && activeAct === 3 && (
              <span style={{
                position: 'absolute',
                bottom: -4,
                left: 16,
                right: 16,
                height: 2,
                background: T.accent,
                borderRadius: 999,
              }} />
            )}
          </button>

          <button 
            onClick={() => onNavigateToAct(4)}
            className={`bh-btn bh-btn-ghost ${activeView === 'landing' && activeAct === 4 ? 'is-active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              background: 'transparent',
              color: activeView === 'landing' && activeAct === 4 ? T.accent : 'var(--text-body)',
              fontWeight: activeView === 'landing' && activeAct === 4 ? '900' : '500',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {language === 'hi' ? 'एंटरप्राइज विरासत' : language === 'bn' ? 'এন্টারপ্রাইজ ঐতিহ্য' : 'Enterprise Legacy'}
            {activeView === 'landing' && activeAct === 4 && (
              <span style={{
                position: 'absolute',
                bottom: -4,
                left: 16,
                right: 16,
                height: 2,
                background: T.accent,
                borderRadius: 999,
              }} />
            )}
          </button>

          <button 
            onClick={() => onNavigateToAct(5)}
            className={`bh-btn bh-btn-ghost ${activeView === 'landing' && activeAct === 5 ? 'is-active' : ''}`}
            style={{
              padding: '8px 16px',
              fontSize: 13,
              border: 'none',
              background: 'transparent',
              color: activeView === 'landing' && activeAct === 5 ? T.accent : 'var(--text-body)',
              fontWeight: activeView === 'landing' && activeAct === 5 ? '900' : '500',
              position: 'relative',
              transition: 'all 0.2s',
              cursor: 'pointer'
            }}
          >
            {language === 'hi' ? 'थोक ऑर्डर' : language === 'bn' ? 'পাইকারি অর্ডার' : 'Contact Specs'}
            {activeView === 'landing' && activeAct === 5 && (
              <span style={{
                position: 'absolute',
                bottom: -4,
                left: 16,
                right: 16,
                height: 2,
                background: T.accent,
                borderRadius: 999,
              }} />
            )}
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

          {/* AI Sourcing Trigger Button */}
          <button
            onClick={onOpenAssistant}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '8px 14px',
              borderRadius: 999,
              border: '1px solid rgba(27, 94, 63, 0.15)',
              background: 'rgba(27, 94, 63, 0.05)',
              cursor: 'pointer',
              fontSize: 12,
              fontWeight: 'bold',
              color: 'hsl(151, 56%, 24%)',
              transition: 'all 0.2s',
              boxShadow: T.shadowSm
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'rgba(27, 94, 63, 0.1)';
              e.currentTarget.style.borderColor = 'rgba(27, 94, 63, 0.3)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'rgba(27, 94, 63, 0.05)';
              e.currentTarget.style.borderColor = 'rgba(27, 94, 63, 0.15)';
            }}
          >
            <Sparkles size={14} style={{ color: 'hsl(151, 56%, 24%)' }} />
            <span className="hidden md:inline">AI Sourcing</span>
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

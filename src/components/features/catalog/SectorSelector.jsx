import React from 'react';
import { useLanguage } from '../../../context/LanguageContext';
import { Shield, HardHat, Cpu, Leaf, Layers } from 'lucide-react';

const SECTORS = [
  {
    id: 'all',
    icon: Layers,
    label_en: 'All Solutions',
    label_hi: 'सभी समाधान',
    label_bn: 'সব সমাধান',
    desc_en: 'Complete Multi-Industrial Digital Showroom',
    desc_hi: 'पूर्ण बहु-औद्योगिक डिजिटल शोरूम',
    desc_bn: 'সম্পূর্ণ মাল্টি-ইন্ডাস্ট্রিয়াল ডিজিটাল শোরুম'
  },
  {
    id: 'infrastructure',
    icon: Shield,
    label_en: 'Infrastructure & Security',
    label_hi: 'सुरक्षा और बुनियादी ढांचा',
    label_bn: 'পরিকাঠামো ও নিরাপত্তা',
    desc_en: 'Barbed wire, Concertina coils, Chain links',
    desc_hi: 'कांटेदार तार, कन्सर्टिना कॉइल, चेन लिंक',
    desc_bn: 'কাঁটাতার, কনসার্টিনা কয়েল, চেইন লিঙ্ক বেড়া'
  },
  {
    id: 'civil',
    icon: HardHat,
    label_en: 'Civil Construction',
    label_hi: 'सिविल इंजीनियरिंग और निर्माण',
    label_bn: 'সিভিল এবং নির্মাণ',
    desc_en: 'Welded mesh, APP Bitumen, Tarfelts, Ghamelas',
    desc_hi: 'लोहे की जाली, एपीपी बिटुमेन, टारफेल्ट, तगारी',
    desc_bn: 'ঝালাই করা জালি, ওয়াটারপ্রুফিং, আলকাতরা ফেল্ট'
  },
  {
    id: 'industrial',
    icon: Cpu,
    label_en: 'Industrial Filtration',
    label_hi: 'औद्योगिक निस्पंदन और चलनी',
    label_bn: 'ইন্ডাস্ট্রিয়াল পরিস্রাবণ',
    desc_en: 'SS 304/316 meshes, Expanded aluminium',
    desc_hi: 'एसएस 304/316 जाली, एल्यूमीनियम जालियां',
    desc_bn: 'এসএস ৩০৪/৩১৬ ফিল্টার, অ্যালুমিনিয়াম শিট'
  },
  {
    id: 'agriculture',
    icon: Leaf,
    label_en: 'Agriculture & Greenhouses',
    label_hi: 'कृषि और बागवानी',
    label_bn: 'কৃষি ও উদ্যানপালন',
    desc_en: 'Shade nets, Geomembrane liners, PET wire',
    desc_hi: 'शेडिंग नेट, जियोमेम्ब्रेन शीट्स, पीईटी तार',
    desc_bn: 'শ্লেড নেট, জিওমেমব্রেন, পিইটি তার'
  }
];

export default function SectorSelector({ activeSector = 'all', onSelectSector = () => {} }) {
  const { language } = useLanguage();

  const getLabel = (sec) =>
    language === 'hi' ? sec.label_hi : language === 'bn' ? sec.label_bn : sec.label_en;
  const getDesc = (sec) =>
    language === 'hi' ? sec.desc_hi : language === 'bn' ? sec.desc_bn : sec.desc_en;

  return (
    <div
      data-testid="sector-selector"
      className="w-full mb-10"
      style={{ maxWidth: 1240, margin: '0 auto', padding: '0 24px' }}
    >
      <div
        className="scroll-hide"
        style={{
          display: 'flex',
          alignItems: 'stretch',
          overflowX: 'auto',
          paddingBottom: 8,
          gap: 12
        }}
      >
        {SECTORS.map((sec) => {
          const Icon = sec.icon;
          const isActive = activeSector === sec.id;
          return (
            <button
              key={sec.id}
              data-testid={`sector-btn-${sec.id}`}
              onClick={() => onSelectSector(sec.id)}
              className="relative flex-shrink-0"
              style={{
                position: 'relative',
                display: 'inline-flex',
                alignItems: 'center',
                gap: 12,
                padding: '14px 22px',
                borderRadius: 999,
                border: '1px solid',
                borderColor: isActive ? 'hsl(151, 56%, 24%)' : 'hsl(240, 5%, 91%)',
                backgroundColor: isActive ? 'hsl(151, 56%, 24%)' : '#FFFFFF',
                color: isActive ? '#FFFFFF' : 'hsl(240, 5%, 26%)',
                cursor: 'pointer',
                fontFamily: "'Inter', system-ui, sans-serif",
                boxShadow: isActive
                  ? '0 8px 24px -10px hsla(151, 56%, 24%, 0.45)'
                  : '0 1px 2px rgba(10,10,11,0.04)',
                transform: isActive ? 'scale(1.05)' : 'scale(1)',
                transition: 'all 0.45s cubic-bezier(0.34, 1.56, 0.64, 1)',
                overflow: 'hidden',
                margin: '0px 4px'
              }}
            >
              {/* Pulsing glow active indicator */}
              {isActive && (
                <span
                  id="sector-active-badge"
                  className="animate-pulse"
                  style={{
                    position: 'absolute',
                    inset: 0,
                    backgroundColor: 'rgba(34, 197, 94, 0.20)',
                    filter: 'blur(8px)',
                    pointerEvents: 'none',
                    borderRadius: 999
                  }}
                />
              )}

              {Icon && (
                <Icon
                  size={18}
                  style={{
                    position: 'relative',
                    zIndex: 1,
                    color: isActive ? '#FFFFFF' : 'hsl(151, 56%, 24%)',
                    transition: 'color 0.3s ease'
                  }}
                />
              )}

              <div style={{ position: 'relative', zIndex: 1, textAlign: 'left' }}>
                <p
                  style={{
                    margin: 0,
                    fontSize: 13,
                    fontWeight: 800,
                    lineHeight: 1.1,
                    letterSpacing: '-0.005em'
                  }}
                >
                  {getLabel(sec)}
                </p>
                <p
                  className="hidden md:block"
                  style={{
                    margin: '3px 0 0',
                    fontSize: 10,
                    fontWeight: 600,
                    opacity: 0.78,
                    lineHeight: 1.2
                  }}
                >
                  {getDesc(sec)}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}

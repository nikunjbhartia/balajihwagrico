import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Send, Sparkles, ArrowLeft, ShieldCheck, HelpCircle, Plus, Trash2 } from 'lucide-react';
import productsData from '../../../data/productsData';
import { TOKENS as T } from '../../../data/tokens.js';

const generateSystemPrompt = (products) => {
  const catalogSummary = products.map((p) => {
    const specs = p.specifications || {};
    const specSummary = Object.entries(specs)
      .slice(0, 4)
      .map(([k, v]) => `${k}: ${v}`)
      .join(', ');
    return `- ${p.prodname || p.name} (ID: ${p.id}, Category: ${p.category}, Specs: ${specSummary})`;
  }).join('\n');

  return `You are the Balaji Hardware & Agrico AI Sourcing Assistant, an expert on industrial perimeters, agricultural screens, waterproofing membranes, and site equipment in Kolkata, India.
Your business details:
- Legal Entity: Balaji Hardware & Agrico
- Base Address: Kolkata, Burra Bazar, West Bengal, India.
- Logistics Corridor: Pan-India delivery from our central Kolkata warehouse corridor.
- Credentials: MSME Registered, TrustSEAL Verified, ISO 9001:2015 compliant dispatches.
- Invoices: Every dispatch includes a valid 18% GST tax invoice and Mill Test Certificates.

Here is your active product inventory catalog (use this data strictly to suggest product matches):
${catalogSummary}

Rules:
- Give short, technical, professional B2B sourcing advice (under 3 sentences if possible).
- Recommend specific products from the catalog list above based on their need. Include the exact ID.
- Remind buyers that they can add any product to their "Inquiry Basket" at the top right of the screen to get a verified 18% GST tax invoice and freight estimate within 10 minutes.
- When recommending a product, format it as [Product Name] (ID: <id>) so the drawer can render a quick-add button!
`;
};


const MOCK_REPLIES = [
  { keywords: ['wire mesh', 'ss', 'filter', 'stainless'], reply: "For premium filtration, we recommend our Stainless Steel Wire Mesh 80 Mesh (ID: 2) or Stainless Steel Fine Wire Mesh (ID: 5). These are woven from grade-304 steel, delivering high acid/alkali resistance and 40-year rust prevention. Would you like to add this to your Inquiry Basket?" },
  { keywords: ['fence', 'fencing', 'perimeter', 'boundary', 'chain link'], reply: "We manufacture heavy-duty Galvanized Iron Chain Link Fencing Mesh (ID: 10) and premium Tata Wiron Chain Link Fencing (ID: 13) at our Kolkata unit. For coastal regions, we highly suggest our PVC Coated Gi Chain Link Fencing Mesh (ID: 12) for zero corrosion. What height and SWG wire gauge does your project require?" },
  { keywords: ['waterproof', 'app', 'membrane', 'roof', 'leak', 'felt'], reply: "For standard terrace underlayment, our Bitumen Tar Felt (ID: 14) is IS 1322 compliant. For structural slabs, we recommend our Sika App Membrane (ID: 15) or Waterproofing Bitumen Sheet (ID: 8) for high-elastomeric torch-on protection. Would you like an estimated cost for these rolls?" },
  { keywords: ['shade', 'net', 'greenhouse', 'agriculture', 'plant'], reply: "We weave UV-stabilized Greenhouse Shade Nets (ID: 17) and Green Shading Nets (ID: 19) in 50%, 75%, and 90% shading factors. These prevent polymer fatigue under hot summer climates. Which shading factor matches your crops?" },
  { keywords: ['pan', 'ghamela', 'dhama', 'carrying', 'mortar'], reply: "For masonry and mortar carrying, we offer our unbreakable 18 Inch Red Plastic Ghamela (ID: 20) and Green PVC Ghamela (ID: 22). These are molded from recycled PVC polymers, making them flexible, crack-proof, and cold-resistant." }
];

export default function AssistantDrawer({
  open = false,
  onClose = () => {},
  inquiry = [],
  onAddToInquiry = () => {},
  tokens = null,
}) {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: "Greetings from Kolkata! I am your Balaji AI Sourcing Assistant. How can I help you configure meshes, perimeters, or waterproofing systems for your project today?",
    }
  ]);
  const [input, setInput] = useState('');
  const [sending, setSending] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const parseProductSuggestions = (text) => {
    const matches = text.match(/\[([^\]]+)\]\s*\(ID:\s*(\d+)\)/gi);
    if (!matches) return [];
    const list = [];
    matches.forEach(m => {
      const idMatch = m.match(/ID:\s*(\d+)/i);
      if (idMatch && idMatch[1]) {
        const prodId = Number(idMatch[1]);
        const match = productsData.find(p => p.id === prodId);
        if (match && !list.some(p => p.id === prodId)) {
          list.push(match);
        }
      }
    });
    return list;
  };

  const handleSend = async (e) => {
    e.preventDefault();
    if (!input.trim() || sending) return;
    const userText = input.trim();
    setInput('');
    setSending(true);

    // Add user message
    setMessages(prev => [...prev, { sender: 'user', text: userText }]);

    const apiKey = import.meta.env.VITE_OPENROUTER_API_KEY;

    try {
      if (apiKey && !apiKey.includes('placeholder')) {
        const contextMessages = [
          { role: 'system', content: generateSystemPrompt(productsData) },
          ...messages.map(m => ({
            role: m.sender === 'ai' ? 'assistant' : 'user',
            content: m.text
          })),
          { role: 'user', content: userText }
        ];

        const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${apiKey}`,
            "HTTP-Referer": "https://balajihwagrico.in",
            "X-Title": "Balaji Hardware Digital Showroom",
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "google/gemini-2.5-flash",
            messages: contextMessages,
            temperature: 0.3,
            max_tokens: 1000
          })
        });

        const resData = await response.json();
        if (resData?.error) {
          console.error("OpenRouter API Error:", resData.error);
          const errMsg = resData.error.message || "Please check your settings or key limit.";
          setMessages(prev => [...prev, { 
            sender: 'ai', 
            text: `AI Assistant Error: ${errMsg}` 
          }]);
          setSending(false);
          return;
        }

        const replyText = resData?.choices?.[0]?.message?.content || "Apologies, my connection to the sourcing database is experiencing lag. Please try again shortly.";
        
        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: replyText,
          suggestions: parseProductSuggestions(replyText)
        }]);
      } else {
        // Dev Mode local fallback simulation
        await new Promise(resolve => setTimeout(resolve, 900));
        
        const lowerText = userText.toLowerCase();
        let matchedReply = "I can assist you in selecting the right specifications. We offer wire meshes, chain link fences, waterproofing membranes, shade nets, and PVC mortar pans. Could you specify which category you need for your project?";
        
        for (const item of MOCK_REPLIES) {
          if (item.keywords.some(k => lowerText.includes(k))) {
            matchedReply = item.reply;
            break;
          }
        }

        setMessages(prev => [...prev, { 
          sender: 'ai', 
          text: matchedReply + " (Note: Running in local simulation mode. Provide an OpenRouter API key to activate live AI).",
          suggestions: parseProductSuggestions(matchedReply)
        }]);
      }
    } catch (err) {
      console.error("AI Assistant Error:", err);
      setMessages(prev => [...prev, { sender: 'ai', text: "Apologies, a connection error occurred. Please check your network or contact our sales team directly at +91-8100448052." }]);
    } finally {
      setSending(false);
    }
  };

  const handleClearChat = () => {
    setMessages([
      {
        sender: 'ai',
        text: "Chat cleared! How can I assist you with your industrial perimeters, meshes, or waterproofing requirements now?",
      }
    ]);
  };

  const tokenStyle = tokens && typeof tokens === 'object' ? tokens : undefined;

  return (
    <div
      className={`rfq-drawer-root ${open ? 'is-open' : ''}`}
      data-testid="assistant-drawer"
      aria-hidden={!open}
      style={tokenStyle}
    >
      <button
        type="button"
        className="rfq-drawer-scrim"
        aria-label="Close AI Assistant"
        tabIndex={open ? 0 : -1}
        onClick={onClose}
      />

      <aside
        className="rfq-drawer-panel"
        role="dialog"
        aria-modal="true"
        style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
      >
        <header className="rfq-drawer-header">
          <div className="rfq-drawer-traffic" aria-hidden="true">
            <button
              type="button"
              className="rfq-traffic rfq-traffic--close"
              onClick={onClose}
              tabIndex={open ? 0 : -1}
              aria-label="Close"
            />
            <span className="rfq-traffic rfq-traffic--min" />
            <span className="rfq-traffic rfq-traffic--max" />
          </div>
          <div className="rfq-drawer-titleblock">
            <p className="rfq-drawer-eyebrow" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <Sparkles size={11} style={{ color: 'var(--accent)' }} /> Smart AI Assistant
            </p>
            <h2 className="rfq-drawer-title">
              Balaji Sourcing Copilot
            </h2>
          </div>
          <button
            type="button"
            onClick={handleClearChat}
            style={{ background: 'none', border: 0, padding: 4, cursor: 'pointer', color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, fontFamily: 'var(--font-mono)', fontWeight: 'bold', textTransform: 'uppercase' }}
            title="Clear Conversation History"
          >
            <Trash2 size={13} /> Clear
          </button>
        </header>

        {/* Chat Window Area */}
        <div 
          style={{ 
            flex: 1, 
            overflowY: 'auto', 
            padding: '24px 20px', 
            display: 'flex', 
            flexDirection: 'column', 
            gap: 16, 
            background: 'hsl(60, 14%, 97%)' 
          }}
        >
          {messages.map((m, idx) => (
            <div 
              key={idx} 
              style={{ 
                alignSelf: m.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '85%',
                display: 'flex',
                flexDirection: 'column',
                gap: 6
              }}
            >
              {/* Bubble */}
              <div 
                style={{
                  background: m.sender === 'user' ? 'var(--accent)' : '#FFFFFF',
                  color: m.sender === 'user' ? '#FFFFFF' : 'var(--text-body)',
                  padding: '14px 18px',
                  borderRadius: m.sender === 'user' ? '18px 18px 2px 18px' : '18px 18px 18px 2px',
                  fontSize: 13,
                  lineHeight: 1.5,
                  boxShadow: '0 2px 6px rgba(10,10,11,0.03)',
                  border: m.sender === 'user' ? 'none' : '1px solid var(--border)',
                  whiteSpace: 'pre-wrap'
                }}
              >
                {m.text}
              </div>

              {/* AI Product Quick-Add Suggestions */}
              {m.suggestions && m.suggestions.length > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 4 }}>
                  <span style={{ fontSize: 10, fontFamily: 'var(--font-mono)', fontWeight: 'bold', color: 'var(--text-mute)', textTransform: 'uppercase' }}>
                    Quick-Add Sourced Items:
                  </span>
                  {m.suggestions.map(p => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => {
                        onAddToInquiry(p);
                        // Add feedback message in chat
                        setMessages(prev => [...prev, { sender: 'ai', text: `Added "${p.name || p.prodname}" to your Inquiry Basket at the top right!` }]);
                      }}
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 8,
                        padding: '8px 12px',
                        background: 'var(--accent-glow)',
                        color: 'var(--accent)',
                        border: '1px solid rgba(27,94,63,0.15)',
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 'bold',
                        cursor: 'pointer',
                        transition: 'all 0.2s',
                        textAlign: 'left'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#FFF'}
                      onMouseLeave={(e) => e.currentTarget.style.background = 'var(--accent-glow)'}
                    >
                      <Plus size={13} /> Add {p.name || p.prodname}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
          {sending && (
            <div style={{ alignSelf: 'flex-start', background: '#FFFFFF', color: 'var(--text-mute)', padding: '12px 16px', borderRadius: '18px 18px 18px 2px', fontSize: 12, display: 'flex', alignItems: 'center', gap: 8, border: '1px solid var(--border)' }}>
              <span style={{ display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: 'var(--accent)', animation: 'bounce 1s infinite alternate' }}></span>
              <span>Sourcing specifications…</span>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        {/* Input Form Footer */}
        <form 
          onSubmit={handleSend} 
          style={{ 
            padding: 16, 
            background: '#FFFFFF', 
            borderTop: '1px solid var(--border)',
            display: 'flex',
            gap: 10
          }}
        >
          <input
            type="text"
            value={input}
            onChange={e => setInput(e.target.value)}
            placeholder="Ask about SWG mesh thickness, waterproofing, shade net types..."
            style={{
              flex: 1,
              padding: '12px 16px',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-md, 12px)',
              fontSize: 13,
              outline: 'none',
              transition: 'border-color 0.2s'
            }}
            onFocus={e => e.currentTarget.style.borderColor = 'var(--accent)'}
            onBlur={e => e.currentTarget.style.borderColor = 'var(--border)'}
            disabled={sending}
          />
          <button
            type="submit"
            disabled={!input.trim() || sending}
            style={{
              width: 44,
              height: 44,
              background: !input.trim() || sending ? 'var(--border)' : 'var(--accent)',
              color: '#FFFFFF',
              border: 0,
              borderRadius: 'var(--radius-md, 12px)',
              display: 'grid',
              placeItems: 'center',
              cursor: !input.trim() || sending ? 'default' : 'pointer',
              transition: 'background 0.2s'
            }}
          >
            <Send size={16} />
          </button>
        </form>

        {/* MSME Badge Footer */}
        <div style={{ padding: '8px 16px', background: 'var(--surface-2)', borderTop: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-mute)' }}>
          <ShieldCheck size={12} style={{ color: 'var(--accent)' }} /> SECURE B2B COPILOT · TRUSTSEAL VERIFIED DISPATCH
        </div>
      </aside>
    </div>
  );
}

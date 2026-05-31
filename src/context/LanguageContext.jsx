import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext(null);

export const translations = {
  en: {
    brand: "Balaji Hardware & Agrico",
    slogan: "Wise Industrial Fencing & Shading Advice from Your B2B Advisor",
    navHome: "Our Store",
    navCatalog: "Our Store",
    navCalculator: "Fencing Calculator",
    navChat: "AI Assistant",
    searchPlaceholder: "Search products: e.g. wire mesh, green shade net, tarpaulin...",
    noProducts: "Sorry, we couldn't find any matching item in our store. Try searching for wire or net!",
    allCategories: "All Solutions",
    categories: {
      wire_mesh: "GI Wire Mesh (Perimeter Guard)",
      chain_link_fencing: "Chain Link Fencing (Security-Shield)",
      tar_felt: "Bitumen Tar Felt (Roof-Shield)",
      shading_net: "Agro Shading Net (Sun-Shield)",
      plastic_ghamela: "Unbreakable Ghamelas (Heavy-Duty)",
      wire_brush: "Heavy Tar Brushes",
      fencing_wire: "Fencing Wire & Cages",
      waterproofing: "APP Waterproofing Sheets"
    },
    calculator: {
      title: "B2B Fencing & Shading Estimator",
      subtitle: "Let's calculate the exact rolls and posts needed for a secure, durable perimeter.",
      fieldSize: "1. How large is your project boundary?",
      selectSize: "Select plot measurement unit:",
      length: "Length of Boundary (Feet)",
      width: "Width of Boundary (Feet)",
      spacing: "Distance Between Support Posts (Feet)",
      layers: "Barbed Wire Layers (Strands for Boundary)",
      threat: "2. Select Protection Tier / Intrusion Threat on your Land",
      threatBoar: "Wild Boars & Pigs digging under? (Welded GI wire mesh required to block rooting)",
      threatCattle: "Stray Cows, Goats, or Animals invading? (Chain link fencing provides peaceful boundary)",
      threatGeneral: "General Boundaries & Trespassing? (Good honest Barbed wire strands)",
      durability: "3. Wire Thickness for Lifetime Durability (SWG Specs)",
      grade14: "Standard (14 SWG) - Light duty. Perfect for standard yards. Generous savings!",
      grade12: "Premium (12 SWG) - Strong & Anti-Sag. Holds up against intense pressure and high winds.",
      grade10: "Super-Strong (10 SWG) - Bulwark grade. Pure steel shield for highly valuable bounds.",
      calculate: "Calculate Visual Estimate",
      results: "EXPERT RECOMMENDATION",
      perimeter: "Total Boundary Length (Feet)",
      recProduct: "Recommended Product for Safety",
      reqRolls: "Required Product Rolls to Cover Land",
      reqPosts: "Required Support Posts (Strong Foundations)",
      reqAccessories: "Required Tensioning Accessories",
      addToInquiry: "Add Entire Solution to Inquiry Basket",
      shareWhatsApp: "Share Estimate on WhatsApp with Partners",
      spacingNotice: "Notice: We recommend placing support posts every 8 feet to prevent any wire sagging.",
    },
    chatbot: {
      title: "AI Assistant",
      subtitle: "Powered by Gemini - Ask in English, Hindi, Bengali or Hinglish!",
      placeholder: "Ask our AI: 'How to protect potatoes from heavy rains?' or 'Which net stops birds?'...",
      preset1: "Wild boars are ruining my potato crop, how do I stop them?",
      preset2: "How many rolls of 75% shade net do I need for a 2 Bigha farm?",
      preset3: "What is the difference between hot-dip and electro galvanized wires?",
      typing: "AI is recalling the engineering manual..."
    },
    catalog: {
      filterTitle: "Filter Specifications",
      clearFilters: "Reset Store Filters",
      showing: "Showing {count} out of {total} items for your project",
      grade: "Select Thickness / SWG Grade",
      size: "Height / Width Option",
      viewSpecs: "Read Detailed Technical Specs",
      backToFront: "Return to Product Brief",
      addToInquiry: "Add to Inquiry Basket",
      originalImage: "Show Original Manufacturing Blueprint"
    }
  },
  hi: {
    brand: "बालाजी हार्डवेयर एंड एग्रिको",
    slogan: "औद्योगिक तारबंदी और वॉटरप्रूफिंग के लिए सर्वोत्तम थोक समाधान",
    navHome: "हमारी दुकान",
    navCatalog: "हमारी दुकान",
    navCalculator: "तारबंदी गणक",
    navChat: "एआई सहायक",
    searchPlaceholder: "उत्पाद खोजें: जैसे: लोहे की जाली, हरी जाली, तिरपाल, तगारी...",
    noProducts: "क्षमा करें, हमें आपकी पसंद का सामान नहीं मिला। कुछ और ढूंढ कर देखें!",
    allCategories: "सभी समाधान",
    categories: {
      wire_mesh: "जीआई लोहे की जाली (बाड़)",
      chain_link_fencing: "चेन लिंक जाली (सुरक्षा बाड़)",
      tar_felt: "डामर टार फेल्ट (छत रक्षक)",
      shading_net: "एग्रो शेडिंग नेट (धूप रक्षक)",
      plastic_ghamela: "मजबूत तगारी/तसला",
      wire_brush: "डामर लगाने के ब्रश",
      fencing_wire: "कांटेदार तार और बाड़",
      waterproofing: "वाटरप्रूफिंग शीट्स"
    },
    calculator: {
      title: "कृषि बाड़ और शेडिंग अनुमानक",
      subtitle: "चलिए आपकी सुरक्षा और समृद्धि के लिए खंभों और रोल का बिल्कुल सही हिसाब लगाते हैं।",
      fieldSize: "1. आपकी बाउंड्री की पैमाइश क्या है?",
      selectSize: "मापने की इकाई चुनें:",
      length: "खेत की लंबाई (फीट)",
      width: "खेत की चौड़ाई (फीट)",
      spacing: "खंभों के बीच की दूरी (फीट)",
      layers: "कांटेदार तार की परतें (Strands)",
      threat: "2. आपके क्षेत्र में सुरक्षा का खतरा किस प्रकार का है?",
      threatBoar: "जंगली जानवर फसल खोद रहे हैं? (मजबूत वेल्डेड जीआई जाली लगाएं ताकि वो जमीन न खोद पाएं)",
      threatCattle: "आवारा पशुओं का डर? (मजबूत चेन लिंक बाड़ लगाओ, बाउंड्री सुरक्षित रहेगी)",
      threatGeneral: "सामान्य सीमांकन और बाउंड्री? (कांटेदार तार की बढ़िया परतें)",
      durability: "3. जीवनभर की निश्चितता के लिए तार की मोटाई (SWG स्पेसिफिकेशन)",
      grade14: "14 SWG - हल्की सुरक्षा, छोटे खेतों के लिए बजट-अनुकूल और बढ़िया बचत!",
      grade12: "12 SWG - असली मजबूती! बिना झोल खाए सालों-साल चले, भारी आंधी और हवा झेले।",
      grade10: "10 SWG - वज्र समान बाड़! मूल्यवान बागों और बड़े खेतों के लिए लोहे का सुरक्षा कवच।",
      calculate: "अनुमान की गणना करें",
      results: "विशेषज्ञ की सलाह",
      perimeter: "कुल घेरा (फीट)",
      recProduct: "सुरक्षा के लिए सबसे बेहतरीन उत्पाद",
      reqRolls: "घेरा घेरने के लिए आवश्यक कुल रोल",
      reqPosts: "मजबूती के लिए आवश्यक खंभे (सपोर्ट पोल)",
      reqAccessories: "तार खींचने की एसेसरीज",
      addToInquiry: "इस पूरे सुरक्षा समाधान को पूछताछ सूची में जोड़ें",
      shareWhatsApp: "WhatsApp पर शेयर करें",
      spacingNotice: "सलाह: हमारा सुझाव है कि हर 8 फीट पर खंभा लगाएं, जिससे जाली कभी झोल न खाए।",
    },
    chatbot: {
      title: "एआई सहायक",
      subtitle: "Gemini द्वारा संचालित - हिंदी, अंग्रेजी या हिंग्लिश में बेझिझक बात करें",
      placeholder: "पूछें: 'आलू को भारी बारिश से कैसे बचाएं?' या 'पशुओं को रोकने के लिए कौन सी जाली ठीक है?'...",
      preset1: "सूअर मेरी आलू की फसल नष्ट कर रहे हैं, मुझे कौन सी जाली लगानी चाहिए?",
      preset2: "2 बीघा खेत के लिए 75% शेड नेट के कितने रोल खरीदने पड़ेंगे?",
      preset3: "हॉट-डिप गैल्वनाइजिंग और इलेक्ट्रो-गैल्वनाइजिंग तारों में क्या अंतर होता है?",
      typing: "एआई सहायक सोच रहा है..."
    },
    catalog: {
      filterTitle: "फिल्टर विवरण",
      clearFilters: "फिल्टर हटाएं",
      showing: "खेत की बरकत के लिए {total} में से {count} उत्पाद उपलब्ध",
      grade: "मोटाई / SWG ग्रेड चुनें",
      size: "ऊंचाई / चौड़ाई का विकल्प",
      viewSpecs: "तकनीकी और फायदों की पूरी जानकारी पढ़ें",
      backToFront: "उत्पाद के संक्षिप्त विवरण पर जाएं",
      addToInquiry: "पूछताछ टोकरी में जोड़ें",
      originalImage: "फैक्ट्री का ओरिजिनल ब्लू-प्रिंट देखें"
    }
  },
  bn: {
    brand: "বালাজী হার্ডওয়্যার অ্যান্ড অ্যাগ্রিকো",
    slogan: "ইন্ডাস্ট্রিয়াল তারের বেড়া ও ওয়াটারপ্রুফিংয়ের সেরা পাইকারি সমাধান",
    navHome: "আমাদের দোকান",
    navCatalog: "আমাদের দোকান",
    navCalculator: "বেড়ার হিসেব",
    navChat: "এআই সহকারী",
    searchPlaceholder: "পণ্য খুঁজুন: যেমন তারের জালি, ত্রিপল, সবুজ নেট, ঘামেলা...",
    noProducts: "দুঃখিত, আমরা আপনার পছন্দের পণ্যটি খুঁজে পাইনি। তার বা নেট লিখে আবার খুঁজুন!",
    allCategories: "সব সমাধান",
    categories: {
      wire_mesh: "জিআই তারের জালি (সীমানা বেড়া)",
      chain_link_fencing: "চেইন লিঙ্ক বেড়া (নিরাপত্তা বেড়া)",
      tar_felt: "বিটুমেন আলকাতরা ফেল্ট (ছাদ রক্ষক)",
      shading_net: "অ্যাগ্রো শেডিং নেট (রোদ রক্ষক)",
      plastic_ghamela: "ভাঙবে না এমন ঘামেলা (ভারী কাজের তসলা)",
      wire_brush: "ভারী তারের ব্রাশ",
      fencing_wire: "বেড়ার তার ও খাঁচা",
      waterproofing: "ওয়াটারপ্রুফিং শিট"
    },
    calculator: {
      title: "তারের বেড়া ও শেড পরিমাপক",
      subtitle: "আসুন, আপনার সীমানার নিরাপত্তার জন্য খুঁটি ও বেড়ার সঠিক হিসেব কষে ফেলি।",
      fieldSize: "১. আপনার প্রকল্পের সীমানা কতটা?",
      selectSize: "সীমানা পরিমাপের একক বেছে নাও:",
      length: "জমির দৈর্ঘ্য (ফুট)",
      width: "জমির প্রস্থ (ফুট)",
      spacing: "খুঁটিগুলির পারস্পরিক দূরত্ব (ফুট)",
      layers: "কাঁটাতারের স্তর (Strands)",
      threat: "২. আপনার এলাকায় কি ধরনের পশুর উপদ্রব আছে?",
      threatBoar: "বুনো শুয়োরের উপদ্রব? (ঝালাই করা জিআই জালি মাটি খোঁড়া বন্ধ করতে অত্যন্ত আবশ্যক)",
      threatCattle: "আমদানি ছাগল-গরুর ফসল খাওয়ার ভয়? (চেইন লিঙ্ক বেড়া সীমানা সুরক্ষিত রাখবে)",
      threatGeneral: "সাধারণ সীমানা পাহারা ও বেষ্টনী? (কাঁটাতারের স্তর দিলেই ভালো হবে)",
      durability: "৩. আজীবন নিরাপত্তার জন্য তারের পুরুত্ব (SWG স্পেসিফিকেশন)",
      grade14: "১৪ SWG - হালকা ও সাশ্রয়ী। ছোট সীমানার জন্য লাভজনক ও সাশ্রয়ী!",
      grade12: "১২ SWG - আসল জোর! ঝোড়ো হাওয়া ও প্রবল চাপে একটুও ঝুলবে না, দীর্ঘস্থায়ী।",
      grade10: "১০ SWG - দুর্গের মতো পাহারা! মূল্যবান বাগান ও সীমানার জন্য লোহার অভেদ্য কবচ।",
      calculate: "অনুমান গণনা করুন",
      results: "বিশেষজ্ঞের পরামর্শ",
      perimeter: "জমির মোট সীমানা (ফুট)",
      recProduct: "নিরাপত্তার জন্য প্রস্তাবিত পণ্য",
      reqRolls: "সীমানা ঘেরার জন্য প্রয়োজনীয় মোট রোল",
      reqPosts: "মজবুত খুঁটি (সাপোর্ট পোস্ট)",
      reqAccessories: "তার টানার প্রয়োজনীয় ক্ল্যাম্প",
      addToInquiry: "অনুসন্ধানের ঝুড়িতে যুক্ত করো",
      shareWhatsApp: "WhatsApp-এ শেয়ার করুন",
      spacingNotice: "পরামর্শ: আমরা প্রতি ৮ ফুট অন্তর খুঁটি পোঁতার পরামর্শ দিই যাতে বেড়া কখনো জুলে না পড়ে।"
    },
    chatbot: {
      title: "এআই সহকারী",
      subtitle: "Gemini দ্বারা চালিত - বাংলা, হিন্দি বা ইংরেজি ভাষায় কথা বলুন",
      placeholder: "জিজ্ঞেস করুন: 'ভারী বৃষ্টিতে আলুর জল আটকাবো কীভাবে?' বা 'পাখি তাড়াতে কোন নেট ভালো?'...",
      preset1: "বুনো শুয়োর আলুর ক্ষেত শেষ করে দিল, কোন বেড়া লাগাবো বলো তো?",
      preset2: "২ বিঘা জমির জন্য ৭৫% শেড নেটের কতটি রোল কিনতে হবে?",
      preset3: "হট-ডিপ গ্যালভানাইজিং আর ইলেক্ট্রো গ্যালভানাইজিং তারের তফাৎ টা কি?",
      typing: "এআই সহকারী চিন্তা করছে..."
    },
    catalog: {
      filterTitle: "ফিল্টার বিবরণী",
      clearFilters: "ফিল্টারগুলি মুছে দাও",
      showing: "জমির সমৃদ্ধির জন্য {total} টির মধ্যে {count} টি পণ্য হাজির",
      grade: "পুরুত্ব / SWG গ্রেড বেছে নাও",
      size: "উচ্চতা / প্রস্থ অপশন",
      viewSpecs: "বিস্তারিত টেকনিক্যাল বিবরণী পড়ো",
      backToFront: "পণ্যের সংক্ষিপ্ত বিবরণে ফিরে যাও",
      addToInquiry: "অনুসন্ধানের ঝুড়িতে যুক্ত করো",
      originalImage: "কারখানার আসল ব্লু-প্রিন্ট দেখো"
    }
  }
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState('en');

  useEffect(() => {
    document.documentElement.setAttribute('lang', language);
  }, [language]);

  const t = (key) => {
    const keys = key.split('.');
    let translation = translations[language];
    
    for (const k of keys) {
      if (!translation || translation[k] === undefined) {
        let fallback = translations['en'];
        for (const fk of keys) {
          if (!fallback || fallback[fk] === undefined) {
            return key; 
          }
          fallback = fallback[fk];
        }
        return fallback;
      }
      translation = translation[k];
    }
    return translation;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

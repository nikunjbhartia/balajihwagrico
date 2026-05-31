import { useState, useEffect } from 'react';

export function parseHash() {
  const h = (window.location.hash || '').replace(/^#/, '');
  if (!h || h === '/' || h === '') return { view: 'landing' };

  const parts = h.split('/').filter(Boolean);
  if (parts[0] === 'category' && parts[1]) {
    return { view: 'category', slug: decodeURIComponent(parts[1]) };
  }
  if (parts[0] === 'product' && parts[1]) {
    return { view: 'product', id: decodeURIComponent(parts[1]) };
  }
  return { view: 'landing' };
}

export function useHashRoute() {
  const [route, setRoute] = useState(() => parseHash());

  useEffect(() => {
    const handler = () => setRoute(parseHash());
    window.addEventListener('hashchange', handler);
    // Seed default landing route on first load
    if (!window.location.hash) window.location.hash = '#/';
    return () => window.removeEventListener('hashchange', handler);
  }, []);

  return route;
}

export default useHashRoute;

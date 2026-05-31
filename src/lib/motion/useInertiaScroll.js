import { useEffect } from 'react';
import { subscribe } from './rafTicker';

const REST_EPSILON = 0.05;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useInertiaScroll(opts = {}) {
  const {
    lerp = 0.085,
    varY = '--scroll-y',
    varV = '--scroll-v',
  } = opts;

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;

    const root = document.documentElement;
    const reduced = prefersReducedMotion();

    if (reduced) {
      const onScroll = () => {
        root.style.setProperty(varY, String(window.scrollY));
        root.style.setProperty(varV, '0');
      };
      onScroll();
      window.addEventListener('scroll', onScroll, { passive: true });
      return () => window.removeEventListener('scroll', onScroll);
    }

    let target = window.scrollY;
    let current = window.scrollY;
    let previous = current;
    let resting = true;
    let unsubscribe = null;

    root.style.setProperty(varY, String(current));
    root.style.setProperty(varV, '0');

    const ensureSubscribed = () => {
      if (unsubscribe) return;
      unsubscribe = subscribe(() => {
        current += (target - current) * lerp;
        const velocity = current - previous;
        previous = current;

        root.style.setProperty(varY, current.toFixed(2));
        root.style.setProperty(varV, velocity.toFixed(3));

        if (
          Math.abs(target - current) < REST_EPSILON &&
          Math.abs(velocity) < REST_EPSILON
        ) {
          current = target;
          previous = target;
          root.style.setProperty(varY, String(target));
          root.style.setProperty(varV, '0');
          resting = true;
          if (unsubscribe) {
            unsubscribe();
            unsubscribe = null;
          }
        }
      });
    };

    const onScroll = () => {
      target = window.scrollY;
      if (resting) {
        resting = false;
        ensureSubscribed();
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (unsubscribe) unsubscribe();
    };
  }, [lerp, varY, varV]);
}

export default useInertiaScroll;

import { useCallback, useEffect, useRef, useState } from 'react';
import { subscribe } from './rafTicker';

function isInteractivePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useTilt(opts = {}) {
  const {
    max = 8,
    perspective = 1200,
    lift = 4,
    depth = 12,
    writeVars = true,
  } = opts;

  const ref = useRef(null);
  const targetRot = useRef({ x: 0, y: 0, active: false });
  const committed = useRef({ x: 0, y: 0, active: false });

  const [style] = useState(() => ({
    perspective: `${perspective}px`,
    transformStyle: 'preserve-3d',
    willChange: 'transform',
    transition:
      'transform 0.45s cubic-bezier(0.25, 0.8, 0.25, 1), box-shadow 0.45s cubic-bezier(0.25, 0.8, 0.25, 1)',
  }));

  const handleMove = useCallback(
    (e) => {
      const el = ref.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const nx = ((e.clientX - rect.left) / rect.width) * 2 - 1;
      const ny = ((e.clientY - rect.top) / rect.height) * 2 - 1;
      targetRot.current.x = -ny * max;
      targetRot.current.y = nx * max;
      targetRot.current.active = true;
    },
    [max],
  );

  const handleLeave = useCallback(() => {
    targetRot.current.x = 0;
    targetRot.current.y = 0;
    targetRot.current.active = false;
  }, []);

  useEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    if (!isInteractivePointer()) return undefined;

    el.addEventListener('pointermove', handleMove, { passive: true });
    el.addEventListener('pointerleave', handleLeave, { passive: true });
    el.addEventListener('pointercancel', handleLeave, { passive: true });

    const unsubscribe = subscribe(() => {
      const node = ref.current;
      if (!node) return;
      const t = targetRot.current;
      const c = committed.current;

      if (t.x === c.x && t.y === c.y && t.active === c.active) return;

      const rx = t.x.toFixed(3);
      const ry = t.y.toFixed(3);
      const liftY = t.active ? -lift : 0;
      const pushZ = t.active ? depth : 0;

      if (writeVars) {
        node.style.setProperty('--rotate-x', `${rx}deg`);
        node.style.setProperty('--rotate-y', `${ry}deg`);
      }
      node.style.transform =
        `perspective(${perspective}px) ` +
        `translate3d(0, ${liftY}px, ${pushZ}px) ` +
        `rotateX(${rx}deg) rotateY(${ry}deg)`;

      c.x = t.x;
      c.y = t.y;
      c.active = t.active;
    });

    return () => {
      el.removeEventListener('pointermove', handleMove);
      el.removeEventListener('pointerleave', handleLeave);
      el.removeEventListener('pointercancel', handleLeave);
      unsubscribe();
    };
  }, [handleMove, handleLeave, perspective, lift, depth, writeVars]);

  return { ref, style };
}

export default useTilt;

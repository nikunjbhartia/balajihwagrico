import { useEffect, useRef } from 'react';
import { subscribe } from './rafTicker';

function isInteractivePointer() {
  if (typeof window === 'undefined' || !window.matchMedia) return false;
  return (
    window.matchMedia('(hover: hover) and (pointer: fine)').matches &&
    !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useCursorAura(opts = {}) {
  const { writeRootVars = true } = opts;
  const ref = useRef(null);

  const pointer = useRef({ x: -9999, y: -9999, dirty: false, visible: false });
  const committed = useRef({ x: -9999, y: -9999, visible: false });

  useEffect(() => {
    if (typeof window === 'undefined') return undefined;
    if (!isInteractivePointer()) {
      const node = ref.current;
      if (node) node.style.display = 'none';
      return undefined;
    }

    const onMove = (e) => {
      pointer.current.x = e.clientX;
      pointer.current.y = e.clientY;
      pointer.current.visible = true;
      pointer.current.dirty = true;
    };

    const onLeave = () => {
      pointer.current.visible = false;
      pointer.current.dirty = true;
    };

    const onEnter = () => {
      pointer.current.visible = true;
      pointer.current.dirty = true;
    };

    window.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerleave', onLeave, { passive: true });
    document.addEventListener('pointerenter', onEnter, { passive: true });

    const root = document.documentElement;

    const unsubscribe = subscribe(() => {
      const p = pointer.current;
      const c = committed.current;
      if (!p.dirty) return;
      if (p.x === c.x && p.y === c.y && p.visible === c.visible) {
        p.dirty = false;
        return;
      }

      const node = ref.current;
      if (node) {
        node.style.transform = `translate3d(${p.x}px, ${p.y}px, 0) translate(-50%, -50%)`;
        node.style.opacity = p.visible ? '1' : '0';
      }

      if (writeRootVars) {
        root.style.setProperty('--mouse-x', `${p.x}px`);
        root.style.setProperty('--mouse-y', `${p.y}px`);
      }

      c.x = p.x;
      c.y = p.y;
      c.visible = p.visible;
      p.dirty = false;
    });

    return () => {
      window.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerleave', onLeave);
      document.removeEventListener('pointerenter', onEnter);
      unsubscribe();
    };
  }, [writeRootVars]);

  return ref;
}

export default useCursorAura;

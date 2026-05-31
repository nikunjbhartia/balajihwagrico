import { useEffect, useRef, useState } from 'react';
import { subscribe } from './rafTicker';

const PRECISION = 0.01;

function prefersReducedMotion() {
  return (
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );
}

export function useSpring(target, opts = {}) {
  const {
    stiffness = 180,
    damping = 22,
    mass = 1,
    precision = PRECISION,
  } = opts;

  const [value, setValue] = useState(target);

  const state = useRef({
    current: target,
    velocity: 0,
    target,
  });

  state.current.target = target;

  useEffect(() => {
    if (prefersReducedMotion()) {
      state.current.current = target;
      state.current.velocity = 0;
      setValue(target);
      return undefined;
    }

    const unsubscribe = subscribe(({ delta }) => {
      const dt = Math.min(delta, 64) / 1000;
      const s = state.current;

      const displacement = s.current - s.target;
      const springForce = -stiffness * displacement;
      const dampingForce = -damping * s.velocity;
      const acceleration = (springForce + dampingForce) / mass;

      s.velocity += acceleration * dt;
      s.current += s.velocity * dt;

      if (
        Math.abs(s.velocity) < precision &&
        Math.abs(displacement) < precision
      ) {
        s.current = s.target;
        s.velocity = 0;
        setValue(s.target);
        return;
      }

      setValue(s.current);
    });

    return unsubscribe;
  }, [target, stiffness, damping, mass, precision]);

  return value;
}

export default useSpring;

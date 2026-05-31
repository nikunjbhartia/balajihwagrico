const subscribers = new Set();

let rafId = 0;
let tickIndex = 0;
let startTime = 0;
let lastTime = 0;
let running = false;

const hasRAF =
  typeof window !== 'undefined' &&
  typeof window.requestAnimationFrame === 'function';

function loop(now) {
  if (lastTime === 0) {
    lastTime = now;
    startTime = now;
  }

  const delta = now - lastTime;
  const elapsed = now - startTime;
  lastTime = now;
  tickIndex += 1;

  const frame = { tick: tickIndex, delta, elapsed };
  const snapshot = Array.from(subscribers);
  for (let i = 0; i < snapshot.length; i++) {
    try {
      snapshot[i](frame);
    } catch (err) {
      console.error('[rafTicker] subscriber threw:', err);
    }
  }

  if (running && subscribers.size > 0) {
    rafId = window.requestAnimationFrame(loop);
  } else {
    stop();
  }
}

function start() {
  if (running || !hasRAF) return;
  running = true;
  lastTime = 0;
  rafId = window.requestAnimationFrame(loop);
}

function stop() {
  if (!running) return;
  running = false;
  if (rafId && hasRAF) {
    window.cancelAnimationFrame(rafId);
  }
  rafId = 0;
}

export function subscribe(fn) {
  if (typeof fn !== 'function') return () => {};
  subscribers.add(fn);
  if (!running) start();
  return () => {
    subscribers.delete(fn);
    if (subscribers.size === 0) stop();
  };
}

export function subscriberCount() {
  return subscribers.size;
}

export function shutdown() {
  subscribers.clear();
  stop();
}

export default { subscribe, subscriberCount, shutdown };

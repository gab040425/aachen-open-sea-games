// One shared requestAnimationFrame loop for all animations on the page
// (wave background, hero parallax). It only runs while something is subscribed.
//   const stop = onFrame((t) => { ... });   stop() to unsubscribe
const subs = new Set();
let raf = 0;

const loop = (t) => {
  subs.forEach((fn) => fn(t));
  raf = subs.size ? requestAnimationFrame(loop) : 0;
};

export function onFrame(fn) {
  subs.add(fn);
  if (!raf) raf = requestAnimationFrame(loop);
  return () => subs.delete(fn);
}

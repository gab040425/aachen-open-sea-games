import { useCallback, useEffect, useRef } from 'react';

const CONTROL_CLEARANCE = 16;
const DIRECTION_THRESHOLD = 8;
const SETTLE_TOLERANCE = .5;
const SETTLE_FRAMES = 3;

// All geometry/state belongs to this page: never change the shared navbar or CSS.
export default function useScheduleLayout(pageRef, controlsRef, startRef, panelRef) {
  const scrollAction = useRef(() => false);
  useEffect(() => {
    const page = pageRef.current;
    const controls = controlsRef.current;
    const start = startRef.current;
    const panel = panelRef.current;
    const navbar = document.querySelector('.nav');
    if (!page || !controls || !start || !panel || !navbar) return;
    let hidden = false;
    let lastY = window.scrollY;
    let scrollFrame = 0;
    let settleFrame = 0;
    let automatic = false;
    const navBottom = () => Math.max(0, navbar.getBoundingClientRect().bottom);
    const measure = () => {
      const bottom = navBottom();
      const height = controls.offsetHeight;
      const globalPadding = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
      page.style.setProperty('--matches-navbar-offset', `${bottom}px`);
      // Native focus/scrollIntoView still combines global padding with this margin.
      page.style.setProperty('--matches-scroll-margin', `${Math.max(0, bottom + (hidden ? 0 : height) + CONTROL_CLEARANCE - globalPadding)}px`);
    };
    const setHidden = (next) => {
      hidden = next;
      controls.dataset.hidden = String(next);
      measure();
    };
    const focusedCardWouldBeCovered = () => {
      const card = document.activeElement?.closest('.matches-match-card');
      if (!card) return false;
      const rect = card.getBoundingClientRect();
      const bottom = navBottom();
      return rect.bottom > bottom && rect.top < bottom + controls.offsetHeight + CONTROL_CLEARANCE;
    };
    const update = () => {
      scrollFrame = 0;
      measure();
      if (automatic) return;
      const y = Math.max(0, window.scrollY);
      const delta = y - lastY;
      // At the normal-flow start, retain the original layout. At the schedule end,
      // hide the panel instead of leaving an overlay over the footer/other content.
      if (start.getBoundingClientRect().top > navBottom()) setHidden(false);
      else if (panel.getBoundingClientRect().bottom <= navBottom() + controls.offsetHeight) setHidden(true);
      else if (focusedCardWouldBeCovered()) setHidden(true);
      else if (controls.querySelector(':focus-visible')) setHidden(false);
      // Focus overlap was handled above; only direction remains to decide here.
      else if (Math.abs(delta) >= DIRECTION_THRESHOLD) setHidden(delta > 0);
      if (Math.abs(delta) >= DIRECTION_THRESHOLD) lastY = y;
    };
    const onScroll = () => {
      if (!scrollFrame) scrollFrame = requestAnimationFrame(update);
    };
    const stopAutomatic = () => {
      automatic = false;
      cancelAnimationFrame(settleFrame);
      lastY = window.scrollY;
    };
    const onFocus = () => {
      // Tab focus into controls must reveal them; revealing must not obscure a card
      // that already has keyboard focus when the visitor merely scrolls upward.
      if (controls.contains(document.activeElement)) setHidden(false);
      else if (!hidden && focusedCardWouldBeCovered()) setHidden(true);
    };
    scrollAction.current = (node) => {
      const bottom = navBottom();
      const rect = node.getBoundingClientRect();
      const startY = window.scrollY + start.getBoundingClientRect().top - bottom;
      const centeredY = window.scrollY + rect.top + rect.height / 2 - (window.innerHeight + bottom) / 2;
      const maxY = Math.max(0, document.documentElement.scrollHeight - window.innerHeight);
      const targetY = Math.min(maxY, Math.max(0, startY + 1, centeredY));
      // Auto navigation deliberately clears the controls so their animated height
      // cannot change the target halfway through smooth scrolling.
      automatic = true;
      setHidden(true);
      window.scrollTo({
        top: targetY,
        behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth',
      });
      let previous = window.scrollY;
      let quietFrames = 0;
      const settle = () => {
        const current = window.scrollY;
        quietFrames = Math.abs(current - previous) < SETTLE_TOLERANCE ? quietFrames + 1 : 0;
        previous = current;
        // Frame-based completion avoids arbitrary long timers and supports engines
        // without scrollend. Wheel/touch/key input immediately releases this guard.
        if (quietFrames >= SETTLE_FRAMES) {
          automatic = false;
          lastY = current;
          return;
        }
        settleFrame = requestAnimationFrame(settle);
      };
      cancelAnimationFrame(settleFrame);
      settleFrame = requestAnimationFrame(settle);
      return true;
    };
    measure();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(onScroll);
    observer?.observe(navbar);
    observer?.observe(controls);
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    window.addEventListener('wheel', stopAutomatic, { passive: true });
    window.addEventListener('touchstart', stopAutomatic, { passive: true });
    window.addEventListener('keydown', stopAutomatic);
    page.addEventListener('focusin', onFocus);
    return () => {
      scrollAction.current = () => false;
      observer?.disconnect();
      cancelAnimationFrame(scrollFrame);
      cancelAnimationFrame(settleFrame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      window.removeEventListener('wheel', stopAutomatic);
      window.removeEventListener('touchstart', stopAutomatic);
      window.removeEventListener('keydown', stopAutomatic);
      page.removeEventListener('focusin', onFocus);
    };
  }, [pageRef, controlsRef, startRef, panelRef]);
  return useCallback((node) => scrollAction.current(node), []);
}

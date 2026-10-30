import { useEffect, useRef } from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import Countdown from '../Countdown/Countdown';
import { onFrame } from '../../lib/ticker';
import { nextHeroCountdown } from '../../data/countdowns';
import links from '../../data/links';
import FormButton from '../FormButton/FormButton';
import './Hero.css';

export default function Hero() {
  const artRef = useRef(null);

  // Parallax: players drift against the mouse (desktop) or with scrolling (touch screens).
  // Writes --px / --py (-1..1) on .hero-art; Hero.css turns them into movement per layer.
  // Runs on the shared frame loop only while the hero is visible and still moving.
  useEffect(() => {
    const el = artRef.current;
    if (!el || matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const touch = matchMedia('(pointer: coarse)').matches;
    let tx = 0, ty = 0, x = 0, y = 0, visible = false, stop = null;
    const tick = () => {
      x += (tx - x) * 0.08; y += (ty - y) * 0.08;
      el.style.setProperty('--px', x.toFixed(3)); el.style.setProperty('--py', y.toFixed(3));
      if (Math.abs(tx - x) < 0.001 && Math.abs(ty - y) < 0.001) { stop(); stop = null; } // settled
    };
    const wake = () => { if (visible && !stop) stop = onFrame(tick); };
    const onMove = (e) => { tx = (e.clientX / innerWidth) * 2 - 1; ty = (e.clientY / innerHeight) * 2 - 1; wake(); };
    const onScroll = () => {
      if (!visible) return;
      const r = el.getBoundingClientRect();
      ty = Math.max(-1, Math.min(1, ((r.top + r.height / 2) / innerHeight) * 2 - 1));
      wake();
    };
    const io = new IntersectionObserver(([e]) => {
      visible = e.isIntersecting;
      if (visible) wake(); else if (stop) { stop(); stop = null; }
    });
    io.observe(el);
    if (touch) addEventListener('scroll', onScroll, { passive: true });
    else addEventListener('pointermove', onMove, { passive: true });
    return () => { io.disconnect(); stop?.(); removeEventListener('scroll', onScroll); removeEventListener('pointermove', onMove); };
  }, []);

  return (
    <section className="hero container" id="home">
      <div className="hero-text">
        <h1>AACHEN HACKENBERG OPEN:<br />SEA GAMES</h1>
        <p className="hero-subtitle">Three nations. One arena.</p>
        <p className="muted">Celebrate the spirit of Southeast Asia through sport, culture and community. Join us in Aachen for a weekend to remember.</p>

        <div className="hero-details">
          <span><Icon name="calendar" className="icon-accent" /> 5th - 6th December 2026</span>
          <span><Icon name="pin" className="icon-accent" /> Aachen, Germany</span>
        </div>

        <div className="hero-actions">
          {/* switches on by itself while player registration is open */}
          <FormButton href={links.playerRegistration} window="registration">Register now</FormButton>
          <a href="#event-info" className="btn btn-dark">Explore the event</a>
        </div>

        {/* Shows the next upcoming date from data/countdowns.js */}
        <Countdown countdown={nextHeroCountdown} className="hero-countdown" />
      </div>

      {/* Players on a glowing stage. #hero-islands marks where the background
          draws its "SEA GAMES" islands (see DitherWave.js). */}
      <div className="hero-art" ref={artRef} aria-hidden="true">
        <div id="hero-islands" className="hero-islands" />
        <div className="hero-stage" />
        <ImageSlot file="HeroBadminton-trim.png" className="cutout player-badminton" sizes="300px" eager />
        <ImageSlot file="HeroFutsal-trim.png" className="cutout player-futsal" sizes="300px" eager />
        <ImageSlot file="HeroBasketball-trim.png" className="cutout player-basketball" sizes="300px" eager />
      </div>
    </section>
  );
}

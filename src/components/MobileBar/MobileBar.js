import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Countdown from '../Countdown/Countdown';
import { getCountdown } from '../../data/countdowns';
import links from '../../data/links';
import FormButton from '../FormButton/FormButton';
import './MobileBar.css';

// Phones only (see MobileBar.css): a bar stuck to the bottom of the screen with the
// Register button and a small countdown (numbers only). Hidden while the hero is on screen,
// since the hero already shows both.
// The countdown switches from "opens" to "closes" by itself (dates in data/countdowns.js).
export default function MobileBar() {
  const { pathname } = useLocation();
  const [heroVisible, setHeroVisible] = useState(false);

  useEffect(() => {
    const hero = document.getElementById('home');
    if (!hero) { setHeroVisible(false); return; }   // pages without a hero: always show the bar
    const io = new IntersectionObserver(([e]) => setHeroVisible(e.isIntersecting), { threshold: 0.15 });
    io.observe(hero);
    return () => io.disconnect();
  }, [pathname]);

  return (
    <div className={`mobile-bar ${heroVisible ? 'is-hidden' : ''}`} aria-hidden={heroVisible}>
      <Countdown countdown={getCountdown('registration')} className="compact mobile-bar-countdown" />
      <FormButton href={links.playerRegistration} window="registration" className="btn-small">Register</FormButton>
    </div>
  );
}

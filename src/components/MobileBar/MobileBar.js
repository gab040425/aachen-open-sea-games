import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import Icon from '../Icon/Icon';
import Countdown from '../Countdown/Countdown';
import { getCountdown } from '../../data/countdowns';
import './MobileBar.css';

// Phones only (see MobileBar.css): a bar stuck to the bottom of the screen with the
// Register button and a small countdown (numbers only). Hidden while the hero is on screen,
// since the hero already shows both.
// TODO: once registration is open, switch the countdown to the "registration ends" date.
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
      {/* Turned off until registration opens. To switch on: remove `is-disabled`, aria-disabled, tabIndex
          and onClick, and put the form link in href. */}
      <a href="#" className="btn btn-primary btn-small is-disabled" aria-disabled="true" tabIndex={-1} onClick={(e) => e.preventDefault()}>
        Register <Icon name="arrow" />
      </a>
    </div>
  );
}

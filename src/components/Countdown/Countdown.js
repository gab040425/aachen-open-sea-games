import { useSyncExternalStore } from 'react';
import './Countdown.css';

// One shared clock for every countdown on the page: a single 1-second timer
// that only runs while at least one countdown is on screen.
const listeners = new Set();
let current = Date.now(), timer = 0;
const subscribe = (fn) => {
  listeners.add(fn);
  if (!timer) timer = setInterval(() => { current = Date.now(); listeners.forEach((l) => l()); }, 1000);
  return () => { listeners.delete(fn); if (!listeners.size) { clearInterval(timer); timer = 0; } };
};
export const useNow = () => new Date(useSyncExternalStore(subscribe, () => current, () => current));

const pad = (n) => String(n).padStart(2, '0');

// <Countdown countdown={getCountdown('registration')} />  (entries from data/countdowns.js)
// countdown can also be a function (now) => entry, e.g. nextHeroCountdown.
// Only this component re-renders every second, not the section around it.
export default function Countdown({ countdown: pick, className = '' }) {
  const now = useNow();
  const countdown = typeof pick === 'function' ? pick(now) : pick;
  if (!countdown) return null;

  const left = Math.max(0, new Date(countdown.date) - now);
  if (left === 0) {
    return countdown.doneText ? <p className={`countdown-done ${className}`}>{countdown.doneText}</p> : null;
  }

  const s = Math.floor(left / 1000);
  const units = [
    { value: Math.floor(s / 86400), label: 'Days' },
    { value: pad(Math.floor((s % 86400) / 3600)), label: 'Hours' },
    { value: pad(Math.floor((s % 3600) / 60)), label: 'Min' },
    { value: pad(s % 60), label: 'Sec' },
  ];

  return (
    <div className={`countdown ${className}`} role="timer" aria-label={`${countdown.label} ${units.map((u) => `${u.value} ${u.label}`).join(' ')}`}>
      <span className="countdown-label">{countdown.label}</span>
      <div className="countdown-units" aria-hidden="true">
        {units.map((u) => (
          <div key={u.label} className="countdown-unit">
            <span className="countdown-value">{u.value}</span>
            <span className="countdown-unit-label">{u.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

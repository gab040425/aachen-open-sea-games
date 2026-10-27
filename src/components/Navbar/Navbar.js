import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import links from '../../data/links';
import './Navbar.css';

// `to` can point at a page ("/sports/chess") or a section of the home page ("/#faq").
// `match` (optional) is the path that marks the link as active, if it differs from `to`.
const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'Event Info', to: '/#event-info' },
  { label: 'About', to: '/#about' },
  { label: 'Sports', to: '/#sports' },
  { label: 'Matches', to: '/', soon: true },       // TODO: link to a matches page
  { label: 'Merchandise', to: '/merchandise/t-shirt', match: '/merchandise' },
  { label: 'FAQ', to: '/#faq' },
  { label: 'Organisers', to: '/#organizers' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { pathname, hash } = useLocation();
  const close = () => setOpen(false);

  const isActive = ({ to, match }) => {
    if (match) return pathname.startsWith(match);
    if (to === '/#sports') return pathname.startsWith('/sports') || (pathname === '/' && hash === '#sports');
    if (to.startsWith('/#')) return pathname === '/' && hash === to.slice(1);
    if (to !== '/') return pathname.startsWith(to);
    return pathname === to && (!hash || hash === '#home');
  };

  return (
    <header className={`nav ${open ? 'menu-open' : ''}`}>
      <Link className="nav-brand" to="/" onClick={close}>
        <ImageSlot file="Logo.png" alt="Aachen Hackenberg Open logo" className="nav-logo" sizes="72px" eager />
        <span className="nav-title">AACHEN HACKENBERG OPEN: SEA GAMES</span>
      </Link>

      <button className="nav-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="menu" />
      </button>

      <nav className="nav-links">
        {navLinks.map((link) => (
          <Link key={link.label} to={link.to} className={!link.soon && isActive(link) ? 'active' : ''} onClick={close}>
            {link.label}
          </Link>
        ))}
        <a href={links.instagram} target="_blank" rel="noreferrer" className="btn btn-dark btn-small" onClick={close}>
          Contact <Icon name="arrow" />
        </a>
        {/* Turned off until registration opens. To switch on: remove `is-disabled`, aria-disabled and
            tabIndex, change onClick back to {close}, and put the form link in href. */}
        <a href="#" className="btn btn-primary btn-small is-disabled" aria-disabled="true" tabIndex={-1} onClick={(e) => e.preventDefault()}>
          Register <Icon name="arrow" />
        </a>
      </nav>
    </header>
  );
}

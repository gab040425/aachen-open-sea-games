import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import links from '../../data/links';
import FormButton from '../FormButton/FormButton';
import './Navbar.css';

// `to` can point at a page ("/sports/chess") or a section of the home page ("/#faq").
// `match` (optional) is the path that marks the link as active, if it differs from `to`.
const navLinks = [
  { label: 'Home', to: '/' },
  { label: 'About', to: '/#about' },
  { label: 'Sports', to: '/#sports' },
  { label: 'Merchandise', to: '/merchandise/t-shirt', match: '/merchandise' },
  { label: 'Vendors', to: '/#vendors' },
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
        {/* switches on by itself while player registration is open */}
        <FormButton href={links.playerRegistration} window="registration" className="btn-small" onClick={close}>Register</FormButton>
      </nav>
    </header>
  );
}

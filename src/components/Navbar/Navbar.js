import { useState } from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import './Navbar.css';

const links = [
  { label: 'Home', href: '#home' },
  { label: 'Sports', href: '#sports' },
  { label: 'Matches', href: '#' },       // TODO: link to a matches page
  { label: 'Merchandise', href: '#' },   // TODO: link to a merch page
  { label: 'FAQ', href: '#faq' },
];

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const close = () => setOpen(false);

  return (
    <header className={`nav ${open ? 'menu-open' : ''}`}>
      <a className="nav-brand" href="#home">
        <ImageSlot file="logo.png" alt="Aachen Open logo" className="nav-logo" />
        <span className="nav-title">AACHEN OPEN: SEA GAMES 2026</span>
      </a>

      <button className="nav-toggle" aria-label="Open menu" aria-expanded={open} onClick={() => setOpen(!open)}>
        <Icon name="menu" />
      </button>

      <nav className="nav-links">
        {links.map((link, i) => (
          <a key={link.label} href={link.href} className={i === 0 ? 'active' : ''} onClick={close}>
            {link.label}
          </a>
        ))}
        <a href="#" className="btn btn-primary btn-small" onClick={close}>
          Register <Icon name="arrow" />
        </a>
      </nav>
    </header>
  );
}

import links from '../../data/links';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer">
      <span>© 2026 Aachen Hackenberg Open: SEA Games</span>
      <span className="footer-links">
        <a href={links.instagram} target="_blank" rel="noreferrer">Instagram</a> · <a href={links.playerHandbook} target="_blank" rel="noreferrer">Player Handbook</a>
      </span>
    </footer>
  );
}

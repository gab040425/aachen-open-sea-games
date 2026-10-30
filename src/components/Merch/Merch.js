import SectionLabel from '../SectionLabel/SectionLabel';
import { Link } from 'react-router-dom';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import Countdown from '../Countdown/Countdown';
import { getCountdown } from '../../data/countdowns';
import merch, { combo } from '../../data/merch';
import './Merch.css';

export default function Merch() {
  return (
    <section className="container section" id="merchandise">
      <SectionLabel>Merchandise</SectionLabel>
      <h2 className="title">Merchandise</h2>
      <p className="muted">Wear the Games. Take a piece of the weekend home.</p>
      <Countdown countdown={getCountdown('merch-presale')} className="merch-countdown" />

      <p className="merch-combo-note"><span>Combo</span> Jersey + T-shirt together for <strong>{combo.price}</strong> (save {combo.saving})</p>

      <div className="merch-grid">
        {merch.map((item) => (
          <Link key={item.slug} className="merch-card" to={`/merchandise/${item.slug}`}>
            <ImageSlot file={item.images[0]} alt={item.name} className="merch-card-photo" sizes="(max-width: 860px) 420px, 530px" />
            <span className="merch-card-name">
              <span>{item.name} <span className="merch-card-price">{item.price}</span></span>
              <Icon name="arrow" />
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}

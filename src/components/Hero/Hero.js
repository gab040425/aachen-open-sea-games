import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import './Hero.css';

export default function Hero() {
  return (
    <section className="hero container" id="home">
      <div className="hero-text">
        <h1>AACHEN OPEN:<br />SEA GAMES 2026</h1>
        <p className="hero-subtitle">Three nations. One arena.</p>
        <p className="muted">Celebrate the spirit of Southeast Asia through sport, culture and community. Join us in Aachen for a weekend to remember.</p>

        <div className="hero-details">
          <span><Icon name="calendar" className="icon-accent" /> 5th - 6th December 2026</span>
          <span><Icon name="pin" className="icon-accent" /> Aachen, Germany</span>
        </div>

        <div className="hero-actions">
          <a href="#" className="btn btn-primary">Register now <Icon name="arrow" /></a>
          <a href="#event-info" className="btn btn-dark">Explore the event</a>
        </div>
      </div>

      {/* Three cut-out player photos, layered like in Figma */}
      <div className="hero-art" aria-hidden="true">
        <ImageSlot file="hero-player-left.png" className="cutout player-left" />
        <ImageSlot file="hero-player-right.png" className="cutout player-right" />
        {/* <ImageSlot file="hero-player-center.png" className="cutout player-center" /> */}
      </div>
    </section>
  );
}

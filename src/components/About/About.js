import SectionLabel from '../SectionLabel/SectionLabel';
import ImageSlot from '../ImageSlot/ImageSlot';
import './About.css';

export default function About() {
  return (
    <section className="container section" id="about">
      <SectionLabel>About</SectionLabel>
      <div className="split">
        <div className="split-text">
          <h2 className="title">About the Event</h2>
          <p className="muted">The Aachen Hackenberg Open: SEA Games features a series of competitive and spirited sports competitions. This event is designed as a platform to showcase talent and teamwork, as well as to foster the values of sportsmanship among students from the three countries.</p>
          <p className="muted">Represent your country, cheer for your friends, and discover the energy of our community. Whether you're competing or supporting, everyone has a place in the games.</p>
        </div>
        <ImageSlot file="AboutEvent.jpg" alt="Participants cheering together" className="photo photo-about" sizes="(max-width: 860px) 100vw, 440px" />
      </div>
    </section>
  );
}

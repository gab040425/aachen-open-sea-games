import SectionLabel from '../SectionLabel/SectionLabel';
import ImageSlot from '../ImageSlot/ImageSlot';
import './Faq.css';

// Add `open: true` to start an item expanded.
const questions = [
  { q: 'Who can participate in the Games?', a: 'The Games are open to students and members of the Southeast Asian community in Aachen and beyond. Athletes representing Vietnam, Malaysia and Indonesia are welcome. You can also join as a volunteer or supporter.', open: true },
  { q: 'When and where will the event take place?', a: 'On 5–6 December 2026 at Berufskolleg Nord in Herzogenrath, near Aachen.' },
  { q: 'How do I register my team?', a: 'Registration opens on 1 November 2026. Click the register button at the top of the page to sign up.' },
  { q: 'Can I compete in more than one sport?', a: 'Participants may compete in more than one sport, but if there is a schedule conflict, they must choose only one category before the match begins.' },
  { q: 'What should I bring on the day?', a: 'As spectators, bring money to enjoy the food bazaar and most importantly, bring your happiest self for a day of sports, food and friendship!' },
  { q: 'Will there be pictures of me taken?', a: 'Yes. By attending Aachen Hackenberg Open: SEA Games, you consent to being photographed and filmed.' },
];

export default function Faq() {
  return (
    <section className="container section" id="faq">
      <SectionLabel>FAQ</SectionLabel>
      <div className="split">
        <div className="split-text">
          <h2 className="title">FAQ</h2>
          <p className="muted">Got questions? We've got answers.<br />Find everything you need to prepare for the Games.</p>
        </div>
        <ImageSlot file="Faq.jpg" alt="Organising team" className="photo photo-faq" sizes="(max-width: 860px) 100vw, 465px" />
      </div>

      <div className="faq-list">
        {questions.map((item) => (
          <details key={item.q} open={item.open}>
            <summary>{item.q}</summary>
            <p>{item.a}</p>
          </details>
        ))}
      </div>
    </section>
  );
}

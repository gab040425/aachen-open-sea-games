import ImageSlot from '../ImageSlot/ImageSlot';
import './Faq.css';

// Add `open: true` to start an item expanded.
const questions = [
  { q: 'Who can participate in the Games?', a: 'The Games are open to students and members of the Southeast Asian community in Aachen and beyond. Athletes representing Vietnam, Malaysia and Indonesia are welcome. You can also join as a volunteer or supporter.', open: true },
  { q: 'When and where will the event take place?', a: 'On 5–6 December 2026 at Berufskolleg Nord in Herzogenrath, near Aachen.' },
  { q: 'How do I register my team?', a: '[Write your answer here]' },
  { q: 'Can I compete in more than one sport?', a: '[Write your answer here]' },
  { q: 'Is there a registration fee?', a: '[Write your answer here]' },
  { q: 'What should I bring on the day?', a: '[Write your answer here]' },
  { q: 'Will there be pictures of me taken?', a: '[Write your answer here]' },
];

export default function Faq() {
  return (
    <section className="container section" id="faq">
      <div className="split">
        <div className="split-text">
          <h2 className="title">FAQ</h2>
          <p className="muted">Got questions? We've got answers.<br />Find everything you need to prepare for the Games.</p>
        </div>
        <ImageSlot file="photo-faq.png" alt="Organising team" className="photo photo-faq" />
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

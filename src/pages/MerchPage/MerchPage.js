import { Link, Navigate, useParams } from 'react-router-dom';
import Carousel from '../../components/Carousel/Carousel';
import Countdown from '../../components/Countdown/Countdown';
import FormButton from '../../components/FormButton/FormButton';
import { getCountdown } from '../../data/countdowns';
import merch, { combo, sizeNotes } from '../../data/merch';
import './MerchPage.css';

export default function MerchPage() {
  const { slug = merch[0].slug } = useParams();
  const item = merch.find((m) => m.slug === slug);
  if (!item) return <Navigate to="/merchandise" replace />;
  const others = merch.filter((m) => m.slug !== slug).map((m) => m.name).join(' + ');

  return (
    <div className="merch-page container">
      {/* Item switcher */}
      <nav className="merch-tabs" aria-label="Choose an item">
        {merch.map((m) => (
          <Link key={m.slug} to={`/merchandise/${m.slug}`} replace className={m.slug === slug ? 'active' : ''}>
            {m.name}
          </Link>
        ))}
      </nav>

      <div className="merch-layout">
        {/* key resets the carousel to image 1 when switching items */}
        <Carousel key={item.slug} images={item.images} alt={item.name} />

        <div className="merch-info">
          <h1 className="title-lg">{item.name}</h1>
          {/* price, with the combo deal as a quiet second line */}
          <div className="merch-price-row">
            {item.price && <p className="merch-price">{item.price}</p>}
            <p className="merch-combo">
              or <strong>{combo.price}</strong> together with the {others}
              <span className="merch-combo-save">save {combo.saving}</span>
            </p>
          </div>

          <Countdown countdown={getCountdown('merch-presale')} className="compact merch-page-countdown" />

          {/* switches on by itself while the presale is open */}
          <FormButton href={item.formUrl} window="merch-presale" className="merch-buy">Order now</FormButton>

          <div className="size-guide">
            <h2 className="size-guide-title">Size guide <span>all in cm</span></h2>
            {/* scrolls sideways on narrow phones */}
            <div className="size-table-wrap">
              <table className="size-table">
                <thead>
                  <tr><th>Size</th><th>Length</th><th>Chest</th><th>Shoulder</th><th>Height</th><th>Weight (kg)</th></tr>
                </thead>
                <tbody>
                  {item.sizes.map((row) => (
                    <tr key={row.size}>
                      <td>{row.size}</td><td>{row.length}</td><td>{row.chest}</td><td>{row.shoulder}</td><td>{row.height}</td><td>{row.weight}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {sizeNotes.map((note) => <p key={note} className="size-note">{note}</p>)}
          </div>
        </div>
      </div>

      <section className="merch-story">
        {item.storyTitle && <p className="merch-story-kicker">{item.storyTitle}</p>}
        <h2 className="title">The story</h2>
        <div className="merch-story-body">
          {item.story.map((p, i) => <p key={i} className="muted">{p}</p>)}
        </div>
      </section>
    </div>
  );
}

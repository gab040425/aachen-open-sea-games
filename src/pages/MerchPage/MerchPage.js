import { Link, Navigate, useParams } from 'react-router-dom';
import Carousel from '../../components/Carousel/Carousel';
import Icon from '../../components/Icon/Icon';
import Countdown from '../../components/Countdown/Countdown';
import { getCountdown } from '../../data/countdowns';
import merch from '../../data/merch';
import './MerchPage.css';

export default function MerchPage() {
  const { slug = merch[0].slug } = useParams();
  const item = merch.find((m) => m.slug === slug);
  if (!item) return <Navigate to="/merchandise" replace />;

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
          {item.price && <p className="merch-price">{item.price}</p>}

          <Countdown countdown={getCountdown('merch-presale')} className="compact merch-page-countdown" />

          <a href={item.formUrl} target="_blank" rel="noreferrer" className="btn btn-primary merch-buy">
            Order now <Icon name="arrow" />
          </a>

          <table className="size-table">
            <caption>Size guide</caption>
            <thead>
              <tr><th>Size</th><th>Height (cm)</th><th>Weight (kg)</th></tr>
            </thead>
            <tbody>
              {item.sizes.map((row) => (
                <tr key={row.size}><td>{row.size}</td><td>{row.height}</td><td>{row.weight}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <section className="merch-story section">
        <h2 className="title">The story</h2>
        {item.story.map((p, i) => <p key={i} className="muted">{p}</p>)}
      </section>
    </div>
  );
}

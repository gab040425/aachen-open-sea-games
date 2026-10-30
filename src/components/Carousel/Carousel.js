import { useState } from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';
import Icon from '../Icon/Icon';
import ZoomImage from './ZoomImage';
import './Carousel.css';

// Image carousel: thumbnails + main image with previous/next buttons.
export default function Carousel({ images, alt }) {
  const [index, setIndex] = useState(0);
  const go = (step) => setIndex((i) => (i + step + images.length) % images.length);

  return (
    <div className="carousel">
      <div className="carousel-thumbs">
        {images.map((file, i) => (
          <button
            key={file}
            className={`carousel-thumb ${i === index ? 'active' : ''}`}
            onClick={() => setIndex(i)}
            aria-label={`Show image ${i + 1}`}
          >
            <ImageSlot file={file} sizes="72px" />
          </button>
        ))}
      </div>

      <div className="carousel-main">
        <ZoomImage key={images[index]} file={images[index]} alt={`${alt}, image ${index + 1} of ${images.length}`} />
        <button className="carousel-arrow prev" onClick={() => go(-1)} aria-label="Previous image"><Icon name="chevron-left" /></button>
        <button className="carousel-arrow next" onClick={() => go(1)} aria-label="Next image"><Icon name="chevron-right" /></button>
        <span className="carousel-count">{index + 1} / {images.length}</span>
      </div>
    </div>
  );
}

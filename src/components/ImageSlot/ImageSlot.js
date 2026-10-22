import { useState } from 'react';
import manifest from '../../data/image-manifest.json';
import './ImageSlot.css';

// Image from public/images/. Shows a labelled placeholder until the file exists.
// If `npm run images` has made WebP copies (see scripts/optimize-images.mjs), the browser
// picks the smallest one that fits `sizes`; otherwise the original file is used.
// Images load lazily (when scrolled near) unless `eager` is set (hero, logo).
export default function ImageSlot({ file, alt = '', className = '', sizes = '(max-width: 860px) 100vw, 50vw', eager = false, children }) {
  const [missing, setMissing] = useState(false);
  const info = manifest[file];
  const base = file.replace(/\.[^.]+$/, '');
  const source = info
    ? {
        src: `/images/opt/${base}-${info.widths[info.widths.length - 1]}.webp`,
        srcSet: info.widths.map((w) => `/images/opt/${base}-${w}.webp ${w}w`).join(', '),
        sizes,
        width: info.width,
        height: info.height,
      }
    : { src: `/images/${file}` };

  return (
    <div className={`img-slot ${className} ${missing ? 'missing' : ''}`} data-file={file}>
      {!missing && (
        <img
          {...source}
          alt={alt}
          loading={eager ? 'eager' : 'lazy'}
          decoding="async"
          fetchpriority={eager ? 'high' : undefined}
          onError={() => setMissing(true)}
        />
      )}
      {children}
    </div>
  );
}

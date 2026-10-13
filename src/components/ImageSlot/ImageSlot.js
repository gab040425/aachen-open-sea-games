import { useState } from 'react';
import './ImageSlot.css';

// Image from public/images/. Shows a labelled placeholder until the file exists.
export default function ImageSlot({ file, alt = '', className = '', children }) {
  const [missing, setMissing] = useState(false);

  return (
    <div className={`img-slot ${className} ${missing ? 'missing' : ''}`} data-file={file}>
      {!missing && <img src={`/images/${file}`} alt={alt} onError={() => setMissing(true)} />}
      {children}
    </div>
  );
}

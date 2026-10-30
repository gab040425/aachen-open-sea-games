import { useRef, useState } from 'react';
import ImageSlot from '../ImageSlot/ImageSlot';

const SCALE = 2.5;

// Main carousel image with a zoom-in view of the spot under the pointer.
//   Mouse / trackpad (desktop, iPad with trackpad): hover to zoom, move to look around.
//   Touch (phone, iPad): tap to zoom in, drag to look around, tap again to zoom out.
//     While not zoomed, swipes scroll the page as usual.
export default function ZoomImage({ file, alt }) {
  const ref = useRef(null);
  const start = useRef(null);
  const [zoomed, setZoomed] = useState(false);

  // where the zoom is centred, as % of the image (set directly, no re-render per move)
  const aim = (e) => {
    const r = ref.current.getBoundingClientRect();
    const x = Math.min(100, Math.max(0, ((e.clientX - r.left) / r.width) * 100));
    const y = Math.min(100, Math.max(0, ((e.clientY - r.top) / r.height) * 100));
    ref.current.style.setProperty('--zx', `${x}%`);
    ref.current.style.setProperty('--zy', `${y}%`);
  };

  const onPointerEnter = (e) => { if (e.pointerType === 'mouse') { aim(e); setZoomed(true); } };
  const onPointerLeave = (e) => { if (e.pointerType === 'mouse') setZoomed(false); };
  const onPointerDown = (e) => {
    if (e.pointerType === 'mouse') return;
    start.current = { x: e.clientX, y: e.clientY, moved: false };
    if (zoomed) ref.current.setPointerCapture(e.pointerId);   // keep panning even outside the image
  };
  const onPointerMove = (e) => {
    if (e.pointerType === 'mouse') { aim(e); return; }
    if (start.current && Math.hypot(e.clientX - start.current.x, e.clientY - start.current.y) > 8) start.current.moved = true;
    if (zoomed) aim(e);
  };
  const onPointerUp = (e) => {
    if (e.pointerType === 'mouse' || !start.current) return;
    if (!start.current.moved) {   // a tap: toggle
      if (!zoomed) aim(e);
      setZoomed(!zoomed);
    }
    start.current = null;
  };

  return (
    <div
      ref={ref}
      className={`zoom-image ${zoomed ? 'is-zoomed' : ''}`}
      style={{ '--zoom': SCALE }}
      onPointerEnter={onPointerEnter}
      onPointerLeave={onPointerLeave}
      onPointerDown={onPointerDown}
      onPointerMove={onPointerMove}
      onPointerUp={onPointerUp}
      onPointerCancel={() => { start.current = null; }}
    >
      {/* sizes asks for a bigger file than shown, so the zoomed view stays sharp */}
      <ImageSlot file={file} alt={alt} className="carousel-image" sizes="(max-width: 860px) 200vw, 1200px" eager />
      <span className="zoom-hint" aria-hidden="true">
        <span className="zoom-hint-mouse">Hover to zoom</span>
        <span className="zoom-hint-touch">{zoomed ? 'Drag to look around · tap to close' : 'Tap to zoom'}</span>
      </span>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { createDitherWave } from '../../lib/dither-wave';
import './DitherWave.css';

// Ripple settings are the same as the original Relief demo; the rest is
// toned down so text on top stays readable. All options: src/lib/dither-wave.js
const settings = {
  // the wave (same as the demo)
  wamp: 0.65, refract: 0.55, glyphWave: 0.5, gStart: 0, gCount: 2, cell: 11, rate: 1.3,
  // the background look
  glyph: 0.12, dither: 0.6, levels: 6, ditherCell: 2, contour: 0.25, contourN: 7,
  plus: 0.15, grain: 0.07, glow: 0.35, shadeMix: 0.35, vignette: 0.2, hover: 0.12,
  // scrolling leaves ripples where the cursor/finger is (one every `scrollStep` px)
  scrollRipples: true, scrollStep: 40,
};

// Performance. Normal devices: 75% resolution, 60 fps while rippling, 30 fps when idle.
// Phones / weak devices / data saver: half resolution, 30 fps max.
// Both lower the resolution further by themselves if frames come too slowly.
const isLite = () =>
  matchMedia('(pointer: coarse)').matches ||
  (navigator.deviceMemory && navigator.deviceMemory <= 4) ||
  (navigator.hardwareConcurrency && navigator.hardwareConcurrency <= 4) ||
  navigator.connection?.saveData;
const quality = {
  normal: { resScale: 0.75, maxPixels: 1.6e6, fpsMax: 60, fpsIdle: 30 },
  lite:   { resScale: 0.5,  maxPixels: 0.6e6, fpsMax: 30, fpsIdle: 20 },
};

// Turns a CSS variable (hex, color-mix(), ...) into [r, g, b] in 0..1
function readCssColor(name) {
  const probe = document.createElement('span');
  probe.style.color = `var(${name})`;
  document.body.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  const ctx = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
  ctx.fillStyle = value;
  ctx.fillRect(0, 0, 1, 1);
  const [r, g, b] = ctx.getImageData(0, 0, 1, 1).data;
  return [r / 255, g / 255, b / 255];
}

export default function DitherWave() {
  const canvasRef = useRef(null);
  const waveRef = useRef(null);
  const { pathname } = useLocation();

  useEffect(() => {
    const wave = createDitherWave(canvasRef.current, {
      ...settings,
      ...(isLite() ? quality.lite : quality.normal),
      mode: 'gradient',
      fixed: true,
      palette: ['--bg-deep', '--bg-navy', '--bg-royal', '--bg-bright'].map(readCssColor),
      warm: ['--bg-glow-outer', '--bg-glow-core'].map(readCssColor),
      glyphCol: readCssColor('--bg-glyph'),
      mark: readCssColor('--bg-mark'),
      // big low-key words rising out of the background as islands, behind the hero players
      islands: {
        text: 'SEA\nGAMES',
        anchor: '#hero-islands',
        font: `400 {size}px ${getComputedStyle(document.documentElement).getPropertyValue('--font-islands')}`,
        amount: 0.18,   // how much the islands stand out (0 = invisible)
        warmth: 0.12,   // hint of sunrise colour on the islands
      },
    });
    if (!wave) canvasRef.current.style.display = 'none'; // no WebGL2: the CSS gradient shows instead
    waveRef.current = wave;
    return () => wave?.destroy();
  }, []);

  // the hero islands' anchor only exists on the home page: re-measure after page changes
  useEffect(() => { waveRef.current?.refreshIslands(); }, [pathname]);

  return <canvas ref={canvasRef} className="dither-wave" aria-hidden="true" />;
}

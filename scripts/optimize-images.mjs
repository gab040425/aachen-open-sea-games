// Makes web-sized WebP copies of everything in public/images/:
//   public/images/opt/<name>-<width>.webp   (400, 800, 1600 px wide, never upscaled)
// and writes src/data/image-manifest.json so <ImageSlot> can serve the right size.
// Runs automatically before `npm run dev` and `npm run build`; unchanged images are skipped.
// Images without an entry in the manifest still work: ImageSlot then uses the original file.
import sharp from 'sharp';
import fs from 'node:fs';
import path from 'node:path';

const SRC = 'public/images', OUT = 'public/images/opt', MANIFEST = 'src/data/image-manifest.json';
const WIDTHS = [400, 800, 1600];

fs.mkdirSync(OUT, { recursive: true });
const manifest = {}, keep = new Set();
let made = 0;

for (const file of fs.readdirSync(SRC).sort()) {
  const src = path.join(SRC, file);
  if (!/\.(jpe?g|png|webp)$/i.test(file) || !fs.statSync(src).isFile()) continue;
  const meta = await sharp(src).metadata();
  const rotated = (meta.orientation || 1) >= 5;
  const width = rotated ? meta.height : meta.width, height = rotated ? meta.width : meta.height;
  const widths = [...new Set([...WIDTHS.filter((w) => w < width), Math.min(width, 1600)])].sort((a, b) => a - b);
  const base = file.replace(/\.[^.]+$/, '');
  for (const w of widths) {
    const out = path.join(OUT, `${base}-${w}.webp`);
    keep.add(path.basename(out));
    if (fs.existsSync(out) && fs.statSync(out).mtimeMs >= fs.statSync(src).mtimeMs) continue;
    await sharp(src).rotate().resize({ width: w }).webp({ quality: 78, alphaQuality: 90, effort: 5 }).toFile(out);
    made++;
  }
  manifest[file] = { width, height, widths };
}

for (const f of fs.readdirSync(OUT)) if (!keep.has(f)) fs.unlinkSync(path.join(OUT, f)); // removed images
fs.writeFileSync(MANIFEST, JSON.stringify(manifest, null, 2) + '\n');
console.log(`images: ${Object.keys(manifest).length} files, ${made} new/updated webp copies`);

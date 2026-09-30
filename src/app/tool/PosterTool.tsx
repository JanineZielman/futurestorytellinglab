'use client';

import { useEffect, useRef, useState } from 'react';
import type { PointerEvent } from 'react';
import styles from './tool.module.css';

type TextBlock = { id: number; text: string; x: number; y: number; size: number; color: string; bold: boolean; align: CanvasTextAlign };
type ImageBlock = { id: number; name: string; src: string; x: number; y: number; width: number; aspect: number };
type Design = { format: string; landscape: boolean; background: string; a: string; b: string; density: number; size: number; pattern: string; seed: number; phase: number; blocks: TextBlock[]; speed?: number; frequency?: number; balance?: number; rotation?: number; spread?: number; warp?: number; images?: ImageBlock[] };
const patternDefaults = { speed: 1, frequency: 1, balance: 1, rotation: 0, spread: 1, warp: 0 };
const patterns = [['waves', 'Chladni waves'], ['cloud', 'Flowing clouds'], ['scatter', 'Homepage scatter'], ['rings', 'Ripples'], ['spiral', 'Spiral'], ['ribbons', 'Ribbons'], ['lattice', 'Interference grid'], ['petals', 'Petals']] as const;
const parameterControls = [
  { key: 'frequency', label: 'Frequency', min: .25, max: 3, step: .05, hint: 'Low = broad shapes; high = more repetitions.' },
  { key: 'balance', label: 'Wave balance', min: .1, max: 2, step: .05, hint: 'Changes the relationship between the two waves.' },
  { key: 'rotation', label: 'Rotation', min: 0, max: 360, step: 1, hint: 'Rotates the pattern field, keeping text upright.' },
  { key: 'spread', label: 'Spread', min: .25, max: 3, step: .05, hint: 'Low = thin contours; high = fuller colour fields.' },
  { key: 'warp', label: 'Distortion', min: 0, max: 2, step: .05, hint: 'Bends the pattern into softer, organic shapes.' },
] as const;
const formats: Record<string, { w: number; h: number; label: string }> = {
  a3: { w: 3508, h: 4961, label: 'A3 · 297 × 420 mm' }, a4: { w: 2480, h: 3508, label: 'A4 · 210 × 297 mm' },
  square: { w: 1080, h: 1080, label: 'Instagram · square' }, portrait: { w: 1080, h: 1350, label: 'Instagram · portrait' }, story: { w: 1080, h: 1920, label: 'Story · 9:16' },
};
const initial: Design = {
  ...patternDefaults, format: 'a3', landscape: false, background: '#080808', a: '#ffb000', b: '#ff3900', density: 14000, size: 1.7, pattern: 'waves', seed: 42, phase: 0, blocks: [
    { id: 1, text: 'Future Storytelling Lab:', x: .05, y: .04, size: 2.7, color: '#ffffff', bold: false, align: 'left' },
    { id: 2, text: 'Step Inside\nFSL’s New Lab', x: .05, y: .085, size: 10, color: '#ffffff', bold: true, align: 'left' },
    { id: 3, text: 'Timetable:\n15:00 — Doors open\n15:30 — Official launch', x: .05, y: .76, size: 3, color: '#ffffff', bold: false, align: 'left' },
    { id: 4, text: 'Future Storytelling Lab\nArtEZ University of the Arts', x: .05, y: .92, size: 2, color: '#ffffff', bold: false, align: 'left' },
  ]
};
function random(seed: number) { let s = seed >>> 0; return () => { s += 0x6D2B79F5; let t = Math.imul(s ^ s >>> 15, 1 | s); t ^= t + Math.imul(t ^ t >>> 7, 61 | t); return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function rgb(hex: string) { return [1, 3, 5].map(i => parseInt(hex.slice(i, i + 2), 16)); }
function dimensions(d: Design) { const f = formats[d.format]; return d.landscape ? { w: f.h, h: f.w } : { w: f.w, h: f.h }; }
function font(b: TextBlock, w: number) { return `${b.bold ? 700 : 400} ${w * b.size / 100}px Arial, Helvetica, sans-serif`; }
// A deterministic field: identical composition at preview and export resolutions.
function particles(d: Design, w: number, h: number, draw: (x: number, y: number, s: number, color: string, alpha: number) => void) {
  const rand = random(d.seed), a = rgb(d.a), b = rgb(d.b), aspect = w / h;
  const frequency = d.frequency ?? 1, balance = d.balance ?? 1, spread = d.spread ?? 1, warp = d.warp ?? 0;
  const angle = (d.rotation ?? 0) * Math.PI / 180, cos = Math.cos(angle), sin = Math.sin(angle);
  for (let i = 0; i < d.density; i++) {
    let x = rand(), y = rand();
    const t = d.phase;
    if (d.pattern === 'scatter') {
      x = ((x + Math.sin(t * .3 + i) * .015) % 1 + 1) % 1;
      y = ((y + Math.cos(t * .25 + i) * .015) % 1 + 1) % 1;
    }
    const ox = (x * 2 - 1) * aspect * 2.4, oy = (y * 2 - 1) * 2.4;
    const rx = (ox * cos - oy * sin) * frequency, ry = (ox * sin + oy * cos) * frequency;
    const u = rx + warp * .35 * Math.sin(ry * 2 + t), v = ry + warp * .35 * Math.cos(rx * 2 - t);
    const radius = Math.hypot(u, v), theta = Math.atan2(v, u);
    let value = 0;
    switch (d.pattern) {
      case 'cloud': value = Math.sin(u * 2 + balance * Math.sin(v * 3 + t)) + Math.cos(v * 2 - t); break;
      case 'rings': value = Math.sin(radius * 7 - t) + .3 * balance * Math.sin(u * 2 + v * 3 + t); break;
      case 'spiral': value = Math.sin(radius * 5 - theta * 3 - t) + .2 * balance * Math.cos(radius * 3 + t); break;
      case 'ribbons': value = Math.sin(u * 4 + balance * 2 * Math.sin(v * 2 + t) - t); break;
      case 'lattice': value = Math.sin(u * 5 - t) * Math.sin(v * 5 * balance + t); break;
      case 'petals': value = Math.sin(radius * 4 - balance * 1.5 * Math.cos(theta * 5 + t) - t); break;
      default: value = 1.5 * Math.sin(Math.PI * 2 * u - t) * Math.sin(Math.PI * v + t) + 2 * balance * Math.sin(Math.PI * u + t) * Math.sin(Math.PI * 2 * v - t);
    }
    const strength = d.pattern === 'scatter' ? Math.min(1, .65 * spread) : Math.exp(-Math.abs(value) * (d.pattern === 'cloud' ? 2.4 : 3.2) / spread);
    const gate = rand(), mix = rand(), size = (.45 + rand()) * d.size * w / 700;
    if (gate > strength) continue;
    const color = `rgb(${a.map((n, k) => Math.round(n + (b[k] - n) * mix)).join(',')})`;
    draw(x * w, y * h, size, color, .35 + strength * .65);
  }
}
function textBounds(c: CanvasRenderingContext2D, b: TextBlock, w: number, h: number) {
  c.font = font(b, w);
  const width = Math.max(12, ...b.text.split('\n').map(line => c.measureText(line).width));
  const left = b.x * w - (b.align === 'center' ? width / 2 : b.align === 'right' ? width : 0);
  return { x: left, y: b.y * h, width, height: Math.max(1, b.text.split('\n').length) * w * b.size / 100 * 1.12 };
}
function imageBounds(b: ImageBlock, w: number, h: number) {
  return { x: b.x * w, y: b.y * h, width: b.width * w, height: b.width * w * b.aspect };
}
function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => { const img = new Image(); img.onload = () => resolve(img); img.onerror = () => reject(new Error('Image could not be loaded.')); img.src = src; });
}
async function ensureImages(d: Design, cache: Map<string, HTMLImageElement>) {
  await Promise.all((d.images ?? []).map(async b => { if (!cache.has(b.src)) cache.set(b.src, await loadImage(b.src)); }));
}
async function importImage(file: File): Promise<Omit<ImageBlock, 'id' | 'x' | 'y' | 'width'>> {
  if (file.size > 10 * 1024 * 1024 || !/image\/(png|jpeg|webp|svg\+xml)/.test(file.type)) throw new Error('Choose a PNG, JPG, WebP or SVG under 10 MB.');
  const url = URL.createObjectURL(file);
  try {
    const img = await loadImage(url);
    if (!img.naturalWidth || !img.naturalHeight) throw new Error('Image has no dimensions.');
    const scale = Math.min(1, 2400 / Math.max(img.naturalWidth, img.naturalHeight));
    const out = document.createElement('canvas'); out.width = Math.max(1, Math.round(img.naturalWidth * scale)); out.height = Math.max(1, Math.round(img.naturalHeight * scale));
    const c = out.getContext('2d'); if (!c) throw new Error('Canvas is unavailable.');
    c.drawImage(img, 0, 0, out.width, out.height);
    const src = out.toDataURL('image/png');
    if (src.length > 8 * 1024 * 1024) throw new Error('This image is too large. Try a smaller version.');
    return { name: file.name, src, aspect: img.naturalHeight / img.naturalWidth };
  } finally { URL.revokeObjectURL(url); }
}
function paint(canvas: HTMLCanvasElement, d: Design, w: number, h: number, images: Map<string, HTMLImageElement> = new Map()) {
  canvas.width = w; canvas.height = h;
  const c = canvas.getContext('2d'); if (!c) throw new Error('Canvas is unavailable in this browser.');
  c.fillStyle = d.background; c.fillRect(0, 0, w, h);
  particles(d, w, h, (x, y, s, color, alpha) => { c.globalAlpha = alpha; c.fillStyle = color; c.fillRect(x, y, s, s); });
  c.globalAlpha = 1; c.textBaseline = 'top';
  for (const b of d.blocks) { c.font = font(b, w); c.fillStyle = b.color; c.textAlign = b.align; b.text.split('\n').forEach((line, i) => c.fillText(line, b.x * w, b.y * h + i * w * b.size / 100 * 1.12)); }
  for (const b of d.images ?? []) {
    const img = images.get(b.src); if (!img) throw new Error('An image is still loading.');
    const bounds = imageBounds(b, w, h); c.drawImage(img, bounds.x, bounds.y, bounds.width, bounds.height);
  }
}
function download(blob: Blob, name: string) { const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; a.click(); setTimeout(() => URL.revokeObjectURL(url), 1000); }
const escapeXML = (s: string) => s.replace(/[<>&"']/g, c => ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;', "'": '&apos;' }[c]!));
export default function PosterTool() {
  const [d, setD] = useState<Design>(initial), [selected, setSelected] = useState(2), [playing, setPlaying] = useState(false), [message, setMessage] = useState(''), [ready, setReady] = useState(false), [selectedImage, setSelectedImage] = useState<number | null>(null);
  const canvas = useRef<HTMLCanvasElement>(null), file = useRef<HTMLInputElement>(null), drag = useRef<{ id: number; kind: 'text' | 'image'; dx: number; dy: number } | null>(null);
  const imageFile = useRef<HTMLInputElement>(null), imageCache = useRef(new Map<string, HTMLImageElement>());
  const image = (d.images ?? []).find(b => b.id === selectedImage);
  const editImage = (patch: Partial<ImageBlock>) => setD(v => ({ ...v, images: (v.images ?? []).map(b => b.id === selectedImage ? { ...b, ...patch } : b) }));
  const dim = dimensions(d), block = d.blocks.find(b => b.id === selected);
  const update = (patch: Partial<Design>) => setD(v => ({ ...v, ...patch }));
  const edit = (patch: Partial<TextBlock>) => { setSelectedImage(null); setD(v => ({ ...v, blocks: v.blocks.map(b => b.id === selected ? { ...b, ...patch } : b) })); };
  useEffect(() => { try { const saved = localStorage.getItem('fsl-poster-v1'); if (saved) { const value = JSON.parse(saved); if (valid(value)) setD({ ...patternDefaults, ...value }); } } catch { /* Storage may be unavailable. */ } setReady(true); }, []);
  useEffect(() => { if (!ready) return; const timer = window.setTimeout(() => { try { localStorage.setItem('fsl-poster-v1', JSON.stringify(d)); } catch { setMessage('Automatic saving is full. Use Save design to keep your images.'); } }, 250); return () => window.clearTimeout(timer); }, [d, ready]);
  useEffect(() => {
    let cancelled = false;
    const render = async () => {
      try {
        await ensureImages(d, imageCache.current);
        if (cancelled || !canvas.current) return;
        const sources = new Set((d.images ?? []).map(b => b.src));
        for (const src of imageCache.current.keys()) if (!sources.has(src)) imageCache.current.delete(src);
        const el = canvas.current; paint(el, d, 800, Math.round(800 * dim.h / dim.w), imageCache.current);
        const c = el.getContext('2d'), active = d.blocks.find(b => b.id === selected), activeImage = (d.images ?? []).find(b => b.id === selectedImage);
        if (c && (activeImage || active)) {
          const bounds = activeImage ? imageBounds(activeImage, el.width, el.height) : textBounds(c, active!, el.width, el.height);
          c.save(); c.strokeStyle = '#ffb000'; c.lineWidth = 1.5; c.setLineDash([6, 4]);
          c.strokeRect(bounds.x - 5, bounds.y - 5, bounds.width + 10, bounds.height + 10); c.restore();
        }
      } catch { if (!cancelled) setMessage('An image could not be rendered. Remove it or upload it again.'); }
    };
    void render(); return () => { cancelled = true; };
  }, [d, dim.h, dim.w, selected, selectedImage]);
  useEffect(() => {
    if (!playing || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    let frame = 0, previous = 0;
    const tick = (now: number) => {
      if (document.hidden) previous = now;
      else if (!previous) previous = now;
      else if (now - previous >= 100) {
        const elapsed = Math.min((now - previous) / 1000, .25); previous = now;
        setD(v => ({ ...v, phase: v.phase + elapsed * .18 * (v.speed ?? 1) }));
      }
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick); return () => cancelAnimationFrame(frame);
  }, [playing]);
  function point(e: PointerEvent<HTMLCanvasElement>) { const r = e.currentTarget.getBoundingClientRect(); return { x: (e.clientX - r.left) / r.width, y: (e.clientY - r.top) / r.height }; }
  function start(e: PointerEvent<HTMLCanvasElement>) {
    const p = point(e), c = e.currentTarget.getContext('2d'); if (!c) return;
    const w = e.currentTarget.width, h = e.currentTarget.height;
    const padding = 10 * w / e.currentTarget.getBoundingClientRect().width;
    const imageHit = [...(d.images ?? [])].reverse().find(b => {
      const bounds = imageBounds(b, w, h);
      return p.x * w >= bounds.x - padding && p.x * w <= bounds.x + bounds.width + padding && p.y * h >= bounds.y - padding && p.y * h <= bounds.y + bounds.height + padding;
    });
    if (imageHit) {
      e.preventDefault(); setPlaying(false); setSelectedImage(imageHit.id); setSelected(0);
      drag.current = { id: imageHit.id, kind: 'image', dx: p.x - imageHit.x, dy: p.y - imageHit.y };
      e.currentTarget.setPointerCapture(e.pointerId); return;
    }
    const hit = [...d.blocks].reverse().find(b => {
      const bounds = textBounds(c, b, w, h);
      return p.x * w >= bounds.x - padding && p.x * w <= bounds.x + bounds.width + padding && p.y * h >= bounds.y - padding && p.y * h <= bounds.y + bounds.height + padding;
    });
    if (hit) {
      e.preventDefault(); setPlaying(false); setSelected(hit.id); setSelectedImage(null);
      drag.current = { id: hit.id, kind: 'text', dx: p.x - hit.x, dy: p.y - hit.y };
      e.currentTarget.setPointerCapture(e.pointerId);
    }
  }
  function move(e: PointerEvent<HTMLCanvasElement>) {
    const active = drag.current; if (!active) return; const p = point(e);
    const position = { x: Math.max(0, Math.min(1, p.x - active.dx)), y: Math.max(0, Math.min(.98, p.y - active.dy)) };
    setD(v => active.kind === 'image' ? { ...v, images: (v.images ?? []).map(b => b.id === active.id ? { ...b, ...position } : b) } : { ...v, blocks: v.blocks.map(b => b.id === active.id ? { ...b, ...position } : b) });
  }
  async function addImage(file: File) {
    setMessage('Loading image…');
    try {
      const imported = await importImage(file);
      const images = d.images ?? [];
      if (images.length >= 20 || images.reduce((sum, b) => sum + b.src.length, 0) + imported.src.length > 24 * 1024 * 1024) throw new Error('Too many images in this design. Remove an image first.');
      const id = Math.max(0, ...images.map(b => b.id)) + 1;
      update({ images: [...images, { ...imported, id, x: .1, y: .4, width: .25 }] });
      setSelectedImage(id); setSelected(0); setMessage('Image added. Drag it in the preview or use the sliders.');
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Could not add this image.'); }
  }
  async function exportPNG() { setPlaying(false); setMessage('Preparing PNG…'); try { const out = document.createElement('canvas'); await ensureImages(d, imageCache.current); paint(out, d, dim.w, dim.h, imageCache.current); const blob = await new Promise<Blob | null>(resolve => out.toBlob(resolve, 'image/png')); if (!blob) throw new Error('Export failed.'); download(blob, `fsl-${d.format}.png`); setMessage('PNG downloaded.'); } catch { setMessage('Could not export. Try a smaller format.'); } }
  function exportSVG() {
    setPlaying(false); const parts = [`<svg xmlns="http://www.w3.org/2000/svg" width="${dim.w}" height="${dim.h}" viewBox="0 0 ${dim.w} ${dim.h}"><rect width="100%" height="100%" fill="${d.background}"/>`];
    particles(d, dim.w, dim.h, (x, y, s, color, alpha) => parts.push(`<rect x="${x.toFixed(2)}" y="${y.toFixed(2)}" width="${s.toFixed(2)}" height="${s.toFixed(2)}" fill="${color}" opacity="${alpha.toFixed(2)}"/>`));
    for (const b of d.blocks) b.text.split('\n').forEach((line, i) => parts.push(`<text x="${b.x * dim.w}" y="${b.y * dim.h + (i * 1.12 + .85) * dim.w * b.size / 100}" font-family="Arial, Helvetica, sans-serif" font-size="${dim.w * b.size / 100}" font-weight="${b.bold ? 700 : 400}" text-anchor="${b.align === 'center' ? 'middle' : b.align === 'right' ? 'end' : 'start'}" fill="${b.color}">${escapeXML(line)}</text>`));
    for (const b of d.images ?? []) {
      const bounds = imageBounds(b, dim.w, dim.h);
      parts.push(`<image x="${bounds.x}" y="${bounds.y}" width="${bounds.width}" height="${bounds.height}" href="${escapeXML(b.src)}" preserveAspectRatio="none"/>`);
    }
    parts.push('</svg>'); download(new Blob(parts, { type: 'image/svg+xml' }), `fsl-${d.format}.svg`); setMessage('Editable SVG downloaded.');
  }
  return <main className={styles.tool}>
    <div className={styles.layout}><aside className={styles.controls} aria-label="Poster controls">
      <fieldset><legend>01 / Canvas</legend><label>Format<select value={d.format} onChange={e => update({ format: e.target.value })}>{Object.entries(formats).map(([key, f]) => <option key={key} value={key}>{f.label}</option>)}</select></label><label className={styles.check}><input type="checkbox" checked={d.landscape} onChange={e => update({ landscape: e.target.checked })} />Landscape</label><p>{dim.w} × {dim.h} px{d.format.startsWith('a') ? ' · 300 ppi equivalent' : ''}</p></fieldset>
      <fieldset><legend>02 / Particles</legend><label>Pattern<select value={d.pattern} onChange={e => update({ pattern: e.target.value })}>{patterns.map(([key, name]) => <option key={key} value={key}>{name}</option>)}</select></label>
        <div className={styles.colors}>{(['background', 'a', 'b'] as const).map((key, i) => <label key={key}>{['Paper', 'Colour 1', 'Colour 2'][i]}<input type="color" value={d[key]} onChange={e => update({ [key]: e.target.value })} /></label>)}</div>
        <div className={styles.buttons}><button onClick={() => update({ a: '#ffb000', b: '#ff3900', background: '#080808' })}>Ember</button><button onClick={() => update({ a: '#2828ff', b: '#ff39df', background: '#080808' })}>Electric</button><button onClick={() => update({ a: '#4ca878', b: '#d9ef62', background: '#080d09' })}>Moss</button></div>
        <label>Density<input type="range" min="2000" max="40000" step="1000" value={d.density} onChange={e => update({ density: +e.target.value })} /></label><label>Particle size<input type="range" min=".5" max="4" step=".1" value={d.size} onChange={e => update({ size: +e.target.value })} /></label><label>Wave phase<input type="range" min="0" max="6.28" step=".01" value={d.phase % 6.28} onChange={e => { setPlaying(false); update({ phase: +e.target.value }); }} /></label>
        <label>Animation speed · {(d.speed ?? 1).toFixed(2)}×<input type="range" min="0" max="30" step=".1" value={d.speed ?? 1} onChange={e => update({ speed: +e.target.value })} /><small>0 = still; 1 = original speed; 30 = fastest.</small></label>
        {parameterControls.map(control => <label key={control.key}>{control.label} · {(d[control.key] ?? patternDefaults[control.key]).toFixed(control.key === 'rotation' ? 0 : 2)}{control.key === 'rotation' ? '°' : ''}<input type="range" min={control.min} max={control.max} step={control.step} value={d[control.key] ?? patternDefaults[control.key]} onChange={e => update({ [control.key]: +e.target.value })} /><small>{control.hint}</small></label>)}
        <p>Scatter uses speed and spread; the wave-shape controls apply to the other patterns.</p>
        <div className={styles.buttons}><button onClick={() => update({ ...patternDefaults })}>Reset parameters</button></div>
        <div className={styles.buttons}><button onClick={() => update({ seed: Math.floor(Math.random() * 100000) })}>New composition</button><button aria-pressed={playing} onClick={() => setPlaying(v => !v)}>{playing ? 'Freeze' : 'Animate'}</button></div>
      </fieldset>
      <fieldset><legend>03 / Typography</legend><label>Text block<select value={selected} onChange={e => { setSelected(+e.target.value); setSelectedImage(null); }}>{d.blocks.map((b, i) => <option key={b.id} value={b.id}>{i + 1}. {b.text.slice(0, 24) || 'Empty block'}</option>)}</select></label>
        <div className={styles.buttons}><button onClick={() => { const id = Math.max(0, ...d.blocks.map(b => b.id)) + 1; update({ blocks: [...d.blocks, { id, text: 'Your text here', x: .05, y: .5, size: 5, color: '#ffffff', bold: false, align: 'left' }] }); setSelected(id); setSelectedImage(null); }}>Add text</button><button disabled={!block} onClick={() => { const remaining = d.blocks.filter(b => b.id !== selected); update({ blocks: remaining }); setSelected(remaining[0]?.id ?? 0); }}>Remove</button></div>
        {block && <><label>Text (line breaks supported)<textarea rows={5} value={block.text} onChange={e => edit({ text: e.target.value })} /></label><div className={styles.colors}><label>Text colour<input type="color" value={block.color} onChange={e => edit({ color: e.target.value })} /></label><label className={styles.check}><input type="checkbox" checked={block.bold} onChange={e => edit({ bold: e.target.checked })} />Bold</label></div><label>Type size<input type="range" min="1" max="20" step=".1" value={block.size} onChange={e => edit({ size: +e.target.value })} /></label><label>Alignment<select value={block.align} onChange={e => edit({ align: e.target.value as CanvasTextAlign })}><option value="left">Left</option><option value="center">Centre</option><option value="right">Right</option></select></label>{(['x', 'y'] as const).map(key => <label key={key}>{key === 'x' ? 'Horizontal position' : 'Vertical position'}<input type="range" min="0" max="1" step=".005" value={block[key]} onChange={e => edit({ [key]: +e.target.value })} /></label>)}</>}
      </fieldset>
      <fieldset><legend>04 / Images &amp; logos</legend>
        <div className={styles.buttons}><button onClick={() => imageFile.current?.click()}>Upload image / logo</button></div>
        <input ref={imageFile} type="file" accept="image/png,image/jpeg,image/webp,image/svg+xml" hidden onChange={async e => { const input = e.currentTarget, f = input.files?.[0]; if (f) await addImage(f); input.value = ''; }} />
        <p>PNG, JPG, WebP or SVG. Transparent logos keep their transparency.</p>
        {(d.images ?? []).length > 0 && <label>Image<select value={selectedImage ?? ''} onChange={e => { setSelectedImage(+e.target.value); setSelected(0); }}><option value="" disabled>Select an image</option>{(d.images ?? []).map(b => <option key={b.id} value={b.id}>{b.name}</option>)}</select></label>}
        {image && <><label>Image width · {Math.round(image.width * 100)}%<input type="range" min=".02" max="1" step=".005" value={image.width} onChange={e => editImage({ width: +e.target.value })} /><small>Aspect ratio stays locked.</small></label>{(['x', 'y'] as const).map(key => <label key={key}>{key === 'x' ? 'Horizontal position' : 'Vertical position'}<input type="range" min="0" max="1" step=".005" value={image[key]} onChange={e => editImage({ [key]: +e.target.value })} /></label>)}<div className={styles.buttons}><button onClick={() => { update({ images: (d.images ?? []).filter(b => b.id !== selectedImage) }); setSelectedImage(null); }}>Remove image</button></div></>}
      </fieldset>
      <fieldset><legend>05 / Take it with you</legend><div className={styles.buttons}><button onClick={exportPNG}>Download PNG</button><button onClick={exportSVG}>Editable SVG</button><button onClick={() => download(new Blob([JSON.stringify(d, null, 2)], { type: 'application/json' }), 'fsl-poster.json')}>Save design</button><button onClick={() => file.current?.click()}>Load design</button></div><input ref={file} type="file" accept=".json,application/json" hidden onChange={async e => { const f = e.target.files?.[0]; if (!f) return; try { const value: unknown = JSON.parse(await f.text()); if (!valid(value)) throw new Error(); setPlaying(false); setD({ ...patternDefaults, ...value }); setSelected(value.blocks[0]?.id ?? 0); setSelectedImage(null); setMessage('Design loaded.'); } catch { setMessage('This file is not a valid FSL design.'); } e.target.value = ''; }} /><p role="status">{message}</p></fieldset>
    </aside><section className={styles.stage} aria-label="Poster preview"><div className={styles.preview}><canvas ref={canvas} onPointerDown={start} onPointerMove={move} onPointerUp={() => { drag.current = null; }} onPointerCancel={() => { drag.current = null; }} onLostPointerCapture={() => { drag.current = null; }} aria-label="Poster preview. Drag text or images to position them, or use the position sliders." /></div><p>Drag text or images to move them. Freeze the pattern to capture a moment.<br />Use Save design to keep a copy, including uploaded images.</p></section></div>
  </main>;
}
function valid(value: unknown): value is Design {
  if (!value || typeof value !== 'object') return false;
  const d = value as Design, color = (s: unknown) => typeof s === 'string' && /^#[0-9a-f]{6}$/i.test(s), num = (n: unknown, min: number, max: number) => typeof n === 'number' && Number.isFinite(n) && n >= min && n <= max;
  const images = d.images;
  const validImages = images === undefined || (Array.isArray(images) && images.length <= 20 && images.every(b => b && typeof b === 'object' && num(b.id, 0, 1e9) && typeof b.name === 'string' && b.name.length <= 500 && typeof b.src === 'string' && /^data:image\/(png|jpeg|webp);base64,[A-Za-z0-9+/=]+$/.test(b.src) && b.src.length <= 8 * 1024 * 1024 && num(b.x, 0, 1) && num(b.y, 0, 1) && num(b.width, .02, 1) && num(b.aspect, .0001, 10000)) && new Set(images.map(b => b.id)).size === images.length && images.reduce((sum, b) => sum + b.src.length, 0) <= 24 * 1024 * 1024);
  return validImages && (d.speed === undefined || num(d.speed, 0, 30)) && parameterControls.every(control => d[control.key] === undefined || num(d[control.key], control.min, control.max)) && Object.prototype.hasOwnProperty.call(formats, d.format) && typeof d.landscape === 'boolean' && color(d.background) && color(d.a) && color(d.b) && num(d.density, 2000, 40000) && num(d.size, .5, 4) && patterns.some(([key]) => key === d.pattern) && num(d.seed, 0, 4294967295) && num(d.phase, 0, 1e9) && Array.isArray(d.blocks) && d.blocks.length <= 100 && new Set(d.blocks.map(b => b.id)).size === d.blocks.length && d.blocks.every(b => num(b.id, 0, 1e9) && typeof b.text === 'string' && b.text.length <= 20000 && num(b.x, 0, 1) && num(b.y, 0, 1) && num(b.size, 1, 20) && color(b.color) && typeof b.bold === 'boolean' && ['left', 'center', 'right'].includes(b.align));
}

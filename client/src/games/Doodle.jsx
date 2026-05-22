import { useEffect, useRef, useState } from 'react';

const COLORS = ['#FF6B9D','#C77DFF','#FFD700','#06D6A0','#FFB347','#3D1A47','#ffffff'];
const PROMPTS = ['Cat in space','Sparkly star','Ice-cream cone','Rainbow heart','Pineapple','Butterfly','Boba tea','Cute ghost','Cherry blossom','Smiling moon'];

export default function Doodle() {
  const canvasRef = useRef(null);
  const drawing = useRef(false);
  const last = useRef({ x: 0, y: 0 });
  const [color, setColor] = useState(COLORS[0]);
  const [size, setSize] = useState(6);
  const [prompt, setPrompt] = useState(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]);

  useEffect(() => {
    const c = canvasRef.current;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff';
    ctx.fillRect(0, 0, c.width, c.height);
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
  }, []);

  function pos(e) {
    const c = canvasRef.current;
    const rect = c.getBoundingClientRect();
    const t = e.touches?.[0];
    const x = ((t?.clientX ?? e.clientX) - rect.left) * (c.width / rect.width);
    const y = ((t?.clientY ?? e.clientY) - rect.top) * (c.height / rect.height);
    return { x, y };
  }

  function down(e) { e.preventDefault(); drawing.current = true; last.current = pos(e); }
  function move(e) {
    if (!drawing.current) return;
    e.preventDefault();
    const p = pos(e);
    const ctx = canvasRef.current.getContext('2d');
    ctx.strokeStyle = color; ctx.lineWidth = size;
    ctx.beginPath(); ctx.moveTo(last.current.x, last.current.y); ctx.lineTo(p.x, p.y); ctx.stroke();
    last.current = p;
  }
  function up() { drawing.current = false; }

  function clear() {
    const c = canvasRef.current; const ctx = c.getContext('2d');
    ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, c.width, c.height);
  }
  function save() {
    const a = document.createElement('a');
    a.download = `doodle-${Date.now()}.png`;
    a.href = canvasRef.current.toDataURL('image/png');
    a.click();
  }
  function newPrompt() { setPrompt(PROMPTS[Math.floor(Math.random() * PROMPTS.length)]); clear(); }

  return (
    <div className="card max-w-3xl mx-auto">
      <div className="flex flex-wrap items-center gap-3 mb-3">
        <h2 className="font-display text-3xl">Doodle Pad</h2>
        <div className="ml-auto text-sm">
          Today's challenge: <span className="chip ml-1">{prompt}</span>
          <button onClick={newPrompt} className="ml-2 text-xs text-purple font-bold">↻ new</button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={900} height={500}
        onMouseDown={down} onMouseMove={move} onMouseUp={up} onMouseLeave={up}
        onTouchStart={down} onTouchMove={move} onTouchEnd={up}
        className="w-full rounded-2xl border-2 border-pink-light/60 cursor-crosshair touch-none bg-white"
        style={{ aspectRatio: '9/5' }}
      />
      <div className="flex flex-wrap items-center gap-3 mt-3">
        <div className="flex gap-1">
          {COLORS.map((c) => (
            <button key={c} onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-ink scale-110' : 'border-white'}`}
              style={{ background: c }} />
          ))}
        </div>
        <label className="text-sm flex items-center gap-2">
          Size <input type="range" min="1" max="40" value={size} onChange={(e) => setSize(+e.target.value)} />
          <span className="font-bold w-6 text-right">{size}</span>
        </label>
        <div className="ml-auto flex gap-2">
          <button onClick={clear} className="btn-ghost">Clear</button>
          <button onClick={save} className="btn-primary">Save PNG</button>
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

const SIZE = 4;
const empty = () => Array.from({ length: SIZE }, () => Array(SIZE).fill(0));

function addRandom(grid) {
  const empties = [];
  for (let r = 0; r < SIZE; r++) for (let c = 0; c < SIZE; c++) if (!grid[r][c]) empties.push([r, c]);
  if (!empties.length) return grid;
  const [r, c] = empties[Math.floor(Math.random() * empties.length)];
  const g = grid.map((row) => [...row]);
  g[r][c] = Math.random() < 0.9 ? 2 : 4;
  return g;
}
function start() { return addRandom(addRandom(empty())); }

function slide(row) {
  const filtered = row.filter((v) => v);
  const out = [];
  let gained = 0;
  for (let i = 0; i < filtered.length; i++) {
    if (filtered[i] === filtered[i + 1]) {
      out.push(filtered[i] * 2); gained += filtered[i] * 2; i++;
    } else out.push(filtered[i]);
  }
  while (out.length < SIZE) out.push(0);
  return { row: out, gained };
}

function move(grid, dir) {
  let g = grid.map((r) => [...r]);
  let total = 0;
  if (dir === 'right') g = g.map((r) => r.reverse());
  if (dir === 'up') g = transpose(g);
  if (dir === 'down') g = transpose(g).map((r) => r.reverse());
  g = g.map((r) => {
    const { row, gained } = slide(r);
    total += gained; return row;
  });
  if (dir === 'right') g = g.map((r) => r.reverse());
  if (dir === 'up') g = transpose(g);
  if (dir === 'down') g = transpose(g.map((r) => r.reverse()));
  return { grid: g, gained: total };
}

function transpose(g) { return g[0].map((_, c) => g.map((r) => r[c])); }
function eq(a, b) { return JSON.stringify(a) === JSON.stringify(b); }

const COLORS = {
  0: '#FFE7F4', 2: '#FFD6EC', 4: '#FFB3D1', 8: '#FF8FB8',
  16: '#FF6B9D', 32: '#E85B8B', 64: '#D14C7C',
  128: '#C77DFF', 256: '#B266F0', 512: '#9B4FE0',
  1024: '#FFD700', 2048: '#FFA500',
};

export default function Game2048() {
  const [grid, setGrid] = useState(start);
  const [score, setScore] = useState(0);
  const won = grid.flat().some((v) => v >= 2048);

  useEffect(() => {
    function onKey(e) {
      const map = { ArrowLeft: 'left', ArrowRight: 'right', ArrowUp: 'up', ArrowDown: 'down' };
      const dir = map[e.key];
      if (!dir) return;
      e.preventDefault();
      doMove(dir);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  function reset() { setGrid(start()); setScore(0); }

  function doMove(dir) {
    setGrid((g) => {
      const { grid: ng, gained } = move(g, dir);
      if (eq(g, ng)) return g;
      setScore((s) => s + gained);
      return addRandom(ng);
    });
  }

  const touchStart = useRef(null);
  function onTouchStart(e) {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }
  function onTouchEnd(e) {
    if (!touchStart.current) return;
    const t = e.changedTouches[0];
    const dx = t.clientX - touchStart.current.x;
    const dy = t.clientY - touchStart.current.y;
    touchStart.current = null;
    if (Math.abs(dx) < 18 && Math.abs(dy) < 18) return;
    if (Math.abs(dx) > Math.abs(dy)) doMove(dx > 0 ? 'right' : 'left');
    else doMove(dy > 0 ? 'down' : 'up');
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-3">
        <h2 className="font-display text-3xl">2048</h2>
        <div className="text-pink font-bold">Score: {score}</div>
      </div>
      <p className="text-xs text-ink-light mb-3">Arrow keys, swipe the board, or use the buttons.</p>
      {won && <div className="text-pink font-bold mb-2">🎉 You reached 2048!</div>}
      <div
        className="grid grid-cols-4 gap-2 bg-pink-pale p-2 rounded-2xl touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        {grid.flat().map((v, i) => (
          <div key={i}
            className="aspect-square rounded-xl flex items-center justify-center font-bold text-xl transition"
            style={{ background: COLORS[v] || '#000', color: v >= 8 ? '#fff' : '#3D1A47' }}>
            {v || ''}
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto mt-4 select-none">
        <span />
        <button onClick={() => doMove('up')} className="btn-ghost !py-2.5 text-xl" aria-label="Up">↑</button>
        <span />
        <button onClick={() => doMove('left')} className="btn-ghost !py-2.5 text-xl" aria-label="Left">←</button>
        <button onClick={() => doMove('down')} className="btn-ghost !py-2.5 text-xl" aria-label="Down">↓</button>
        <button onClick={() => doMove('right')} className="btn-ghost !py-2.5 text-xl" aria-label="Right">→</button>
      </div>
      <button onClick={reset} className="btn-primary mt-4">Reset</button>
    </div>
  );
}

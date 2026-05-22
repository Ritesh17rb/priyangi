import { useEffect, useRef, useState } from 'react';

const COLS = 20;
const ROWS = 20;
const TICK = 110;

function randomFood(snake) {
  while (true) {
    const f = { x: Math.floor(Math.random() * COLS), y: Math.floor(Math.random() * ROWS) };
    if (!snake.some((s) => s.x === f.x && s.y === f.y)) return f;
  }
}

export default function Snake() {
  const [snake, setSnake] = useState([{ x: 10, y: 10 }]);
  const [food, setFood] = useState({ x: 5, y: 5 });
  const [dir, setDir] = useState({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [over, setOver] = useState(false);
  const dirRef = useRef(dir);
  dirRef.current = dir;
  const touchStart = useRef(null);

  function turn(nd) {
    if (!nd) return;
    const cd = dirRef.current;
    if (cd.x + nd.x === 0 && cd.y + nd.y === 0) return;
    setDir(nd);
  }

  useEffect(() => {
    function onKey(e) {
      const map = {
        ArrowLeft: { x: -1, y: 0 }, ArrowRight: { x: 1, y: 0 },
        ArrowUp: { x: 0, y: -1 }, ArrowDown: { x: 0, y: 1 },
      };
      const nd = map[e.key];
      if (!nd) return;
      e.preventDefault();
      turn(nd);
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  useEffect(() => {
    if (!running || over) return;
    const t = setInterval(() => {
      setSnake((s) => {
        const head = { x: s[0].x + dirRef.current.x, y: s[0].y + dirRef.current.y };
        if (head.x < 0 || head.x >= COLS || head.y < 0 || head.y >= ROWS) { setOver(true); setRunning(false); return s; }
        if (s.some((p) => p.x === head.x && p.y === head.y)) { setOver(true); setRunning(false); return s; }
        const ns = [head, ...s];
        if (head.x === food.x && head.y === food.y) {
          setFood(randomFood(ns));
        } else ns.pop();
        return ns;
      });
    }, TICK);
    return () => clearInterval(t);
  }, [running, food, over]);

  function reset() {
    setSnake([{ x: 10, y: 10 }]); setDir({ x: 1, y: 0 }); setFood(randomFood([{ x: 10, y: 10 }]));
    setOver(false); setRunning(true);
  }

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
    if (Math.abs(dx) > Math.abs(dy)) turn({ x: dx > 0 ? 1 : -1, y: 0 });
    else turn({ x: 0, y: dy > 0 ? 1 : -1 });
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-3">
        <h2 className="font-display text-3xl">Snake</h2>
        <div className="text-pink font-bold">Length: {snake.length}</div>
      </div>
      <p className="text-xs text-ink-light mb-3">Arrow keys, swipe the board, or use the buttons.</p>
      <div className="grid mx-auto bg-pink-pale rounded-2xl overflow-hidden touch-none"
        onTouchStart={onTouchStart} onTouchEnd={onTouchEnd}
        style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)`, width: 'min(100%, 400px)', aspectRatio: '1' }}>
        {Array.from({ length: COLS * ROWS }).map((_, i) => {
          const x = i % COLS, y = Math.floor(i / COLS);
          const isHead = snake[0].x === x && snake[0].y === y;
          const isBody = !isHead && snake.some((s) => s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          return (
            <div key={i} className={`aspect-square ${
              isHead ? 'bg-pink' : isBody ? 'bg-pink-light' : isFood ? 'bg-purple' : ''
            }`} />
          );
        })}
      </div>
      {over && <div className="text-pink font-bold mt-3">💔 Game over! Score: {snake.length}</div>}
      <div className="flex gap-2 justify-center mt-4">
        {!running && !over && <button onClick={() => setRunning(true)} className="btn-primary">Start</button>}
        {running && <button onClick={() => setRunning(false)} className="btn-ghost">Pause</button>}
        <button onClick={reset} className="btn-purple">Reset</button>
      </div>
      <div className="grid grid-cols-3 gap-1.5 max-w-[210px] mx-auto mt-4 select-none">
        <span />
        <button onClick={() => turn({ x: 0, y: -1 })} className="btn-ghost !py-2.5 text-xl" aria-label="Up">↑</button>
        <span />
        <button onClick={() => turn({ x: -1, y: 0 })} className="btn-ghost !py-2.5 text-xl" aria-label="Left">←</button>
        <button onClick={() => turn({ x: 0, y: 1 })} className="btn-ghost !py-2.5 text-xl" aria-label="Down">↓</button>
        <button onClick={() => turn({ x: 1, y: 0 })} className="btn-ghost !py-2.5 text-xl" aria-label="Right">→</button>
      </div>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

const TOTAL = 16;

function shuffle() {
  return [...Array(TOTAL).keys()].map((n) => n + 1).sort(() => Math.random() - 0.5);
}

export default function NumberRush() {
  const [tiles, setTiles] = useState(shuffle);
  const [next, setNext] = useState(1);
  const [started, setStarted] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [wrong, setWrong] = useState(-1);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_numrush_best') || 0));
  const startTime = useRef(0);

  const done = next > TOTAL;

  useEffect(() => {
    if (!started || done) return undefined;
    const tick = setInterval(() => setElapsed((Date.now() - startTime.current) / 1000), 87);
    return () => clearInterval(tick);
  }, [started, done]);

  useEffect(() => {
    if (done && (best === 0 || elapsed < best)) {
      localStorage.setItem('priyangi_numrush_best', elapsed.toFixed(2));
      setBest(elapsed);
    }
  }, [done, elapsed, best]);

  function tap(n, i) {
    if (done) return;
    if (n !== next) {
      setWrong(i);
      setTimeout(() => setWrong(-1), 200);
      return;
    }
    if (n === 1) {
      startTime.current = Date.now();
      setStarted(true);
    }
    if (n === TOTAL) {
      setElapsed((Date.now() - startTime.current) / 1000);
    }
    setNext((v) => v + 1);
  }

  function reset() {
    setTiles(shuffle());
    setNext(1);
    setStarted(false);
    setElapsed(0);
    setWrong(-1);
  }

  return (
    <div className="card max-w-sm mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Number Rush</h2>
        <div className="text-pink font-bold">{best ? `Best: ${best.toFixed(2)}s` : ''}</div>
      </div>
      <div className="flex justify-between text-sm font-bold text-ink-light mb-3">
        <span>Find: <span className="text-pink text-base">{done ? '✓' : next}</span></span>
        <span>Time: <span className="text-purple text-base">{elapsed.toFixed(1)}s</span></span>
      </div>
      {done && <div className="text-pink font-bold mb-3">🎉 Done in {elapsed.toFixed(2)}s!</div>}
      <div className="grid grid-cols-4 gap-2">
        {tiles.map((n, i) => (
          <button
            key={n}
            onClick={() => tap(n, i)}
            className={`aspect-square rounded-xl text-xl font-bold transition ${
              n < next
                ? 'bg-pink/15 text-pink/40'
                : wrong === i
                ? 'bg-red-200 text-red-700'
                : 'bg-gradient-to-br from-pink to-purple text-white shadow-soft active:scale-95'
            }`}
          >
            {n}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-light mt-3">Tap 1 → 16 in order as fast as you can!</p>
      <button onClick={reset} className="btn-primary mt-4">{done ? 'Play again' : 'Shuffle'}</button>
    </div>
  );
}

import { useEffect, useRef, useState } from 'react';

export default function ReactionTime() {
  const [phase, setPhase] = useState('idle'); // idle | wait | go | result | early
  const [time, setTime] = useState(0);
  const [history, setHistory] = useState(() => {
    try { return JSON.parse(localStorage.getItem('priyangi_reaction') || '[]'); } catch { return []; }
  });
  const startedAt = useRef(0);
  const timer = useRef(null);

  useEffect(() => () => clearTimeout(timer.current), []);

  function begin() {
    setPhase('wait'); setTime(0);
    timer.current = setTimeout(() => {
      startedAt.current = performance.now();
      setPhase('go');
    }, 1500 + Math.random() * 2500);
  }

  function click() {
    if (phase === 'idle' || phase === 'result' || phase === 'early') return begin();
    if (phase === 'wait') {
      clearTimeout(timer.current);
      setPhase('early');
      return;
    }
    if (phase === 'go') {
      const t = Math.round(performance.now() - startedAt.current);
      setTime(t); setPhase('result');
      const next = [t, ...history].slice(0, 10);
      setHistory(next);
      localStorage.setItem('priyangi_reaction', JSON.stringify(next));
    }
  }

  const bg =
    phase === 'wait' ? 'bg-purple text-white' :
    phase === 'go' ? 'bg-green-400 text-white' :
    phase === 'early' ? 'bg-red-400 text-white' :
    phase === 'result' ? 'bg-pink text-white' :
    'bg-pink-pale text-ink';

  const msg =
    phase === 'idle' ? 'Click to start' :
    phase === 'wait' ? 'Wait for green…' :
    phase === 'go' ? 'CLICK NOW! ⚡' :
    phase === 'early' ? 'Too soon! Click to retry' :
    `${time} ms — click to try again`;

  const best = history.length ? Math.min(...history) : null;
  const avg = history.length ? Math.round(history.reduce((a, b) => a + b, 0) / history.length) : null;

  return (
    <div className="card max-w-md mx-auto text-center">
      <h2 className="font-display text-3xl mb-1">Reaction Time</h2>
      <p className="text-ink-light text-sm mb-4">Click as fast as you can when the box turns green.</p>
      <button
        onClick={click}
        className={`w-full h-56 rounded-3xl font-display text-2xl font-bold transition ${bg}`}
      >
        {msg}
      </button>
      {best !== null && (
        <div className="grid grid-cols-3 gap-2 mt-4 text-sm">
          <div className="bg-pink-pale rounded-xl py-2"><div className="text-pink font-bold">Best</div><div className="text-xl">{best} ms</div></div>
          <div className="bg-pink-pale rounded-xl py-2"><div className="text-pink font-bold">Avg</div><div className="text-xl">{avg} ms</div></div>
          <div className="bg-pink-pale rounded-xl py-2"><div className="text-pink font-bold">Tries</div><div className="text-xl">{history.length}</div></div>
        </div>
      )}
    </div>
  );
}

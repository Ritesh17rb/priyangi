import { useEffect, useRef, useState } from 'react';

const PADS = [
  { id: 0, color: '#FF6B9D', light: '#FFB3D1' },
  { id: 1, color: '#C77DFF', light: '#E8B4FF' },
  { id: 2, color: '#FFD700', light: '#FFEC99' },
  { id: 3, color: '#06D6A0', light: '#7BF7CB' },
];

export default function SimonSays() {
  const [seq, setSeq] = useState([]);
  const [phase, setPhase] = useState('idle'); // idle | show | input | over
  const [active, setActive] = useState(-1);
  const [step, setStep] = useState(0);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_simon_best') || 0));
  const timer = useRef(null);

  function start() {
    setSeq([Math.floor(Math.random() * 4)]);
    setStep(0);
    setPhase('show');
  }

  useEffect(() => {
    if (phase !== 'show') return;
    let i = 0;
    const tick = () => {
      if (i >= seq.length) {
        setActive(-1);
        setPhase('input');
        setStep(0);
        return;
      }
      setActive(seq[i]);
      timer.current = setTimeout(() => {
        setActive(-1);
        timer.current = setTimeout(() => { i++; tick(); }, 200);
      }, 500);
    };
    timer.current = setTimeout(tick, 500);
    return () => clearTimeout(timer.current);
  }, [phase, seq]);

  function press(id) {
    if (phase !== 'input') return;
    setActive(id);
    setTimeout(() => setActive(-1), 200);
    if (seq[step] === id) {
      const next = step + 1;
      if (next === seq.length) {
        if (seq.length > best) {
          setBest(seq.length);
          localStorage.setItem('priyangi_simon_best', String(seq.length));
        }
        setTimeout(() => {
          setSeq((s) => [...s, Math.floor(Math.random() * 4)]);
          setPhase('show');
        }, 600);
      } else {
        setStep(next);
      }
    } else {
      setPhase('over');
    }
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Simon Says</h2>
        <div className="text-pink font-bold">Best: {best}</div>
      </div>
      <div className="text-ink-light mb-3">
        {phase === 'idle' ? 'Press start to begin' :
         phase === 'show' ? 'Watch carefully…' :
         phase === 'input' ? `Your turn — ${step}/${seq.length}` :
         `💔 Game over — score: ${seq.length - 1}`}
      </div>
      <div className="grid grid-cols-2 gap-3 max-w-xs mx-auto">
        {PADS.map((p) => (
          <button
            key={p.id}
            onClick={() => press(p.id)}
            className="aspect-square rounded-2xl transition shadow-soft"
            style={{
              background: active === p.id ? p.light : p.color,
              transform: active === p.id ? 'scale(0.96)' : 'scale(1)',
              boxShadow: active === p.id ? `0 0 30px ${p.color}` : '',
            }}
          />
        ))}
      </div>
      {phase === 'idle' || phase === 'over' ? (
        <button onClick={start} className="btn-primary mt-5">Start</button>
      ) : (
        <div className="mt-5 text-2xl font-bold text-pink">Round {seq.length}</div>
      )}
    </div>
  );
}

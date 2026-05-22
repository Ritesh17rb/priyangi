import { useEffect, useState } from 'react';

const GAME_TIME = 30;
const COLORS = ['#FF6B9D', '#C77DFF', '#FFD700', '#06D6A0', '#FFB347', '#7BC4FF'];

let bubbleId = 1;

function makeBubble() {
  return {
    id: bubbleId++,
    left: 6 + Math.random() * 78,
    size: 44 + Math.random() * 36,
    color: COLORS[Math.floor(Math.random() * COLORS.length)],
    duration: 3.4 + Math.random() * 2.8,
  };
}

export default function BubblePop() {
  const [bubbles, setBubbles] = useState([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_bubble_best') || 0));

  function start() {
    setBubbles([]);
    setScore(0);
    setTimeLeft(GAME_TIME);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return undefined;
    const spawn = setInterval(() => setBubbles((bs) => [...bs, makeBubble()]), 600);
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(spawn);
      clearInterval(tick);
    };
  }, [running]);

  useEffect(() => {
    if (!running && timeLeft === 0) {
      setBubbles([]);
      if (score > best) {
        localStorage.setItem('priyangi_bubble_best', String(score));
        setBest(score);
      }
    }
  }, [running, timeLeft, score, best]);

  function pop(id) {
    if (!running) return;
    setBubbles((bs) => bs.filter((b) => b.id !== id));
    setScore((s) => s + 1);
  }

  function remove(id) {
    setBubbles((bs) => bs.filter((b) => b.id !== id));
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Bubble Pop</h2>
        <div className="text-pink font-bold">Best: {best}</div>
      </div>
      <div className="flex justify-between text-sm font-bold text-ink-light mb-3">
        <span>Popped: <span className="text-pink text-base">{score}</span></span>
        <span>Time: <span className="text-purple text-base">{timeLeft}s</span></span>
      </div>
      <div
        className="relative mx-auto w-full overflow-hidden rounded-2xl bg-gradient-to-b from-purple-light/40 to-pink-pale"
        style={{ aspectRatio: '3 / 4' }}
      >
        {bubbles.map((b) => (
          <button
            key={b.id}
            onClick={() => pop(b.id)}
            onAnimationEnd={() => remove(b.id)}
            className="absolute rounded-full"
            style={{
              left: `${b.left}%`,
              width: b.size,
              height: b.size,
              background: `radial-gradient(circle at 32% 30%, rgba(255,255,255,0.85), ${b.color})`,
              animation: `bubble-rise ${b.duration}s linear forwards`,
            }}
          />
        ))}
        {!running && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-white/45 backdrop-blur-[1px]">
            <div className="font-display text-2xl text-ink px-4">
              {timeLeft === 0 ? `Time's up! You popped ${score} 🫧` : 'Pop the bubbles!'}
            </div>
            <button onClick={start} className="btn-primary">
              {timeLeft === 0 ? 'Play again' : 'Start'}
            </button>
          </div>
        )}
      </div>
      <p className="text-xs text-ink-light mt-3">Tap bubbles before they float away.</p>
    </div>
  );
}

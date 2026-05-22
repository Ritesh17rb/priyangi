import { useEffect, useState } from 'react';

const GAME_TIME = 30;
const CRITTERS = ['🐹', '🌟', '💖', '🦄', '🍓', '🐰'];

export default function WhackAMole() {
  const [active, setActive] = useState(-1);
  const [critter, setCritter] = useState('🐹');
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [running, setRunning] = useState(false);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_whack_best') || 0));

  function popMole() {
    setActive(Math.floor(Math.random() * 9));
    setCritter(CRITTERS[Math.floor(Math.random() * CRITTERS.length)]);
  }

  function start() {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setRunning(true);
    popMole();
  }

  useEffect(() => {
    if (!running) return undefined;
    const move = setInterval(popMole, 820);
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false);
          setActive(-1);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => {
      clearInterval(move);
      clearInterval(tick);
    };
  }, [running]);

  useEffect(() => {
    if (!running && timeLeft === 0 && score > best) {
      localStorage.setItem('priyangi_whack_best', String(score));
      setBest(score);
    }
  }, [running, timeLeft, score, best]);

  function whack(i) {
    if (!running || i !== active) return;
    setScore((s) => s + 1);
    popMole();
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Whack-a-Sparkle</h2>
        <div className="text-pink font-bold">Best: {best}</div>
      </div>
      <div className="flex justify-between text-sm font-bold text-ink-light mb-3">
        <span>Score: <span className="text-pink text-base">{score}</span></span>
        <span>Time: <span className="text-purple text-base">{timeLeft}s</span></span>
      </div>
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <button
            key={i}
            onClick={() => whack(i)}
            className={`aspect-square rounded-2xl flex items-center justify-center text-4xl sm:text-5xl transition ${
              i === active
                ? 'bg-gradient-to-br from-pink-light to-purple-light scale-105 shadow-pinky'
                : 'bg-pink-pale'
            }`}
          >
            {i === active ? critter : ''}
          </button>
        ))}
      </div>
      {running ? (
        <p className="text-xs text-ink-light mt-3">Tap the sparkle before it hops away!</p>
      ) : (
        <button onClick={start} className="btn-primary mt-4">
          {timeLeft === 0 ? `Play again — last run: ${score}` : 'Start'}
        </button>
      )}
    </div>
  );
}

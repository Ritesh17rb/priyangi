import { useEffect, useState } from 'react';

const COLORS = [
  { name: 'RED', value: '#ef4444' },
  { name: 'BLUE', value: '#3b82f6' },
  { name: 'GREEN', value: '#22c55e' },
  { name: 'PINK', value: '#ff6b9d' },
  { name: 'PURPLE', value: '#c77dff' },
  { name: 'ORANGE', value: '#f97316' },
];
const GAME_TIME = 30;

function makeRound() {
  const word = COLORS[Math.floor(Math.random() * COLORS.length)];
  const match = Math.random() < 0.5;
  const ink = match
    ? word
    : COLORS[(COLORS.indexOf(word) + 1 + Math.floor(Math.random() * (COLORS.length - 1))) % COLORS.length];
  return { word: word.name, ink: ink.value, match };
}

export default function ColorMatch() {
  const [round, setRound] = useState(makeRound);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState(null);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_color_best') || 0));

  function start() {
    setScore(0);
    setTimeLeft(GAME_TIME);
    setRound(makeRound());
    setFlash(null);
    setRunning(true);
  }

  useEffect(() => {
    if (!running) return undefined;
    const tick = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) {
          setRunning(false);
          return 0;
        }
        return t - 1;
      });
    }, 1000);
    return () => clearInterval(tick);
  }, [running]);

  useEffect(() => {
    if (!running && timeLeft === 0 && score > best) {
      localStorage.setItem('priyangi_color_best', String(score));
      setBest(score);
    }
  }, [running, timeLeft, score, best]);

  function guess(saysMatch) {
    if (!running || flash) return;
    const correct = saysMatch === round.match;
    setFlash(correct ? 'right' : 'wrong');
    setScore((s) => (correct ? s + 1 : Math.max(0, s - 1)));
    setTimeout(() => {
      setFlash(null);
      setRound(makeRound());
    }, 220);
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Color Match</h2>
        <div className="text-pink font-bold">Best: {best}</div>
      </div>
      <div className="flex justify-between text-sm font-bold text-ink-light mb-2">
        <span>Score: <span className="text-pink text-base">{score}</span></span>
        <span>Time: <span className="text-purple text-base">{timeLeft}s</span></span>
      </div>
      <p className="text-xs text-ink-light mb-4">Does the <b>word</b> match its <b>ink colour</b>?</p>

      {running ? (
        <>
          <div
            className={`my-8 font-display text-6xl font-bold transition ${flash ? 'scale-90' : 'scale-100'}`}
            style={{ color: round.ink }}
          >
            {round.word}
          </div>
          <div className="grid grid-cols-2 gap-3">
            <button onClick={() => guess(true)} className="btn-primary !py-4 text-xl">✓ Match</button>
            <button onClick={() => guess(false)} className="btn-purple !py-4 text-xl">✗ Nope</button>
          </div>
        </>
      ) : (
        <div className="py-8">
          <div className="font-display text-2xl text-ink mb-4">
            {timeLeft === 0 ? `Time's up! Score: ${score}` : 'Quick — match or not?'}
          </div>
          <button onClick={start} className="btn-primary">
            {timeLeft === 0 ? 'Play again' : 'Start'}
          </button>
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';

const GAME_TIME = 30;

function makeProblem() {
  const ops = ['+', '-', '×'];
  const op = ops[Math.floor(Math.random() * ops.length)];
  let a = Math.floor(Math.random() * 12) + 1;
  let b = Math.floor(Math.random() * 12) + 1;
  let answer;
  if (op === '+') {
    answer = a + b;
  } else if (op === '-') {
    if (b > a) [a, b] = [b, a];
    answer = a - b;
  } else {
    a = Math.floor(Math.random() * 9) + 2;
    b = Math.floor(Math.random() * 9) + 2;
    answer = a * b;
  }
  const opts = new Set([answer]);
  while (opts.size < 4) {
    const delta = Math.floor(Math.random() * 9) - 4 || 5;
    const wrong = answer + delta;
    if (wrong >= 0) opts.add(wrong);
  }
  return { text: `${a} ${op} ${b}`, answer, options: [...opts].sort(() => Math.random() - 0.5) };
}

export default function QuickMath() {
  const [problem, setProblem] = useState(makeProblem);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timeLeft, setTimeLeft] = useState(GAME_TIME);
  const [running, setRunning] = useState(false);
  const [flash, setFlash] = useState(null);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_math_best') || 0));

  function start() {
    setScore(0);
    setStreak(0);
    setTimeLeft(GAME_TIME);
    setProblem(makeProblem());
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
      localStorage.setItem('priyangi_math_best', String(score));
      setBest(score);
    }
  }, [running, timeLeft, score, best]);

  function answer(value) {
    if (!running || flash) return;
    const correct = value === problem.answer;
    setFlash({ value, correct });
    if (correct) {
      setScore((s) => s + 1 + Math.floor(streak / 3));
      setStreak((s) => s + 1);
    } else {
      setStreak(0);
    }
    setTimeout(() => {
      setFlash(null);
      setProblem(makeProblem());
    }, 250);
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Quick Math</h2>
        <div className="text-pink font-bold">Best: {best}</div>
      </div>
      <div className="flex justify-between text-sm font-bold text-ink-light mb-2">
        <span>Score: <span className="text-pink text-base">{score}</span></span>
        <span>Streak: <span className="text-purple text-base">{streak}</span></span>
        <span>Time: <span className="text-purple text-base">{timeLeft}s</span></span>
      </div>

      {running ? (
        <>
          <div className="my-7 font-display text-5xl shimmer-text">{problem.text}</div>
          <div className="grid grid-cols-2 gap-3">
            {problem.options.map((opt) => {
              const isFlash = flash && flash.value === opt;
              return (
                <button
                  key={opt}
                  onClick={() => answer(opt)}
                  disabled={!!flash}
                  className={`rounded-2xl py-4 text-2xl font-bold border-2 transition ${
                    isFlash
                      ? flash.correct
                        ? 'bg-green-100 border-green-400 text-green-700'
                        : 'bg-red-100 border-red-400 text-red-700'
                      : 'bg-white border-pink-light/50 text-ink hover:bg-pink-pale'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>
        </>
      ) : (
        <div className="py-8">
          <div className="font-display text-2xl text-ink mb-4">
            {timeLeft === 0 ? `Time's up! Score: ${score}` : 'Solve as many as you can in 30s!'}
          </div>
          <button onClick={start} className="btn-primary">
            {timeLeft === 0 ? 'Play again' : 'Start'}
          </button>
        </div>
      )}
    </div>
  );
}

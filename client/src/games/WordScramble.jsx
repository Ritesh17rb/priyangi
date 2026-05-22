import { useEffect, useState } from 'react';

const WORDS = [
  'sparkle','rainbow','butterfly','strawberry','melody','dreamy','glitter','unicorn',
  'sunshine','moonlight','sweetheart','flower','crystal','blossom','cupcake','jellyfish',
  'whisper','starlight','seaside','meadow',
];

const scramble = (w) => w.split('').sort(() => Math.random() - 0.5).join('');

function pick(prev) {
  let w = prev;
  while (w === prev) w = WORDS[Math.floor(Math.random() * WORDS.length)];
  return { word: w, scrambled: scramble(w) };
}

export default function WordScramble() {
  const [{ word, scrambled }, setRound] = useState(() => pick(''));
  const [guess, setGuess] = useState('');
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [msg, setMsg] = useState('');

  useEffect(() => { setGuess(''); setMsg(''); }, [word]);

  function submit(e) {
    e.preventDefault();
    if (guess.toLowerCase() === word) {
      setMsg('🎉 Yes!');
      setScore((s) => s + 1 + streak);
      setStreak((s) => s + 1);
      setTimeout(() => setRound(pick(word)), 700);
    } else {
      setMsg('💔 Try again');
      setStreak(0);
    }
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-3">
        <h2 className="font-display text-3xl">Word Scramble</h2>
        <div className="text-pink font-bold">Score: {score}</div>
      </div>
      <div className="my-6 text-4xl font-display tracking-widest shimmer-text">{scrambled}</div>
      <form onSubmit={submit} className="flex gap-2 justify-center">
        <input className="input !max-w-xs" value={guess} onChange={(e) => setGuess(e.target.value)} placeholder="Your answer…" />
        <button className="btn-primary">Go</button>
      </form>
      {msg && <div className="mt-3 font-bold">{msg}</div>}
      <div className="text-ink-light text-sm mt-2">Streak: {streak}</div>
      <button onClick={() => setRound(pick(word))} className="btn-ghost mt-4">Skip</button>
    </div>
  );
}

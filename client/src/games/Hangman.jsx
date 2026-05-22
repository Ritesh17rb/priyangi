import { useEffect, useMemo, useState } from 'react';

const WORDS = ['blackpink','jennie','jisoo','rose','lisa','strawberry','rainbow','butterfly','sparkle','unicorn','aespa','newjeans','sunset','melody','crystal'];

export default function Hangman() {
  const [word, setWord] = useState(() => WORDS[Math.floor(Math.random() * WORDS.length)]);
  const [guesses, setGuesses] = useState([]);
  const wrong = useMemo(() => guesses.filter((l) => !word.includes(l)).length, [guesses, word]);
  const lost = wrong >= 6;
  const won = !lost && word.split('').every((l) => guesses.includes(l));

  function guess(l) {
    if (lost || won || guesses.includes(l)) return;
    setGuesses((g) => [...g, l]);
  }

  useEffect(() => {
    function key(e) { if (/^[a-z]$/.test(e.key)) guess(e.key); }
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  });

  function reset() {
    let n = word; while (n === word) n = WORDS[Math.floor(Math.random() * WORDS.length)];
    setWord(n); setGuesses([]);
  }

  const stages = ['😀','🙂','😐','😟','😨','😰','💀'];

  return (
    <div className="card max-w-lg mx-auto text-center">
      <h2 className="font-display text-3xl mb-2">Hangman</h2>
      <div className="text-7xl my-3">{stages[Math.min(wrong, 6)]}</div>
      <div className="font-display text-3xl tracking-[0.4em] mb-3">
        {word.split('').map((l, i) =>
          <span key={i} className={guesses.includes(l) || lost ? 'text-pink' : 'text-ink-light'}>
            {guesses.includes(l) || lost ? l : '_'}
          </span>
        )}
      </div>
      {(won || lost) && (
        <div className={`font-bold ${won ? 'text-pink' : 'text-purple'} mb-3`}>
          {won ? '🎉 You saved them!' : `💔 The word was "${word}"`}
        </div>
      )}
      <div className="grid grid-cols-7 sm:grid-cols-9 gap-1.5 max-w-md mx-auto">
        {'abcdefghijklmnopqrstuvwxyz'.split('').map((l) => (
          <button key={l} onClick={() => guess(l)} disabled={guesses.includes(l) || won || lost}
            className={`aspect-square rounded-lg font-bold uppercase text-sm ${
              guesses.includes(l)
                ? word.includes(l) ? 'bg-pink text-white' : 'bg-purple/40 text-purple line-through'
                : 'bg-pink-pale hover:bg-pink-light/40 text-ink'
            } disabled:cursor-not-allowed`}>{l}</button>
        ))}
      </div>
      <button onClick={reset} className="btn-primary mt-4">New word</button>
    </div>
  );
}

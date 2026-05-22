import { useState } from 'react';

const lines = [[0,1,2],[3,4,5],[6,7,8],[0,3,6],[1,4,7],[2,5,8],[0,4,8],[2,4,6]];
function winner(b) {
  for (const [a,c,d] of lines) if (b[a] && b[a] === b[c] && b[a] === b[d]) return { who: b[a], line: [a,c,d] };
  if (b.every(Boolean)) return { who: 'draw' };
  return null;
}

export default function TicTacToe() {
  const [b, setB] = useState(Array(9).fill(null));
  const [x, setX] = useState(true);
  const w = winner(b);
  function play(i) {
    if (b[i] || w) return;
    const nb = [...b]; nb[i] = x ? '✿' : '★';
    setB(nb); setX(!x);
  }
  return (
    <div className="card max-w-md mx-auto text-center">
      <h2 className="font-display text-3xl mb-2">Tic-Tac-Toe</h2>
      <div className="text-ink-light mb-4">
        {w ? (w.who === 'draw' ? 'Draw 🤝' : `${w.who} wins! 🎉`) : `Turn: ${x ? '✿ (Player 1)' : '★ (Player 2)'}`}
      </div>
      <div className="grid grid-cols-3 gap-2 max-w-xs mx-auto">
        {b.map((v, i) => (
          <button
            key={i}
            onClick={() => play(i)}
            className={`aspect-square rounded-2xl text-5xl font-bold transition ${
              w?.line?.includes(i) ? 'bg-pink text-white shadow-pinky' : 'bg-pink-pale hover:bg-pink-light/40 text-pink'
            }`}
          >{v}</button>
        ))}
      </div>
      <button onClick={() => { setB(Array(9).fill(null)); setX(true); }} className="btn-primary mt-5">Reset</button>
    </div>
  );
}

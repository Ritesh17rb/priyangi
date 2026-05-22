import { useEffect, useState } from 'react';

const SIZE = 3;
const TOTAL = SIZE * SIZE;

function isSolved(tiles) {
  for (let i = 0; i < TOTAL - 1; i += 1) if (tiles[i] !== i + 1) return false;
  return tiles[TOTAL - 1] === 0;
}

function isSolvable(tiles) {
  let inv = 0;
  const arr = tiles.filter((t) => t !== 0);
  for (let i = 0; i < arr.length; i += 1) {
    for (let j = i + 1; j < arr.length; j += 1) {
      if (arr[i] > arr[j]) inv += 1;
    }
  }
  // odd grid width: solvable iff inversion count is even
  return inv % 2 === 0;
}

function shuffled() {
  let tiles;
  do {
    tiles = [...Array(TOTAL).keys()].sort(() => Math.random() - 0.5);
  } while (!isSolvable(tiles) || isSolved(tiles));
  return tiles;
}

export default function SlidingPuzzle() {
  const [tiles, setTiles] = useState(shuffled);
  const [moves, setMoves] = useState(0);
  const [best, setBest] = useState(() => +(localStorage.getItem('priyangi_slide_best') || 0));
  const solved = isSolved(tiles);

  useEffect(() => {
    if (solved && moves > 0 && (best === 0 || moves < best)) {
      localStorage.setItem('priyangi_slide_best', String(moves));
      setBest(moves);
    }
  }, [solved, moves, best]);

  function move(i) {
    if (solved) return;
    const empty = tiles.indexOf(0);
    const r = Math.floor(i / SIZE);
    const c = i % SIZE;
    const er = Math.floor(empty / SIZE);
    const ec = empty % SIZE;
    if (Math.abs(r - er) + Math.abs(c - ec) !== 1) return;
    const next = [...tiles];
    [next[i], next[empty]] = [next[empty], next[i]];
    setTiles(next);
    setMoves((m) => m + 1);
  }

  function reset() {
    setTiles(shuffled());
    setMoves(0);
  }

  return (
    <div className="card max-w-sm mx-auto text-center">
      <div className="flex justify-between mb-2">
        <h2 className="font-display text-3xl">Sliding Puzzle</h2>
        <div className="text-pink font-bold">{best ? `Best: ${best}` : ''}</div>
      </div>
      <div className="text-sm font-bold text-ink-light mb-3">
        Moves: <span className="text-pink text-base">{moves}</span>
      </div>
      {solved && moves > 0 && <div className="text-pink font-bold mb-3">🎉 Solved in {moves} moves!</div>}
      <div className="grid grid-cols-3 gap-2 bg-pink-pale p-2 rounded-2xl">
        {tiles.map((t, i) => (
          <button
            key={i}
            onClick={() => move(i)}
            className={`aspect-square rounded-xl text-3xl font-bold transition ${
              t === 0
                ? 'bg-transparent'
                : 'bg-gradient-to-br from-pink to-purple text-white shadow-pinky active:scale-95'
            }`}
          >
            {t || ''}
          </button>
        ))}
      </div>
      <p className="text-xs text-ink-light mt-3">Tap a tile beside the gap to slide it. Order them 1–8.</p>
      <button onClick={reset} className="btn-primary mt-4">New puzzle</button>
    </div>
  );
}

import { useEffect, useState } from 'react';

const EMOJIS = ['🌸','🦄','🌈','💖','🍓','🌺','🦋','🍰'];

function shuffled() {
  const arr = [...EMOJIS, ...EMOJIS]
    .map((e) => ({ e, id: Math.random() }))
    .sort((a, b) => a.id - b.id)
    .map((c, i) => ({ ...c, idx: i, flipped: false, matched: false }));
  return arr;
}

export default function Memory() {
  const [cards, setCards] = useState(shuffled());
  const [picked, setPicked] = useState([]);
  const [moves, setMoves] = useState(0);
  const won = cards.every((c) => c.matched);

  useEffect(() => {
    if (picked.length !== 2) return;
    const [a, b] = picked;
    setMoves((m) => m + 1);
    if (cards[a].e === cards[b].e) {
      setTimeout(() => {
        setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, matched: true } : c)));
        setPicked([]);
      }, 350);
    } else {
      setTimeout(() => {
        setCards((cs) => cs.map((c, i) => (i === a || i === b ? { ...c, flipped: false } : c)));
        setPicked([]);
      }, 800);
    }
  }, [picked]); // eslint-disable-line

  function flip(i) {
    if (picked.length === 2) return;
    if (cards[i].flipped || cards[i].matched) return;
    setCards((cs) => cs.map((c, j) => (j === i ? { ...c, flipped: true } : c)));
    setPicked((p) => [...p, i]);
  }

  function reset() { setCards(shuffled()); setPicked([]); setMoves(0); }

  return (
    <div className="card max-w-xl mx-auto">
      <div className="flex justify-between items-center mb-3">
        <h2 className="font-display text-3xl">Memory Match</h2>
        <div className="text-ink-light">Moves: <b>{moves}</b></div>
      </div>
      {won && <div className="text-center text-pink font-bold mb-3">🎉 You won in {moves} moves!</div>}
      <div className="grid grid-cols-4 gap-3">
        {cards.map((c, i) => (
          <button
            key={i}
            onClick={() => flip(i)}
            className={`aspect-square rounded-xl text-3xl font-bold transition ${
              c.flipped || c.matched
                ? 'bg-gradient-to-br from-pink to-purple text-white shadow-pinky'
                : 'bg-pink-pale hover:bg-pink-light/40'
            } ${c.matched ? 'opacity-70' : ''}`}
          >{c.flipped || c.matched ? c.e : '?'}</button>
        ))}
      </div>
      <button onClick={reset} className="btn-primary mt-5">New game</button>
    </div>
  );
}

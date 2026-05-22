import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const CHOICES = [
  { name: 'rock', emoji: '✊' },
  { name: 'paper', emoji: '✋' },
  { name: 'scissors', emoji: '✌️' },
];
const beats = { rock: 'scissors', paper: 'rock', scissors: 'paper' };

export default function RockPaperScissors() {
  const [you, setYou] = useState(null);
  const [bot, setBot] = useState(null);
  const [score, setScore] = useState({ you: 0, bot: 0, draws: 0 });
  const [outcome, setOutcome] = useState('');
  const [busy, setBusy] = useState(false);

  function play(choice) {
    if (busy) return;
    setBusy(true);
    setYou(choice); setBot(null); setOutcome('');
    let i = 0;
    const id = setInterval(() => {
      setBot(CHOICES[i++ % 3]);
    }, 80);
    setTimeout(() => {
      clearInterval(id);
      const b = CHOICES[Math.floor(Math.random() * 3)];
      setBot(b);
      let res;
      if (b.name === choice.name) { res = 'draw'; setScore((s) => ({ ...s, draws: s.draws + 1 })); }
      else if (beats[choice.name] === b.name) { res = 'win'; setScore((s) => ({ ...s, you: s.you + 1 })); }
      else { res = 'lose'; setScore((s) => ({ ...s, bot: s.bot + 1 })); }
      setOutcome(res);
      setBusy(false);
    }, 800);
  }

  return (
    <div className="card max-w-md mx-auto text-center">
      <div className="flex justify-between mb-3">
        <h2 className="font-display text-3xl">Rock · Paper · Scissors</h2>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4 text-sm">
        <div className="bg-pink-pale rounded-xl py-2"><div className="text-pink font-bold">You</div><div className="text-2xl">{score.you}</div></div>
        <div className="bg-pink-pale rounded-xl py-2"><div className="text-ink-light font-bold">Draws</div><div className="text-2xl">{score.draws}</div></div>
        <div className="bg-pink-pale rounded-xl py-2"><div className="text-purple font-bold">Bot</div><div className="text-2xl">{score.bot}</div></div>
      </div>

      <div className="flex justify-around items-center my-6 text-7xl min-h-[100px]">
        <AnimatePresence mode="popLayout">
          <motion.div key={you?.name || 'y'} initial={{ scale: 0 }} animate={{ scale: 1 }} className="">{you?.emoji || '🤔'}</motion.div>
        </AnimatePresence>
        <span className="text-2xl text-pink font-bold">VS</span>
        <AnimatePresence mode="popLayout">
          <motion.div key={bot?.name || 'b'} initial={{ scale: 0 }} animate={{ scale: 1 }}>{bot?.emoji || '🤖'}</motion.div>
        </AnimatePresence>
      </div>

      {outcome && (
        <div className={`text-xl font-bold mb-3 ${outcome === 'win' ? 'text-pink' : outcome === 'lose' ? 'text-purple' : 'text-ink-light'}`}>
          {outcome === 'win' ? '🎉 You won!' : outcome === 'lose' ? '😅 Bot wins' : '🤝 Draw!'}
        </div>
      )}

      <div className="flex justify-center gap-3">
        {CHOICES.map((c) => (
          <button key={c.name} disabled={busy} onClick={() => play(c)}
            className="w-16 h-16 rounded-full bg-pink-pale hover:bg-pink-light/40 text-3xl transition disabled:opacity-50">
            {c.emoji}
          </button>
        ))}
      </div>
      <button onClick={() => setScore({ you: 0, bot: 0, draws: 0 })} className="btn-ghost mt-4 text-sm">Reset score</button>
    </div>
  );
}

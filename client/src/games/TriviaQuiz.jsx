import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

const QUESTIONS = [
  { q: 'How many members are in BLACKPINK?', opts: ['3', '4', '5', '6'], a: 1 },
  { q: 'Which BLACKPINK member is from Thailand?', opts: ['Jisoo', 'Jennie', 'Rosé', 'Lisa'], a: 3 },
  { q: 'BTS debuted in which year?', opts: ['2011', '2013', '2015', '2017'], a: 1 },
  { q: 'Which group sang "Hype Boy"?', opts: ['IVE', 'TWICE', 'NewJeans', 'aespa'], a: 2 },
  { q: 'How many members are in TWICE?', opts: ['7', '8', '9', '10'], a: 2 },
  { q: 'Who is the leader of BTS?', opts: ['Jin', 'RM', 'V', 'Jungkook'], a: 1 },
  { q: 'Which song is by aespa?', opts: ['Next Level', 'I AM', 'TOMBOY', 'Boy with Luv'], a: 0 },
  { q: 'BLACKPINK\'s fandom name is…', opts: ['ARMY', 'BLINK', 'ONCE', 'MIDZY'], a: 1 },
  { q: 'Which is BTS\'s fandom name?', opts: ['BLINK', 'ARMY', 'ATINY', 'MOA'], a: 1 },
  { q: 'Who sings "TOMBOY"?', opts: ['ITZY', '(G)I-DLE', 'IVE', 'TWICE'], a: 1 },
  { q: 'Which year did NewJeans debut?', opts: ['2018', '2020', '2022', '2024'], a: 2 },
  { q: 'LE SSERAFIM is from which company?', opts: ['SM', 'YG', 'JYP', 'HYBE'], a: 3 },
  { q: 'Which TWICE song goes "Shy shy shy"?', opts: ['TT', 'Cheer Up', 'Likey', 'Fancy'], a: 1 },
  { q: 'IU is famous as a…', opts: ['Rapper', 'Solo singer', 'Dancer', 'Producer'], a: 1 },
  { q: 'Which BTS song won AMA Favorite Pop Song?', opts: ['DNA', 'Dynamite', 'Boy With Luv', 'Butter'], a: 3 },
];

function shuffle(arr) {
  return [...arr].sort(() => Math.random() - 0.5);
}

export default function TriviaQuiz() {
  const [round, setRound] = useState(() => shuffle(QUESTIONS).slice(0, 10));
  const [i, setI] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [done, setDone] = useState(false);

  function pick(j) {
    if (picked !== null) return;
    setPicked(j);
    if (j === round[i].a) setScore((s) => s + 1);
    setTimeout(() => {
      if (i + 1 >= round.length) setDone(true);
      else { setI(i + 1); setPicked(null); }
    }, 900);
  }

  function reset() {
    setRound(shuffle(QUESTIONS).slice(0, 10));
    setI(0); setPicked(null); setScore(0); setDone(false);
  }

  if (done) {
    const pct = Math.round((score / round.length) * 100);
    return (
      <div className="card max-w-md mx-auto text-center">
        <h2 className="font-display text-3xl mb-3">🎉 All done!</h2>
        <div className="font-display text-6xl shimmer-text my-4">{score}/{round.length}</div>
        <div className="text-ink-light mb-4">
          {pct === 100 ? 'PERFECT! K-Pop queen 👑' : pct >= 70 ? 'Wow you really know your stuff!' : pct >= 40 ? 'Not bad — try again!' : 'Keep listening 💕'}
        </div>
        <button onClick={reset} className="btn-primary">Play again</button>
      </div>
    );
  }

  const Q = round[i];

  return (
    <div className="card max-w-xl mx-auto">
      <div className="flex justify-between mb-3">
        <h2 className="font-display text-3xl">K-Pop Trivia</h2>
        <div className="text-pink font-bold">{i + 1}/{round.length}</div>
      </div>
      <div className="h-2 bg-pink-pale rounded-full overflow-hidden mb-4">
        <div className="h-full bg-gradient-to-r from-pink to-purple transition-all"
          style={{ width: `${((i) / round.length) * 100}%` }} />
      </div>
      <AnimatePresence mode="wait">
        <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}>
          <div className="font-display text-2xl text-ink mb-4">{Q.q}</div>
          <div className="grid gap-2">
            {Q.opts.map((opt, j) => {
              const correct = picked !== null && j === Q.a;
              const wrong = picked === j && j !== Q.a;
              return (
                <button key={j} onClick={() => pick(j)} disabled={picked !== null}
                  className={`text-left rounded-2xl px-4 py-3 font-semibold border-2 transition ${
                    correct ? 'bg-green-100 border-green-400 text-green-800' :
                    wrong ? 'bg-red-100 border-red-400 text-red-800' :
                    'bg-white border-pink-light/40 hover:bg-pink-pale'
                  }`}>
                  {opt}
                </button>
              );
            })}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="text-right text-sm text-ink-light mt-4">Score: <b>{score}</b></div>
    </div>
  );
}

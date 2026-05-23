import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';

const SUGGESTIONS = ['BLACKPINK', 'Animals', 'Outer Space', 'Disney', 'Harry Potter', 'Geography', 'Science', 'Desserts'];
const LEVELS = [
  { id: 'easy', label: 'Easy' },
  { id: 'medium', label: 'Medium' },
  { id: 'hard', label: 'Hard' },
];

export default function AIQuiz() {
  const [stage, setStage] = useState('setup'); // setup | loading | playing | done
  const [topic, setTopic] = useState('');
  const [difficulty, setDifficulty] = useState('medium');
  const [questions, setQuestions] = useState([]);
  const [idx, setIdx] = useState(0);
  const [picked, setPicked] = useState(null);
  const [score, setScore] = useState(0);
  const [error, setError] = useState('');

  async function createQuiz(chosenTopic) {
    const t = (chosenTopic ?? topic).trim();
    if (!t) {
      setError('Type or tap a topic first ✨');
      return;
    }
    setTopic(t);
    setError('');
    setStage('loading');
    try {
      const data = await api('/ai/quiz', { method: 'POST', auth: false, body: { topic: t, difficulty } });
      setQuestions(data.questions);
      setIdx(0);
      setScore(0);
      setPicked(null);
      setStage('playing');
    } catch (e) {
      setError(e.message || 'Something went wrong — please try again.');
      setStage('setup');
    }
  }

  function pick(i) {
    if (picked !== null) return;
    setPicked(i);
    if (i === questions[idx].correctIndex) setScore((s) => s + 1);
  }

  function next() {
    if (idx + 1 >= questions.length) {
      setStage('done');
    } else {
      setIdx(idx + 1);
      setPicked(null);
    }
  }

  function reset() {
    setStage('setup');
    setQuestions([]);
    setIdx(0);
    setScore(0);
    setPicked(null);
    setError('');
  }

  if (stage === 'setup') {
    return (
      <div className="card max-w-lg mx-auto">
        <div className="text-center">
          <div className="text-5xl mb-1">🧠</div>
          <h2 className="font-display text-3xl shimmer-text">AI Quiz</h2>
          <p className="text-ink-light text-sm mt-1">Pick any topic — a fresh quiz is made just for you ✨</p>
        </div>

        <div className="label mt-5">Your topic</div>
        <input
          className="input"
          placeholder="e.g. BLACKPINK, dinosaurs, your favourite movie…"
          value={topic}
          onChange={(e) => setTopic(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && createQuiz()}
        />
        <div className="mt-3 flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => setTopic(s)}
              className={`rounded-full px-3 py-1 text-xs font-bold transition ${
                topic === s ? 'bg-pink text-white' : 'bg-pink-pale text-pink hover:bg-pink-light/40'
              }`}
            >
              {s}
            </button>
          ))}
        </div>

        <div className="label mt-5">Difficulty</div>
        <div className="flex gap-2">
          {LEVELS.map((l) => (
            <button
              key={l.id}
              onClick={() => setDifficulty(l.id)}
              className={`flex-1 rounded-2xl py-2 font-bold transition ${
                difficulty === l.id
                  ? 'bg-purple text-white shadow-soft'
                  : 'bg-white border-2 border-pink-light/50 text-ink'
              }`}
            >
              {l.label}
            </button>
          ))}
        </div>

        {error && <div className="mt-4 text-center text-sm font-semibold text-pink">{error}</div>}

        <button onClick={() => createQuiz()} className="btn-primary w-full mt-6">✨ Create my quiz</button>
      </div>
    );
  }

  if (stage === 'loading') {
    return (
      <div className="card max-w-lg mx-auto text-center py-16">
        <motion.div
          className="text-6xl"
          animate={{ rotate: [0, 16, -16, 0], scale: [1, 1.18, 1] }}
          transition={{ duration: 1.4, repeat: Infinity }}
        >
          ✨
        </motion.div>
        <div className="font-display text-2xl mt-4 shimmer-text">Building your quiz…</div>
        <p className="text-ink-light text-sm mt-2">
          Writing fresh questions about <b>{topic}</b> 💭
        </p>
      </div>
    );
  }

  if (stage === 'done') {
    const pct = Math.round((score / questions.length) * 100);
    const msg =
      pct === 100 ? "PERFECT! You're a genius 👑" :
      pct >= 70 ? 'Amazing — you really know this! 🌟' :
      pct >= 40 ? 'Nice try — play again to beat it! 💪' :
      "Keep learning, you've got this 💖";
    return (
      <div className="card max-w-lg mx-auto text-center">
        <div className="text-5xl mb-1">🎉</div>
        <h2 className="font-display text-3xl">Quiz complete!</h2>
        <div className="text-ink-light text-sm">Topic: {topic}</div>
        <div className="font-display text-6xl shimmer-text my-4">{score}/{questions.length}</div>
        <div className="text-ink-light mb-6">{msg}</div>
        <div className="flex gap-2">
          <button onClick={() => createQuiz(topic)} className="btn-primary flex-1">Play again</button>
          <button onClick={reset} className="btn-ghost flex-1">New topic</button>
        </div>
      </div>
    );
  }

  const q = questions[idx];
  const answered = picked !== null;
  return (
    <div className="card max-w-lg mx-auto">
      <div className="mb-3 flex items-center justify-between">
        <span className="chip">{topic}</span>
        <span className="text-sm font-bold text-pink">{idx + 1} / {questions.length}</span>
      </div>
      <div className="mb-4 h-2 overflow-hidden rounded-full bg-pink-pale">
        <div
          className="h-full bg-gradient-to-r from-pink to-purple transition-all"
          style={{ width: `${(idx / questions.length) * 100}%` }}
        />
      </div>

      <AnimatePresence mode="wait">
        <motion.div
          key={idx}
          initial={{ opacity: 0, x: 30 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -30 }}
        >
          <div className="mb-4 font-display text-xl sm:text-2xl text-ink">{q.question}</div>
          <div className="grid gap-2">
            {q.options.map((opt, i) => {
              const correct = answered && i === q.correctIndex;
              const wrong = answered && picked === i && i !== q.correctIndex;
              return (
                <button
                  key={i}
                  onClick={() => pick(i)}
                  disabled={answered}
                  className={`rounded-2xl border-2 px-4 py-3 text-left font-semibold transition ${
                    correct
                      ? 'border-green-400 bg-green-100 text-green-800'
                      : wrong
                      ? 'border-red-400 bg-red-100 text-red-800'
                      : 'border-pink-light/40 bg-white hover:bg-pink-pale disabled:opacity-60'
                  }`}
                >
                  {opt}
                </button>
              );
            })}
          </div>

          {answered && q.fact && (
            <motion.div
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-4 rounded-2xl bg-purple/10 px-4 py-3 text-sm text-ink"
            >
              💡 {q.fact}
            </motion.div>
          )}
        </motion.div>
      </AnimatePresence>

      {answered && (
        <button onClick={next} className="btn-primary mt-4 w-full">
          {idx + 1 >= questions.length ? 'See results →' : 'Next question →'}
        </button>
      )}
      <div className="mt-3 text-right text-sm text-ink-light">Score: <b>{score}</b></div>
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Study() {
  const { isAdmin } = useAuth();
  const [items, setItems] = useState([]);
  const [pomodoro, setPomodoro] = useState(25 * 60);
  const [running, setRunning] = useState(false);

  useEffect(() => {
    api('/articles?category=study', { auth: false }).then(setItems);
  }, []);

  useEffect(() => {
    if (!running) return;
    if (pomodoro <= 0) { setRunning(false); return; }
    const t = setInterval(() => setPomodoro((s) => s - 1), 1000);
    return () => clearInterval(t);
  }, [running, pomodoro]);

  const mins = String(Math.floor(pomodoro / 60)).padStart(2, '0');
  const secs = String(pomodoro % 60).padStart(2, '0');

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <h1 className="section-title text-left !mb-1">Study <span className="shimmer-text">Corner</span></h1>
      <p className="text-ink-light mb-8">Notes, resources, and a focus timer. 📚</p>

      <div className="grid lg:grid-cols-3 gap-5 mb-10">
        <div className="card text-center lg:col-span-1">
          <div className="text-sm font-bold text-pink uppercase">Focus timer 🍅</div>
          <div className="font-display text-6xl my-3 shimmer-text">{mins}:{secs}</div>
          <div className="flex gap-2 justify-center">
            <button onClick={() => setRunning(!running)} className="btn-primary">
              {running ? 'Pause' : 'Start'}
            </button>
            <button onClick={() => { setRunning(false); setPomodoro(25 * 60); }} className="btn-ghost">Reset</button>
          </div>
          <div className="flex gap-2 justify-center mt-3">
            {[15, 25, 50].map((m) => (
              <button key={m} onClick={() => { setPomodoro(m * 60); setRunning(false); }}
                className="text-xs font-bold px-3 py-1 rounded-full bg-pink-pale text-pink">{m}m</button>
            ))}
          </div>
        </div>

        <div className="card lg:col-span-2">
          <div className="text-sm font-bold text-purple uppercase">Quick resources</div>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 mt-3">
            {[
              { name: 'Khan Academy', url: 'https://www.khanacademy.org/' },
              { name: 'Wikipedia', url: 'https://www.wikipedia.org/' },
              { name: 'Wolfram Alpha', url: 'https://www.wolframalpha.com/' },
              { name: 'Google Scholar', url: 'https://scholar.google.com/' },
              { name: 'Duolingo', url: 'https://www.duolingo.com/' },
              { name: 'Quizlet', url: 'https://quizlet.com/' },
            ].map((r) => (
              <a key={r.name} href={r.url} target="_blank" rel="noreferrer"
                className="bg-pink-pale rounded-xl p-3 text-center font-semibold text-ink hover:bg-pink-light/40 transition">
                {r.name}
              </a>
            ))}
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">Study notes</h2>
        {isAdmin && (
          <Link to="/articles/new" className="btn-primary">+ New note</Link>
        )}
      </div>
      {items.length === 0 ? (
        <div className="card text-center text-ink-light py-10">No study notes yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/articles/${a.slug}`} className="card block hover:scale-[1.02] transition h-full">
                <span className="chip">study</span>
                <h3 className="font-display text-2xl mt-2 mb-1">{a.title}</h3>
                <p className="text-sm text-ink-light line-clamp-3">{a.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Articles() {
  const { isAdmin } = useAuth();
  const [articles, setArticles] = useState([]);
  const [q, setQ] = useState('');

  useEffect(() => {
    const params = new URLSearchParams({ category: 'article' });
    if (q) params.set('q', q);
    api(`/articles?${params}`, { auth: false }).then(setArticles).catch(() => {});
  }, [q]);

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
        <div>
          <h1 className="section-title text-left !mb-1">My <span className="shimmer-text">Articles</span></h1>
          <p className="text-ink-light">Stories, thoughts, diaries. ✨</p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <input className="input !py-2 flex-1 md:flex-none md:!w-64" placeholder="Search…" value={q} onChange={(e) => setQ(e.target.value)} />
          {isAdmin && <Link to="/articles/new" className="btn-primary whitespace-nowrap">+ New article</Link>}
        </div>
      </div>

      {articles.length === 0 ? (
        <div className="card text-center text-ink-light py-12">No articles yet. {isAdmin && '✨ Write the first one!'}</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {articles.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/articles/${a.slug}`} className="card block hover:scale-[1.02] transition h-full">
                {a.coverImage && (
                  <img src={a.coverImage} alt="" className="rounded-2xl mb-3 h-44 w-full object-cover" />
                )}
                <span className="chip">{a.category}</span>
                <h3 className="font-display text-2xl mt-2 mb-1 text-ink">{a.title}</h3>
                <p className="text-sm text-ink-light line-clamp-3">{a.excerpt}</p>
                <div className="text-xs text-ink-light mt-3">
                  by {a.author?.name || 'Priyangi'} · {new Date(a.createdAt).toLocaleDateString()}
                </div>
              </Link>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}

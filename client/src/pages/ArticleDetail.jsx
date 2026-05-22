import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useAlerts } from '../components/AlertProvider.jsx';

export default function ArticleDetail() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();
  const { confirm } = useAlerts();
  const [data, setData] = useState(null);
  const [body, setBody] = useState('');
  const [busy, setBusy] = useState(false);

  function reload() {
    api(`/articles/${slug}`, { auth: false }).then(setData).catch(() => setData({ error: true }));
  }

  useEffect(() => { reload(); }, [slug]);

  if (!data) return <div className="py-20 text-center text-ink-light">Loading...</div>;
  if (data.error) return <div className="py-20 text-center text-pink">Article not found.</div>;

  const { article, comments } = data;

  async function postComment(event) {
    event.preventDefault();
    if (!body.trim()) return;
    setBusy(true);
    try {
      await api(`/articles/${article._id}/comments`, { method: 'POST', body: { body } });
      setBody('');
      reload();
    } finally {
      setBusy(false);
    }
  }

  async function like() {
    if (!user) return navigate('/login');
    await api(`/articles/${article._id}/like`, { method: 'POST' });
    reload();
  }

  async function deleteComment(id) {
    const approved = await confirm({
      title: 'Delete comment?',
      message: 'This comment will be removed permanently.',
      confirmText: 'Delete comment',
    });
    if (!approved) return;
    await api(`/articles/comments/${id}`, { method: 'DELETE' });
    reload();
  }

  async function deleteArticle() {
    const approved = await confirm({
      title: 'Delete this article forever?',
      message: 'This permanently removes the article and its discussion.',
      confirmText: 'Delete article',
    });
    if (!approved) return;
    await api(`/articles/${article._id}`, { method: 'DELETE' });
    navigate('/articles');
  }

  return (
    <motion.article initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mx-auto max-w-3xl px-5 pt-10 pb-16">
      {article.coverImage && (
        <img src={article.coverImage} alt="" className="mb-6 max-h-96 w-full rounded-3xl object-cover shadow-soft" />
      )}

      <span className="chip">{article.category}</span>
      <h1 className="mt-3 mb-2 font-display text-4xl font-bold md:text-5xl">{article.title}</h1>
      <div className="mb-6 flex flex-wrap items-center gap-3 text-sm text-ink-light">
        <span>by {article.author?.name || 'Priyangi'}</span>
        <span>&middot;</span>
        <span>{new Date(article.createdAt).toLocaleDateString()}</span>
        <button onClick={like} className="btn-ghost ml-auto !px-3 !py-1 text-sm">
          Love {article.likes?.length || 0}
        </button>
        {isAdmin && (
          <>
            <Link to={`/articles/edit/${article._id}`} className="btn-ghost !px-3 !py-1 text-sm">Edit</Link>
            <button onClick={deleteArticle} className="btn-ghost !border-red-300 !px-3 !py-1 text-sm !text-red-500">Delete</button>
          </>
        )}
      </div>

      <div className="card whitespace-pre-wrap text-lg leading-relaxed text-ink/90">{article.content}</div>

      <div className="mt-10">
        <h3 className="mb-4 font-display text-2xl">Comments ({comments.length})</h3>
        {user ? (
          <form onSubmit={postComment} className="card mb-5">
            <textarea
              className="input min-h-[80px]"
              placeholder="Leave a sweet thought..."
              value={body}
              onChange={(event) => setBody(event.target.value)}
            />
            <button disabled={busy} className="btn-primary mt-3">Post comment</button>
          </form>
        ) : (
          <div className="card mb-5 text-center text-ink-light">
            <Link to="/login" className="font-bold text-pink">Login</Link> to comment.
          </div>
        )}

        <div className="space-y-3">
          {comments.map((comment) => (
            <div key={comment._id} className="card !p-4">
              <div className="flex items-center justify-between">
                <div className="font-bold text-ink">
                  {comment.author?.name} {comment.author?.role === 'admin' && <span className="chip ml-1 !py-0">Admin</span>}
                </div>
                <div className="text-xs text-ink-light">{new Date(comment.createdAt).toLocaleString()}</div>
              </div>
              <div className="mt-1 whitespace-pre-wrap text-ink/90">{comment.body}</div>
              {(user?.id === comment.author?._id || isAdmin) && (
                <button onClick={() => deleteComment(comment._id)} className="mt-2 text-xs font-semibold text-pink">Delete</button>
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.article>
  );
}

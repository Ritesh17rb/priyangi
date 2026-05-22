import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { api } from '../api.js';

export default function ArticleEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [form, setForm] = useState({
    title: '', content: '', excerpt: '', coverImage: '', category: 'article', tags: '',
  });
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState('');
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');

  useEffect(() => {
    if (!id) return;
    api(`/articles`).then((all) => {
      const a = all.find((x) => x._id === id);
      if (a) setForm({
        title: a.title, content: a.content, excerpt: a.excerpt || '',
        coverImage: a.coverImage || '', category: a.category,
        tags: (a.tags || []).join(', '),
      });
    });
  }, [id]);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(form.coverImage || '');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, form.coverImage]);

  async function submit(e) {
    e.preventDefault();
    setBusy(true); setErr('');
    try {
      const body = new FormData();
      body.append('title', form.title);
      body.append('content', form.content);
      body.append('excerpt', form.excerpt);
      body.append('category', form.category);
      body.append('tags', JSON.stringify(form.tags.split(',').map((s) => s.trim()).filter(Boolean)));
      if (file) body.append('coverImage', file);
      const saved = id
        ? await api(`/articles/${id}`, { method: 'PUT', body })
        : await api('/articles', { method: 'POST', body });
      navigate(`/articles/${saved.slug}`);
    } catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }
  function onFileChange(e) { setFile(e.target.files?.[0] || null); }

  return (
    <div className="max-w-3xl mx-auto px-5 pt-10 pb-16">
      <h1 className="section-title text-left">{id ? 'Edit' : 'New'} <span className="shimmer-text">article</span></h1>
      <form onSubmit={submit} className="card space-y-3 mt-6">
        <div>
          <label className="label">Title</label>
          <input className="input" required value={form.title} onChange={set('title')} />
        </div>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <div>
            <label className="label">Category</label>
            <select className="input" value={form.category} onChange={set('category')}>
              <option value="article">Article</option>
              <option value="study">Study</option>
              <option value="school">School</option>
              <option value="diary">Diary</option>
            </select>
          </div>
          <div>
            <label className="label">Tags (comma separated)</label>
            <input className="input" value={form.tags} onChange={set('tags')} />
          </div>
        </div>
        <div>
          <label className="label">Cover image (optional)</label>
          <input
            className="input !py-2 file:mr-3 file:rounded-full file:border-0 file:bg-pink file:px-4 file:py-2 file:font-semibold file:text-white"
            type="file"
            accept="image/*"
            onChange={onFileChange}
          />
          <div className="mt-2 text-xs text-ink-light">
            Choose a JPG, PNG, WEBP, GIF, or AVIF image up to 4 MB.
            {id ? ' Leave this empty to keep the current cover image.' : ''}
          </div>
        </div>
        {previewUrl && <img src={previewUrl} alt="Cover preview" className="max-h-56 w-full rounded-2xl object-cover" />}
        <div>
          <label className="label">Excerpt (optional)</label>
          <input className="input" value={form.excerpt} onChange={set('excerpt')} />
        </div>
        <div>
          <label className="label">Content</label>
          <textarea className="input min-h-[280px]" required value={form.content} onChange={set('content')} />
        </div>
        {err && <div className="text-pink font-semibold">{err}</div>}
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={() => navigate(-1)} className="btn-ghost">Cancel</button>
        </div>
      </form>
    </div>
  );
}

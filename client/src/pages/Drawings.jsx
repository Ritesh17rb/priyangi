import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useAlerts } from '../components/AlertProvider.jsx';

export default function Drawings() {
  const { user, isAdmin } = useAuth();
  const { confirm } = useAlerts();
  const [drawings, setDrawings] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [zoom, setZoom] = useState(null);

  function load() { api('/drawings', { auth: false }).then(setDrawings); }
  useEffect(load, []);

  async function like(id) {
    if (!user) return;
    await api(`/drawings/${id}/like`, { method: 'POST' });
    load();
  }

  async function del(id) {
    const approved = await confirm({
      title: 'Delete this drawing?',
      message: 'This removes the drawing from the gallery.',
      confirmText: 'Delete drawing',
    });
    if (!approved) return;
    await api(`/drawings/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title !mb-1 text-left">My <span className="shimmer-text">Drawings</span></h1>
          <p className="text-ink-light">Doodles, sketches, daydreams.</p>
        </div>
        {isAdmin && <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">+ Add drawing</button>}
      </div>

      {drawings.length === 0 ? (
        <div className="card py-12 text-center text-ink-light">No drawings yet.</div>
      ) : (
        <div className="columns-2 gap-4 md:columns-3 lg:columns-4">
          {drawings.map((drawing) => (
            <motion.div
              key={drawing._id}
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="group relative mb-4 break-inside-avoid"
            >
              <img
                src={drawing.imageUrl}
                alt={drawing.title}
                onClick={() => setZoom(drawing)}
                className="w-full cursor-zoom-in rounded-2xl shadow-soft"
              />
              <div className="flex items-center justify-between px-2 py-2">
                <div>
                  <div className="text-sm font-bold text-ink">{drawing.title}</div>
                  <div className="text-xs text-ink-light">{drawing.medium}</div>
                </div>
                <button onClick={() => like(drawing._id)} className="text-sm font-semibold">
                  Love {drawing.likes?.length || 0}
                </button>
              </div>
              {isAdmin && (
                <div className="absolute top-2 right-2 flex gap-1 opacity-100 transition md:opacity-0 md:group-hover:opacity-100">
                  <button onClick={() => { setEditing(drawing); setOpen(true); }} className="rounded-full bg-white/90 px-2 py-1 text-xs font-bold">Edit</button>
                  <button onClick={() => del(drawing._id)} className="rounded-full bg-white/90 px-2 py-1 text-xs font-bold text-red-500">x</button>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && (
          <DrawingModal
            initial={editing}
            onClose={() => setOpen(false)}
            onSaved={() => { setOpen(false); load(); }}
          />
        )}
        {zoom && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setZoom(null)}
            className="fixed inset-0 z-[100] flex cursor-zoom-out items-center justify-center bg-black/80 p-6"
          >
            <img src={zoom.imageUrl} alt={zoom.title} className="max-h-[90vh] max-w-full rounded-2xl shadow-soft" />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function DrawingModal({ initial, onClose, onSaved }) {
  const { notify } = useAlerts();
  const [form, setForm] = useState(() => ({
    title: initial?.title || '',
    description: initial?.description || '',
    medium: initial?.medium || 'digital',
  }));
  const [file, setFile] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(initial?.imageUrl || '');
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(initial?.imageUrl || '');
      return undefined;
    }
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
    return () => URL.revokeObjectURL(objectUrl);
  }, [file, initial?.imageUrl]);

  function set(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  function onFileChange(event) {
    const nextFile = event.target.files?.[0] || null;
    setFile(nextFile);
  }

  async function submit(event) {
    event.preventDefault();

    if (!initial && !file) {
      notify({
        tone: 'danger',
        title: 'Image required',
        message: 'Upload a drawing file before saving.',
      });
      return;
    }

    setBusy(true);
    try {
      const body = new FormData();
      body.append('title', form.title.trim());
      body.append('description', form.description);
      body.append('medium', form.medium);
      if (file) {
        body.append('image', file);
      }

      if (initial) await api(`/drawings/${initial._id}`, { method: 'PUT', body });
      else await api('/drawings', { method: 'POST', body });

      notify({
        tone: 'success',
        title: initial ? 'Drawing updated' : 'Drawing added',
        message: file ? 'Your uploaded artwork is now in the gallery.' : 'The drawing details have been updated.',
      });
      onSaved();
    } catch (error) {
      notify({
        tone: 'danger',
        title: 'Could not save drawing',
        message: error.message,
      });
    } finally {
      setBusy(false);
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-5"
    >
      <motion.form initial={{ scale: 0.9 }} animate={{ scale: 1 }} onSubmit={submit} className="card w-full max-w-lg space-y-3">
        <h2 className="font-display text-2xl">{initial ? 'Edit' : 'Add'} drawing</h2>
        <input className="input" placeholder="Title" required value={form.title} onChange={set('title')} />

        <div className="rounded-3xl border border-pink-light/50 bg-pink-pale/50 p-4">
          <label className="label">Upload Drawing</label>
          <input className="input !py-2 file:mr-3 file:rounded-full file:border-0 file:bg-pink file:px-4 file:py-2 file:font-semibold file:text-white" type="file" accept="image/*" onChange={onFileChange} />
          <div className="mt-2 text-xs text-ink-light">
            Choose a JPG, PNG, WEBP, GIF, or AVIF image up to 4 MB.
            {initial ? ' Leave this empty to keep the current artwork.' : ''}
          </div>
        </div>

        {previewUrl && <img src={previewUrl} className="mx-auto max-h-56 rounded-xl" alt="Drawing preview" />}

        <input className="input" placeholder="Medium (pencil, digital...)" value={form.medium} onChange={set('medium')} />
        <textarea className="input" placeholder="Description" value={form.description} onChange={set('description')} />
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary">{busy ? '...' : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

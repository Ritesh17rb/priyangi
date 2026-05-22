import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';
import { useAlerts } from '../components/AlertProvider.jsx';

const QUICK_FILTERS = ['All', 'BLACKPINK', 'BTS', 'TWICE', 'NewJeans', 'IVE', 'aespa', 'LE SSERAFIM', 'Other'];

export default function Music() {
  const { user, isAdmin } = useAuth();
  const { confirm, notify } = useAlerts();
  const [tracks, setTracks] = useState([]);
  const [filter, setFilter] = useState('All');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [playing, setPlaying] = useState(null);

  function load() { api('/music', { auth: false }).then(setTracks); }
  useEffect(load, []);

  const filtered = useMemo(() => {
    if (filter === 'All') return tracks;
    if (filter === 'Other') return tracks.filter((track) => !QUICK_FILTERS.slice(1, -1).includes(track.group));
    return tracks.filter((track) => track.group === filter);
  }, [tracks, filter]);

  async function fav(id) {
    if (!user) return;
    await api(`/music/${id}/favorite`, { method: 'POST' });
    load();
  }

  async function del(id) {
    const approved = await confirm({
      title: 'Remove this track?',
      message: 'This will delete the track from the library.',
      confirmText: 'Delete track',
    });
    if (!approved) return;
    await api(`/music/${id}`, { method: 'DELETE' });
    load();
  }

  async function seed() {
    const approved = await confirm({
      title: 'Seed the K-pop library?',
      message: 'This adds about 30 popular tracks. Existing tracks stay untouched and will not be duplicated.',
      confirmText: 'Seed library',
      tone: 'info',
    });
    if (!approved) return;

    const result = await api('/music/seed', { method: 'POST' });
    notify({
      tone: 'success',
      title: 'Library refreshed',
      message: `Added ${result.added} new tracks. Skipped ${result.skipped} already in the collection.`,
    });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="section-title !mb-1 text-left">Music <span className="shimmer-text">Vibes</span></h1>
          <p className="text-ink-light">K-Pop, ballads, mood boosters.</p>
        </div>
        {isAdmin && (
          <div className="flex flex-wrap gap-2">
            <button onClick={seed} className="btn-purple">Seed K-Pop library</button>
            <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">+ Add track</button>
          </div>
        )}
      </div>

      <div className="mb-6 flex flex-wrap gap-2">
        {QUICK_FILTERS.map((group) => (
          <button
            key={group}
            onClick={() => setFilter(group)}
            className={`rounded-full px-4 py-1.5 text-sm font-bold transition ${
              filter === group ? 'bg-pink text-white shadow-pinky' : 'bg-white/70 text-ink hover:bg-pink-pale'
            }`}
          >
            {group}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <div className="card py-12 text-center text-ink-light">No tracks yet. {isAdmin && 'Add your first one.'}</div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {filtered.map((track, index) => (
            <motion.div
              key={track._id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="card !p-0 overflow-hidden"
            >
              <div className="relative aspect-video bg-black/5">
                <img
                  src={track.coverImage || `https://i.ytimg.com/vi/${track.youtubeId}/hqdefault.jpg`}
                  alt={track.title}
                  className="h-full w-full object-cover"
                />
                <button
                  onClick={() => setPlaying(track)}
                  className="group absolute inset-0 grid place-items-center bg-black/0 transition hover:bg-black/30"
                >
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-white/95 text-2xl text-pink shadow-pinky transition group-hover:scale-110">
                    &gt;
                  </div>
                </button>
              </div>
              <div className="p-4">
                <div className="text-xs font-bold uppercase tracking-wider text-pink">{track.group || track.genre}</div>
                <div className="font-display text-xl text-ink">{track.title}</div>
                <div className="text-sm text-ink-light">{track.artist}</div>
                <div className="mt-2 flex items-center justify-between">
                  <button onClick={() => fav(track._id)} className="text-sm font-semibold">
                    Love {track.favoritedBy?.length || 0}
                  </button>
                  {isAdmin && (
                    <div className="flex gap-1">
                      <button onClick={() => { setEditing(track); setOpen(true); }} className="text-xs font-bold text-purple">Edit</button>
                      <button onClick={() => del(track._id)} className="text-xs font-bold text-red-500">Delete</button>
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {playing && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setPlaying(null)}
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
          >
            <div onClick={(event) => event.stopPropagation()} className="w-full max-w-3xl">
              <div className="aspect-video overflow-hidden rounded-2xl shadow-soft">
                <iframe
                  src={`https://www.youtube.com/embed/${playing.youtubeId}?autoplay=1`}
                  title={playing.title}
                  className="h-full w-full"
                  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                  allowFullScreen
                />
              </div>
              <div className="mt-3 text-center text-white">
                <div className="font-display text-xl">{playing.title}</div>
                <div className="text-white/80">{playing.artist}</div>
              </div>
            </div>
          </motion.div>
        )}
        {open && (
          <MusicModal
            initial={editing}
            onClose={() => setOpen(false)}
            onSaved={() => { setOpen(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function MusicModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(
    initial || { title: '', artist: '', group: 'BLACKPINK', genre: 'K-Pop', youtubeId: '', coverImage: '', notes: '' }
  );
  const [busy, setBusy] = useState(false);

  function set(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      if (initial) await api(`/music/${initial._id}`, { method: 'PUT', body: form });
      else await api('/music', { method: 'POST', body: form });
      onSaved();
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
        <h2 className="font-display text-2xl">{initial ? 'Edit' : 'Add'} track</h2>
        <input className="input" placeholder="Title" required value={form.title} onChange={set('title')} />
        <input className="input" placeholder="Artist" required value={form.artist} onChange={set('artist')} />
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <input className="input" placeholder="Group (BLACKPINK...)" value={form.group} onChange={set('group')} />
          <input className="input" placeholder="Genre" value={form.genre} onChange={set('genre')} />
        </div>
        <input className="input" placeholder="YouTube URL or 11-char ID" required value={form.youtubeId} onChange={set('youtubeId')} />
        <input className="input" placeholder="Cover image URL (optional)" value={form.coverImage} onChange={set('coverImage')} />
        <textarea className="input" placeholder="Notes / why you love it" value={form.notes} onChange={set('notes')} />
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary">{busy ? '...' : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

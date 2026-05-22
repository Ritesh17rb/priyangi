import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';
import { useAuth } from '../auth/AuthContext.jsx';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const DEFAULT_SCHEDULE = JSON.parse(
  localStorage.getItem('priyangi_schedule') ||
    JSON.stringify(DAYS.reduce((a, d) => ({ ...a, [d]: ['', '', '', '', '', ''] }), {}))
);

export default function School() {
  const { isAdmin } = useAuth();
  const [info, setInfo] = useState(null);
  const [items, setItems] = useState([]);
  const [schedule, setSchedule] = useState(DEFAULT_SCHEDULE);
  const [editOpen, setEditOpen] = useState(false);

  useEffect(() => {
    api('/school', { auth: false }).then(setInfo);
    api('/articles?category=school', { auth: false }).then(setItems);
  }, []);

  function setCell(day, period, value) {
    const next = { ...schedule, [day]: schedule[day].map((v, i) => (i === period ? value : v)) };
    setSchedule(next);
    localStorage.setItem('priyangi_schedule', JSON.stringify(next));
  }

  if (!info) return <div className="text-center py-20 text-ink-light">Loading… ✨</div>;

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <motion.section
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        className="rounded-3xl overflow-hidden shadow-soft mb-10 relative"
      >
        <div
          className="h-64 md:h-80 bg-gradient-to-br from-pink to-purple relative"
          style={info.coverImage ? { backgroundImage: `url(${info.coverImage})`, backgroundSize: 'cover', backgroundPosition: 'center' } : {}}
        >
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-6 left-6 right-6 text-white">
            <div className="font-script text-2xl text-pink-light">{info.tagline}</div>
            <h1 className="font-display text-4xl md:text-6xl font-bold drop-shadow-lg">{info.name}</h1>
            <div className="mt-2 italic opacity-90">"{info.motto}"</div>
          </div>
          {isAdmin && (
            <button onClick={() => setEditOpen(true)} className="absolute top-4 right-4 btn-primary !py-1 !px-3 text-sm">
              ✏️ Edit profile
            </button>
          )}
        </div>
      </motion.section>

      <div className="grid lg:grid-cols-3 gap-6 mb-10">
        <div className="card lg:col-span-2">
          <h2 className="font-display text-2xl mb-2">📖 About the school</h2>
          {info.description ? (
            <p className="whitespace-pre-wrap text-ink/90 leading-relaxed">{info.description}</p>
          ) : (
            <p className="text-ink-light italic">
              {isAdmin
                ? 'Click "Edit profile" to add a description, photos, achievements, and more about your school.'
                : 'School details will appear here soon ✨'}
            </p>
          )}
          {info.achievements?.length > 0 && (
            <div className="mt-5">
              <div className="text-sm font-bold text-pink uppercase mb-2">🏆 Achievements</div>
              <ul className="space-y-1">
                {info.achievements.map((a, i) => <li key={i} className="bg-pink-pale rounded-lg px-3 py-1">✨ {a}</li>)}
              </ul>
            </div>
          )}
          {info.facilities?.length > 0 && (
            <div className="mt-5">
              <div className="text-sm font-bold text-purple uppercase mb-2">🏫 Facilities</div>
              <div className="flex flex-wrap gap-2">
                {info.facilities.map((f, i) => <span key={i} className="chip !bg-purple-light/40 !text-purple !border-purple/40">{f}</span>)}
              </div>
            </div>
          )}
        </div>

        <div className="space-y-3">
          <div className="card">
            <div className="text-sm font-bold text-pink uppercase mb-2">School info</div>
            <dl className="text-sm space-y-1">
              {info.founded && <Row label="Founded" v={info.founded} />}
              {info.principal && <Row label="Principal" v={info.principal} />}
              {info.address && <Row label="Address" v={info.address} />}
              {info.website && <Row label="Website" v={<a className="text-pink font-bold" href={info.website} target="_blank" rel="noreferrer">visit ↗</a>} />}
            </dl>
          </div>
          {info.favoriteTeachers?.length > 0 && (
            <div className="card">
              <div className="text-sm font-bold text-purple uppercase mb-2">💖 Favorite teachers</div>
              <div className="space-y-2">
                {info.favoriteTeachers.map((t, i) => (
                  <div key={i} className="bg-purple/5 rounded-xl p-3">
                    <div className="font-bold">{t.name}</div>
                    <div className="text-xs text-ink-light">{t.subject}</div>
                    {t.note && <div className="text-sm mt-1 italic">"{t.note}"</div>}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {info.photos?.length > 0 && (
        <section className="mb-10">
          <h2 className="font-display text-2xl mb-3">📸 School moments</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {info.photos.map((p, i) => (
              <img key={i} src={p} alt="" className="rounded-2xl aspect-square object-cover shadow-soft hover:scale-[1.02] transition" />
            ))}
          </div>
        </section>
      )}

      {info.bestMemories?.length > 0 && (
        <section className="card mb-10">
          <h2 className="font-display text-2xl mb-3">💖 Best memories</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {info.bestMemories.map((m, i) => (
              <div key={i} className="bg-gradient-to-br from-pink-pale to-purple-light/20 rounded-2xl p-4 text-ink/90">
                {m}
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="card overflow-x-auto mb-10">
        <h2 className="font-display text-2xl mb-2">📚 Weekly timetable</h2>
        <p className="text-xs text-ink-light mb-3">Saved on this device. Click any cell to edit.</p>
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="px-2 py-1 text-left text-pink">Period</th>
              {DAYS.map((d) => <th key={d} className="px-2 py-1 text-pink">{d}</th>)}
            </tr>
          </thead>
          <tbody>
            {[0, 1, 2, 3, 4, 5].map((p) => (
              <tr key={p} className="border-t border-pink-light/40">
                <td className="px-2 py-1 font-bold text-ink-light">{p + 1}</td>
                {DAYS.map((d) => (
                  <td key={d} className="px-1 py-1">
                    <input
                      className="w-full px-2 py-1 rounded-lg bg-pink-pale focus:bg-white focus:ring-2 focus:ring-pink-light/40 outline-none text-ink"
                      value={schedule[d][p]}
                      onChange={(e) => setCell(d, p, e.target.value)}
                      placeholder="—"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="flex items-center justify-between mb-4">
        <h2 className="font-display text-2xl">School posts</h2>
        {isAdmin && <Link to="/articles/new" className="btn-primary">+ New post</Link>}
      </div>
      {items.length === 0 ? (
        <div className="card text-center text-ink-light py-10">Nothing posted yet.</div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
          {items.map((a, i) => (
            <motion.div key={a._id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <Link to={`/articles/${a.slug}`} className="card block hover:scale-[1.02] transition h-full">
                <span className="chip">school</span>
                <h3 className="font-display text-2xl mt-2 mb-1">{a.title}</h3>
                <p className="text-sm text-ink-light line-clamp-3">{a.excerpt}</p>
              </Link>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {editOpen && (
          <SchoolEditor
            initial={info}
            onClose={() => setEditOpen(false)}
            onSaved={(saved) => { setInfo(saved); setEditOpen(false); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function Row({ label, v }) {
  return (
    <div className="flex justify-between gap-3">
      <dt className="text-ink-light">{label}</dt>
      <dd className="font-semibold text-right">{v}</dd>
    </div>
  );
}

function SchoolEditor({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => ({
    name: initial.name || '',
    tagline: initial.tagline || '',
    motto: initial.motto || '',
    founded: initial.founded || '',
    principal: initial.principal || '',
    address: initial.address || '',
    website: initial.website || '',
    description: initial.description || '',
    coverImage: initial.coverImage || '',
    photos: (initial.photos || []).join('\n'),
    achievements: (initial.achievements || []).join('\n'),
    facilities: (initial.facilities || []).join(', '),
    bestMemories: (initial.bestMemories || []).join('\n'),
    teachersText: (initial.favoriteTeachers || [])
      .map((t) => `${t.name || ''}|${t.subject || ''}|${t.note || ''}`)
      .join('\n'),
  }));
  const [busy, setBusy] = useState(false);
  function set(k) { return (e) => setForm((f) => ({ ...f, [k]: e.target.value })); }
  async function submit(e) {
    e.preventDefault(); setBusy(true);
    try {
      const body = {
        name: form.name, tagline: form.tagline, motto: form.motto,
        founded: form.founded, principal: form.principal, address: form.address,
        website: form.website, description: form.description, coverImage: form.coverImage,
        photos: form.photos.split('\n').map((s) => s.trim()).filter(Boolean),
        achievements: form.achievements.split('\n').map((s) => s.trim()).filter(Boolean),
        facilities: form.facilities.split(',').map((s) => s.trim()).filter(Boolean),
        bestMemories: form.bestMemories.split('\n').map((s) => s.trim()).filter(Boolean),
        favoriteTeachers: form.teachersText.split('\n').map((line) => {
          const [name, subject, note] = line.split('|').map((s) => (s || '').trim());
          return name ? { name, subject: subject || '', note: note || '' } : null;
        }).filter(Boolean),
      };
      const saved = await api('/school', { method: 'PUT', body });
      onSaved(saved);
    } finally { setBusy(false); }
  }
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 z-[110] flex items-center justify-center p-4">
      <motion.form initial={{ scale: 0.92 }} animate={{ scale: 1 }} onSubmit={submit}
        className="card w-full max-w-2xl max-h-[92vh] overflow-auto space-y-3">
        <h2 className="font-display text-2xl">School profile</h2>
        <div className="grid md:grid-cols-2 gap-2">
          <Field label="Name"><input className="input" value={form.name} onChange={set('name')} /></Field>
          <Field label="Tagline"><input className="input" value={form.tagline} onChange={set('tagline')} /></Field>
          <Field label="Motto"><input className="input" value={form.motto} onChange={set('motto')} /></Field>
          <Field label="Founded"><input className="input" value={form.founded} onChange={set('founded')} /></Field>
          <Field label="Principal"><input className="input" value={form.principal} onChange={set('principal')} /></Field>
          <Field label="Website"><input className="input" value={form.website} onChange={set('website')} /></Field>
        </div>
        <Field label="Address"><input className="input" value={form.address} onChange={set('address')} /></Field>
        <Field label="Cover image URL"><input className="input" value={form.coverImage} onChange={set('coverImage')} /></Field>
        <Field label="Description"><textarea className="input min-h-[120px]" value={form.description} onChange={set('description')} /></Field>
        <Field label="Achievements (one per line)"><textarea className="input min-h-[80px]" value={form.achievements} onChange={set('achievements')} /></Field>
        <Field label="Facilities (comma separated)"><input className="input" value={form.facilities} onChange={set('facilities')} /></Field>
        <Field label="Photo URLs (one per line)"><textarea className="input min-h-[80px]" value={form.photos} onChange={set('photos')} /></Field>
        <Field label="Best memories (one per line)"><textarea className="input min-h-[80px]" value={form.bestMemories} onChange={set('bestMemories')} /></Field>
        <Field label="Favorite teachers — one per line, format: Name | Subject | Note">
          <textarea className="input min-h-[80px]" value={form.teachersText} onChange={set('teachersText')} placeholder="Mrs. Sharma | English | Loves Shakespeare" />
        </Field>
        <div className="flex gap-2 sticky bottom-0 bg-white/90 pt-2">
          <button disabled={busy} className="btn-primary">{busy ? 'Saving…' : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

function Field({ label, children }) {
  return (
    <label className="block">
      <div className="label">{label}</div>
      {children}
    </label>
  );
}

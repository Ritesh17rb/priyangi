import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';
import { useAlerts } from '../components/AlertProvider.jsx';

export default function Contacts() {
  const { confirm } = useAlerts();
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);

  function load() { api('/contacts').then(setList); }
  useEffect(load, []);

  const filtered = useMemo(() => {
    const term = q.trim().toLowerCase();
    if (!term) return list;
    return list.filter((contact) =>
      [contact.name, contact.nickname, contact.phone, contact.email, contact.school]
        .filter(Boolean)
        .join(' ')
        .toLowerCase()
        .includes(term)
    );
  }, [list, q]);

  async function fav(contact) {
    await api(`/contacts/${contact._id}`, { method: 'PUT', body: { favorite: !contact.favorite } });
    load();
  }

  async function del(id) {
    const approved = await confirm({
      title: 'Delete contact?',
      message: 'This removes the contact card from your private directory.',
      confirmText: 'Delete contact',
    });
    if (!approved) return;
    await api(`/contacts/${id}`, { method: 'DELETE' });
    load();
  }

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="section-title !mb-1 text-left">My <span className="shimmer-text">Friends</span></h1>
          <p className="text-ink-light">Private directory - only you can see this.</p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <input className="input !py-2 flex-1 sm:flex-none sm:!w-64" placeholder="Search..." value={q} onChange={(event) => setQ(event.target.value)} />
          <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary whitespace-nowrap">+ Add friend</button>
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="card py-12 text-center text-ink-light">No contacts yet.</div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((contact, index) => (
            <motion.div
              key={contact._id}
              layout
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
              className="card group relative flex flex-col gap-1"
            >
              <button onClick={() => fav(contact)} className="absolute top-3 right-3 text-xl">
                {contact.favorite ? '*' : '+'}
              </button>
              <div className="flex items-center gap-3">
                <div className="grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-pink to-purple text-xl font-bold text-white">
                  {contact.name?.[0]?.toUpperCase() || '?'}
                </div>
                <div>
                  <div className="font-bold text-ink">{contact.name}</div>
                  {contact.nickname && <div className="text-xs text-pink">"{contact.nickname}"</div>}
                </div>
              </div>
              <div className="mt-2 space-y-0.5 text-sm">
                {contact.phone && <div>Phone: <a className="hover:text-pink" href={`tel:${contact.phone}`}>{contact.phone}</a></div>}
                {contact.email && <div>Email: <a className="hover:text-pink" href={`mailto:${contact.email}`}>{contact.email}</a></div>}
                {contact.instagram && <div>Instagram: @{contact.instagram}</div>}
                {contact.snapchat && <div>Snapchat: {contact.snapchat}</div>}
                {contact.school && <div>School: {contact.school}</div>}
                {contact.birthday && <div>Birthday: {new Date(contact.birthday).toLocaleDateString()}</div>}
                {contact.notes && <div className="mt-1 italic text-ink-light">{contact.notes}</div>}
              </div>
              <div className="mt-3 flex gap-2">
                <button onClick={() => { setEditing(contact); setOpen(true); }} className="text-xs font-bold text-purple">Edit</button>
                <button onClick={() => del(contact._id)} className="text-xs font-bold text-red-500">Delete</button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      <AnimatePresence>
        {open && <ContactModal initial={editing} onClose={() => setOpen(false)} onSaved={() => { setOpen(false); load(); }} />}
      </AnimatePresence>
    </div>
  );
}

function ContactModal({ initial, onClose, onSaved }) {
  const empty = { name: '', nickname: '', phone: '', email: '', instagram: '', snapchat: '', school: '', birthday: '', notes: '', favorite: false };
  const [form, setForm] = useState(() => {
    if (!initial) return empty;
    return { ...empty, ...initial, birthday: initial.birthday ? new Date(initial.birthday).toISOString().slice(0, 10) : '' };
  });
  const [busy, setBusy] = useState(false);

  function set(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = { ...form, birthday: form.birthday || undefined };
      if (initial?._id) await api(`/contacts/${initial._id}`, { method: 'PUT', body });
      else await api('/contacts', { method: 'POST', body });
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
      <motion.form initial={{ scale: 0.9 }} animate={{ scale: 1 }} onSubmit={submit} className="card max-h-[90vh] w-full max-w-lg space-y-2 overflow-auto">
        <h2 className="font-display text-2xl">{initial?._id ? 'Edit' : 'Add'} friend</h2>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Name" required value={form.name} onChange={set('name')} />
          <input className="input" placeholder="Nickname" value={form.nickname} onChange={set('nickname')} />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Phone" value={form.phone} onChange={set('phone')} />
          <input className="input" type="email" placeholder="Email" value={form.email} onChange={set('email')} />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input" placeholder="Instagram" value={form.instagram} onChange={set('instagram')} />
          <input className="input" placeholder="Snapchat" value={form.snapchat} onChange={set('snapchat')} />
        </div>
        <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
          <input className="input" placeholder="School" value={form.school} onChange={set('school')} />
          <input className="input" type="date" value={form.birthday} onChange={set('birthday')} />
        </div>
        <textarea className="input" placeholder="Notes" value={form.notes} onChange={set('notes')} />
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary">{busy ? '...' : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

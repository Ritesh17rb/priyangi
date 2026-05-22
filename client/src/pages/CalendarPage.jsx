import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../api.js';
import { useAlerts } from '../components/AlertProvider.jsx';

const CATS = [
  { value: 'school', label: 'School', color: '#FF6B9D' },
  { value: 'study', label: 'Study', color: '#C77DFF' },
  { value: 'personal', label: 'Personal', color: '#06D6A0' },
  { value: 'birthday', label: 'Birthday', color: '#FFD700' },
  { value: 'holiday', label: 'Holiday', color: '#FFB347' },
  { value: 'other', label: 'Other', color: '#9B6AAE' },
];

function startOfMonth(date) { return new Date(date.getFullYear(), date.getMonth(), 1); }
function daysInMonth(date) { return new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate(); }

export default function CalendarPage() {
  const { confirm } = useAlerts();
  const [cursor, setCursor] = useState(() => startOfMonth(new Date()));
  const [events, setEvents] = useState([]);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [activeDay, setActiveDay] = useState(null);

  function load() {
    const from = startOfMonth(cursor);
    const to = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0, 23, 59, 59);
    api(`/events?from=${from.toISOString()}&to=${to.toISOString()}`).then(setEvents);
  }

  useEffect(load, [cursor]);

  const grid = useMemo(() => {
    const first = startOfMonth(cursor);
    const dayOfWeek = first.getDay();
    const total = daysInMonth(cursor);
    const cells = [];
    for (let index = 0; index < dayOfWeek; index += 1) cells.push(null);
    for (let day = 1; day <= total; day += 1) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), day));
    while (cells.length % 7 !== 0) cells.push(null);
    return cells;
  }, [cursor]);

  const eventsByDay = useMemo(() => {
    const map = {};
    events.forEach((event) => {
      const key = new Date(event.date).toDateString();
      (map[key] ||= []).push(event);
    });
    return map;
  }, [events]);

  function newOnDay(day) {
    setEditing({ date: day.toISOString().slice(0, 10), title: '', category: 'personal', description: '', color: '#FF6B9D' });
    setOpen(true);
  }

  async function del(id) {
    const approved = await confirm({
      title: 'Delete event?',
      message: 'This event will be removed from the calendar.',
      confirmText: 'Delete event',
    });
    if (!approved) return;
    await api(`/events/${id}`, { method: 'DELETE' });
    load();
  }

  const monthName = cursor.toLocaleString('default', { month: 'long', year: 'numeric' });

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <h1 className="section-title !mb-0 text-left">My <span className="shimmer-text">Calendar</span></h1>
        <button onClick={() => { setEditing(null); setOpen(true); }} className="btn-primary">+ New event</button>
      </div>

      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))} className="btn-ghost !px-3 !py-1">
            &lt;
          </button>
          <h2 className="font-display text-2xl shimmer-text">{monthName}</h2>
          <button onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))} className="btn-ghost !px-3 !py-1">
            &gt;
          </button>
        </div>
        <div className="mb-1 grid grid-cols-7 gap-1 text-xs font-bold uppercase text-pink">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
            <div key={day} className="py-1 text-center">{day}</div>
          ))}
        </div>
        <div className="grid grid-cols-7 gap-1">
          {grid.map((day, index) => {
            if (!day) return <div key={index} className="h-16 rounded-lg bg-transparent sm:h-24" />;
            const todaysEvents = eventsByDay[day.toDateString()] || [];
            const isToday = day.toDateString() === new Date().toDateString();
            return (
              <button
                key={index}
                onClick={() => setActiveDay(day)}
                onDoubleClick={() => newOnDay(day)}
                className={`relative h-16 overflow-hidden rounded-lg p-1.5 text-left transition sm:h-24 ${
                  isToday ? 'ring-2 ring-pink shadow-pinky' : 'border border-pink-light/40'
                } bg-white/70 hover:bg-pink-pale`}
              >
                <div className={`text-xs font-bold ${isToday ? 'text-pink' : 'text-ink'}`}>{day.getDate()}</div>
                <div className="mt-0.5 space-y-0.5">
                  {todaysEvents.slice(0, 2).map((event) => (
                    <div key={event._id} className="truncate rounded px-1 text-[10px] text-white" style={{ background: event.color }}>
                      {event.title}
                    </div>
                  ))}
                  {todaysEvents.length > 2 && <div className="text-[10px] text-ink-light">+{todaysEvents.length - 2} more</div>}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      <AnimatePresence>
        {activeDay && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-end justify-center bg-black/40 p-4 md:items-center"
            onClick={() => setActiveDay(null)}
          >
            <motion.div initial={{ y: 30 }} animate={{ y: 0 }} onClick={(event) => event.stopPropagation()} className="card w-full max-w-md">
              <div className="mb-3 flex items-center justify-between">
                <h3 className="font-display text-xl">{activeDay.toDateString()}</h3>
                <button onClick={() => { newOnDay(activeDay); setActiveDay(null); }} className="btn-primary !px-3 !py-1 text-sm">+ Add</button>
              </div>
              <div className="max-h-72 space-y-2 overflow-auto">
                {(eventsByDay[activeDay.toDateString()] || []).map((event) => (
                  <div key={event._id} className="flex items-start gap-2 rounded-lg bg-pink-pale p-2">
                    <div className="mt-2 h-2 w-2 rounded-full" style={{ background: event.color }} />
                    <div className="flex-1">
                      <div className="font-bold">{event.title}</div>
                      {event.description && <div className="text-xs text-ink-light">{event.description}</div>}
                    </div>
                    <button onClick={() => { setEditing(event); setOpen(true); setActiveDay(null); }} className="text-xs font-bold text-purple">Edit</button>
                    <button onClick={() => del(event._id)} className="text-xs font-bold text-red-500">x</button>
                  </div>
                ))}
                {(eventsByDay[activeDay.toDateString()] || []).length === 0 && (
                  <div className="py-4 text-center text-sm text-ink-light">No plans yet.</div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
        {open && (
          <EventModal
            initial={editing}
            onClose={() => setOpen(false)}
            onSaved={() => { setOpen(false); load(); }}
          />
        )}
      </AnimatePresence>
    </div>
  );
}

function EventModal({ initial, onClose, onSaved }) {
  const [form, setForm] = useState(() => {
    if (!initial) return { title: '', description: '', date: new Date().toISOString().slice(0, 16), color: '#FF6B9D', category: 'personal' };
    return {
      ...initial,
      date: typeof initial.date === 'string' && initial.date.length === 10
        ? `${initial.date}T09:00`
        : new Date(initial.date).toISOString().slice(0, 16),
    };
  });
  const [busy, setBusy] = useState(false);

  function set(key) {
    return (event) => setForm((current) => ({ ...current, [key]: event.target.value }));
  }

  function setCat(category) {
    setForm((current) => ({ ...current, category: category.value, color: category.color }));
  }

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    try {
      const body = { ...form };
      if (initial?._id) await api(`/events/${initial._id}`, { method: 'PUT', body });
      else await api('/events', { method: 'POST', body });
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
      className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 p-5"
    >
      <motion.form initial={{ scale: 0.9 }} animate={{ scale: 1 }} onSubmit={submit} className="card w-full max-w-md space-y-3">
        <h2 className="font-display text-2xl">{initial?._id ? 'Edit' : 'New'} event</h2>
        <input className="input" placeholder="Title" required value={form.title} onChange={set('title')} />
        <input className="input" type="datetime-local" required value={form.date} onChange={set('date')} />
        <textarea className="input" placeholder="Description" value={form.description} onChange={set('description')} />
        <div className="flex flex-wrap gap-2">
          {CATS.map((category) => (
            <button
              type="button"
              key={category.value}
              onClick={() => setCat(category)}
              className={`rounded-full border-2 px-3 py-1 text-xs font-bold ${
                form.category === category.value ? 'text-white' : 'border-pink-light bg-white text-ink'
              }`}
              style={form.category === category.value ? { background: category.color, borderColor: category.color } : {}}
            >
              {category.label}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <button disabled={busy} className="btn-primary">{busy ? '...' : 'Save'}</button>
          <button type="button" onClick={onClose} className="btn-ghost">Cancel</button>
        </div>
      </motion.form>
    </motion.div>
  );
}

import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAuth } from '../auth/AuthContext.jsx';

export default function Register() {
  const { register } = useAuth();
  const navigate = useNavigate();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [err, setErr] = useState('');
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setErr(''); setBusy(true);
    try { await register(name, email, password); navigate('/'); }
    catch (e) { setErr(e.message); }
    finally { setBusy(false); }
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-5">
      <motion.form
        onSubmit={submit}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card w-full max-w-md"
      >
        <h1 className="font-display text-3xl text-center shimmer-text mb-1">Join the world 💖</h1>
        <p className="text-center text-ink-light text-sm mb-6">Create your sparkle account.</p>
        <div className="space-y-3">
          <div>
            <label className="label">Name</label>
            <input className="input" required value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div>
            <label className="label">Email</label>
            <input className="input" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} />
          </div>
          <div>
            <label className="label">Password (6+ chars)</label>
            <input className="input" type="password" minLength={6} required value={password} onChange={(e) => setPassword(e.target.value)} />
          </div>
          {err && <div className="text-pink text-sm font-semibold">{err}</div>}
          <button disabled={busy} className="btn-primary w-full">{busy ? '...' : 'Create account'}</button>
          <div className="text-center text-sm text-ink-light">
            Already have one? <Link to="/login" className="text-pink font-bold">Login</Link>
          </div>
        </div>
      </motion.form>
    </div>
  );
}

import { Link, NavLink, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../auth/AuthContext.jsx';

const links = [
  { to: '/', label: 'Home' },
  { to: '/articles', label: 'Articles' },
  { to: '/drawings', label: 'Drawings' },
  { to: '/games', label: 'Games' },
  { to: '/music', label: 'Music' },
  { to: '/youtube', label: 'YouTube' },
  { to: '/study', label: 'Study' },
  { to: '/school', label: 'School' },
  { to: '/calendar', label: 'Calendar' },
  { to: '/contacts', label: 'Contacts' },
];

export default function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 backdrop-blur-md bg-cream/80 border-b-2 border-pink-light/60 shadow-[0_2px_20px_rgba(255,107,157,0.12)]">
      <div className="max-w-7xl mx-auto flex items-center justify-between px-5 py-3">
        <Link to="/" className="font-script text-2xl md:text-3xl shimmer-text">
          ✨ Priyangi
        </Link>

        <ul className="hidden lg:flex items-center gap-1">
          {links.map((l) => (
            <li key={l.to}>
              <NavLink
                to={l.to}
                className={({ isActive }) =>
                  `px-3 py-2 rounded-full text-sm font-semibold transition ${
                    isActive
                      ? 'bg-pink text-white shadow-pinky'
                      : 'text-ink hover:bg-pink-pale'
                  }`
                }
              >
                {l.label}
              </NavLink>
            </li>
          ))}
        </ul>

        <div className="hidden lg:flex items-center gap-2">
          {user ? (
            <>
              {isAdmin && <span className="chip !bg-purple-light/40 !text-purple !border-purple/40">👑 Admin</span>}
              <span className="text-sm font-semibold text-ink">{user.name}</span>
              <button onClick={() => { logout(); navigate('/'); }} className="btn-ghost !py-1.5 !px-3 text-sm">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn-ghost !py-1.5 !px-4 text-sm">Login</Link>
              <Link to="/register" className="btn-primary !py-1.5 !px-4 text-sm">Sign up</Link>
            </>
          )}
        </div>

        <button onClick={() => setOpen(!open)} className="lg:hidden text-2xl text-pink">
          {open ? '✕' : '☰'}
        </button>
      </div>

      {open && (
        <div className="lg:hidden border-t border-pink-light/40 px-4 py-3 bg-white/80 backdrop-blur">
          <ul className="grid grid-cols-2 gap-2">
            {links.map((l) => (
              <li key={l.to}>
                <NavLink
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={({ isActive }) =>
                    `block px-3 py-2 rounded-xl text-sm font-semibold ${
                      isActive ? 'bg-pink text-white' : 'bg-pink-pale text-ink'
                    }`
                  }
                >
                  {l.label}
                </NavLink>
              </li>
            ))}
          </ul>
          <div className="flex gap-2 mt-3">
            {user ? (
              <button onClick={() => { logout(); setOpen(false); }} className="btn-ghost flex-1">Logout ({user.name})</button>
            ) : (
              <>
                <Link to="/login" onClick={() => setOpen(false)} className="btn-ghost flex-1">Login</Link>
                <Link to="/register" onClick={() => setOpen(false)} className="btn-primary flex-1">Sign up</Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}

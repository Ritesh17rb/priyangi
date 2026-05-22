import { useEffect, useState } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import Intro from './components/Intro.jsx';
import Navbar from './components/Navbar.jsx';
import SparkleBackground from './components/SparkleBackground.jsx';
import Home from './pages/Home.jsx';
import Articles from './pages/Articles.jsx';
import ArticleDetail from './pages/ArticleDetail.jsx';
import ArticleEditor from './pages/ArticleEditor.jsx';
import Drawings from './pages/Drawings.jsx';
import Games from './pages/Games.jsx';
import Music from './pages/Music.jsx';
import YouTubePage from './pages/YouTube.jsx';
import Study from './pages/Study.jsx';
import School from './pages/School.jsx';
import CalendarPage from './pages/CalendarPage.jsx';
import Contacts from './pages/Contacts.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import { useAuth } from './auth/AuthContext.jsx';

function ProtectedRoute({ children, adminOnly = false }) {
  const { user, loading, isAdmin } = useAuth();
  if (loading) return null;
  if (!user) return <Navigate to="/login" replace />;
  if (adminOnly && !isAdmin) return <Navigate to="/" replace />;
  return children;
}

export default function App() {
  const [showIntro, setShowIntro] = useState(() => !sessionStorage.getItem('introSeen'));

  useEffect(() => {
    if (!showIntro) return;
    const t = setTimeout(() => {
      sessionStorage.setItem('introSeen', '1');
      setShowIntro(false);
    }, 4200);
    return () => clearTimeout(t);
  }, [showIntro]);

  return (
    <>
      <SparkleBackground />
      <AnimatePresence>{showIntro && <Intro key="intro" onSkip={() => setShowIntro(false)} />}</AnimatePresence>
      {!showIntro && (
        <>
          <Navbar />
          <main className="relative z-10">
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/articles/new" element={<ProtectedRoute adminOnly><ArticleEditor /></ProtectedRoute>} />
              <Route path="/articles/edit/:id" element={<ProtectedRoute adminOnly><ArticleEditor /></ProtectedRoute>} />
              <Route path="/articles/:slug" element={<ArticleDetail />} />
              <Route path="/drawings" element={<Drawings />} />
              <Route path="/games" element={<Games />} />
              <Route path="/music" element={<Music />} />
              <Route path="/youtube" element={<YouTubePage />} />
              <Route path="/study" element={<Study />} />
              <Route path="/school" element={<School />} />
              <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
              <Route path="/contacts" element={<ProtectedRoute><Contacts /></ProtectedRoute>} />
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
          <footer className="relative z-0 mt-24 py-10 text-center text-ink-light">
            <div className="font-script text-2xl text-pink">Priyangi's Magical World ✨</div>
            <div className="text-sm mt-1">Made with 💖 — sparkle every day.</div>
          </footer>
        </>
      )}
    </>
  );
}

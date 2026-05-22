import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import DailyAffirmation from '../components/DailyAffirmation.jsx';

const tiles = [
  { to: '/articles', icon: '📝', title: 'Articles', desc: 'Stories, thoughts & diaries', color: 'from-pink to-pink-light' },
  { to: '/drawings', icon: '🎨', title: 'Drawings', desc: 'My art gallery', color: 'from-purple to-purple-light' },
  { to: '/games', icon: '🎮', title: 'Games', desc: '21 games, built for mobile', color: 'from-pink to-purple' },
  { to: '/music', icon: '🎵', title: 'Music', desc: 'BLACKPINK, K-pop, vibes', color: 'from-purple to-pink' },
  { to: '/youtube', icon: '▶️', title: 'YouTube', desc: 'Search and play in-app', color: 'from-pink to-purple-light' },
  { to: '/study', icon: '📚', title: 'Study', desc: 'Notes & focus timer', color: 'from-pink-light to-purple-light' },
  { to: '/school', icon: '🏫', title: 'School', desc: 'My school world', color: 'from-purple-light to-pink-light' },
  { to: '/calendar', icon: '🗓', title: 'Calendar', desc: 'Plan everything', color: 'from-pink to-purple-light' },
  { to: '/contacts', icon: '📇', title: 'Friends', desc: 'My private directory', color: 'from-purple to-pink-light' },
];

export default function Home() {
  const { user, isAdmin } = useAuth();

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <motion.section
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="text-center mb-14"
      >
        <div className="font-script text-3xl md:text-4xl text-pink mb-2">Hi, I'm</div>
        <h1 className="font-display text-6xl md:text-8xl font-bold shimmer-text leading-tight">Priyangi</h1>
        <p className="mt-5 max-w-2xl mx-auto text-ink-light text-lg">
          A teenage explorer of art, music, books and dreams. Welcome to my magical corner of the internet —
          here you'll find my drawings, articles, playlists, study notes, and a few games to play together. ✨
        </p>
        <div className="mt-7 flex flex-wrap gap-3 justify-center">
          <Link to="/articles" className="btn-primary">Read my articles</Link>
          <Link to="/games" className="btn-purple">Play a game</Link>
          {!user && <Link to="/register" className="btn-ghost">Join the world</Link>}
          {isAdmin && <Link to="/articles/new" className="btn-ghost">+ New post</Link>}
        </div>
      </motion.section>

      <div className="mb-12">
        <DailyAffirmation />
      </div>

      <section>
        <h2 className="section-title">
          Explore <span className="shimmer-text">everything</span>
        </h2>
        <p className="text-center text-ink-light mb-10">Pick a corner to wander into.</p>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {tiles.map((tile, index) => (
            <motion.div
              key={tile.to}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.06 }}
              whileHover={{ y: -6, scale: 1.03 }}
            >
              <Link
                to={tile.to}
                className={`block rounded-3xl p-6 h-44 bg-gradient-to-br ${tile.color} text-white shadow-soft relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition" />
                <div className="text-5xl mb-2">{tile.icon}</div>
                <div className="font-display text-2xl font-bold">{tile.title}</div>
                <div className="text-sm opacity-90">{tile.desc}</div>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      <motion.section
        initial={{ opacity: 0 }}
        whileInView={{ opacity: 1 }}
        viewport={{ once: true }}
        className="mt-16 card text-center"
      >
        <h3 className="font-display text-3xl mb-3 shimmer-text">A little about me</h3>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
          {[
            { label: 'Loves', value: '🎨 Art' },
            { label: 'Vibes', value: '🎵 K-Pop' },
            { label: 'Reads', value: '📖 Stories' },
            { label: 'Mood', value: '✨ Sparkle' },
          ].map((stat) => (
            <div key={stat.label} className="bg-pink-pale rounded-2xl p-4">
              <div className="text-xs uppercase tracking-wider text-pink font-bold">{stat.label}</div>
              <div className="text-lg font-semibold text-ink mt-1">{stat.value}</div>
            </div>
          ))}
        </div>
      </motion.section>
    </div>
  );
}

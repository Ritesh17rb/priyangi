import { motion } from 'framer-motion';

const QUOTES = [
  { text: 'You are made of stardust and softness.', emoji: '✨' },
  { text: 'Today is a great day to sparkle.', emoji: '💖' },
  { text: 'Your kindness is a superpower.', emoji: '🌸' },
  { text: 'You are capable of magical things.', emoji: '🦄' },
  { text: 'Small steps still count as progress.', emoji: '🌱' },
  { text: 'Be soft. Be wild. Be radiant.', emoji: '🌈' },
  { text: 'You bring light wherever you go.', emoji: '🌟' },
  { text: 'Your dreams matter — chase them gently.', emoji: '☁️' },
  { text: 'You\'re allowed to take up space.', emoji: '🌷' },
  { text: 'Today, romanticize the little things.', emoji: '🍓' },
  { text: 'Your laugh is somebody\'s favorite song.', emoji: '🎵' },
  { text: 'Keep going — you\'re doing amazing.', emoji: '💫' },
  { text: 'Your art is loved, even on hard days.', emoji: '🎨' },
  { text: 'You are exactly where you need to be.', emoji: '🌺' },
  { text: 'Trust your heart. It knows the way.', emoji: '💕' },
];

function todayQuote() {
  const start = new Date(2026, 0, 1).getTime();
  const days = Math.floor((Date.now() - start) / 86400000);
  return QUOTES[((days % QUOTES.length) + QUOTES.length) % QUOTES.length];
}

export default function DailyAffirmation() {
  const q = todayQuote();
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="card flex items-center gap-4 max-w-3xl mx-auto bg-gradient-to-r from-pink-pale via-white to-purple-light/30"
    >
      <div className="text-5xl animate-float-slow">{q.emoji}</div>
      <div>
        <div className="text-xs uppercase tracking-wider text-pink font-bold">Today's affirmation</div>
        <div className="font-display text-xl md:text-2xl text-ink">{q.text}</div>
      </div>
    </motion.div>
  );
}

import { motion } from 'framer-motion';

const letters = "Priyangi's Magical World".split('');

export default function Intro({ onSkip }) {
  return (
    <motion.div
      initial={{ opacity: 1 }}
      exit={{ opacity: 0, scale: 1.05, transition: { duration: 0.6 } }}
      className="fixed inset-0 z-[200] flex items-center justify-center overflow-hidden"
      style={{
        background:
          'radial-gradient(ellipse at center, #FFD6EC 0%, #E8B4FF 45%, #C77DFF 100%)',
      }}
    >
      {Array.from({ length: 60 }).map((_, i) => (
        <motion.span
          key={i}
          className="absolute rounded-full"
          style={{
            width: 4 + Math.random() * 10,
            height: 4 + Math.random() * 10,
            background: ['#fff', '#FFD700', '#FF6B9D', '#fff'][i % 4],
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
            boxShadow: '0 0 12px #fff',
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 1, 0],
            scale: [0, 1.5, 0],
            y: [-20, -120],
          }}
          transition={{ duration: 2 + Math.random() * 2, repeat: Infinity, delay: Math.random() * 2 }}
        />
      ))}

      <motion.div
        initial={{ scale: 0, rotate: -180 }}
        animate={{ scale: 1, rotate: 0 }}
        transition={{ type: 'spring', stiffness: 80, damping: 12 }}
        className="absolute"
      >
        <div className="w-72 h-72 rounded-full bg-gradient-to-br from-pink to-purple opacity-30 blur-3xl" />
      </motion.div>

      <div className="relative z-10 text-center px-6">
        <motion.div
          initial={{ y: -40, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="font-script text-4xl sm:text-5xl md:text-6xl text-white drop-shadow-lg mb-4"
        >
          Welcome to
        </motion.div>

        <h1 className="font-display text-4xl sm:text-5xl md:text-7xl font-bold flex flex-wrap justify-center gap-1">
          {letters.map((c, i) => (
            <motion.span
              key={i}
              initial={{ y: 60, opacity: 0, rotate: -10 }}
              animate={{ y: 0, opacity: 1, rotate: 0 }}
              transition={{ delay: 0.6 + i * 0.05, type: 'spring', stiffness: 200 }}
              className="inline-block text-white drop-shadow-[0_4px_20px_rgba(255,107,157,0.6)]"
            >
              {c === ' ' ? ' ' : c}
            </motion.span>
          ))}
        </h1>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 2.4 }}
          className="mt-8 text-white/90 font-medium tracking-widest text-sm"
        >
          ✦ Where dreams sparkle ✦
        </motion.div>

        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 3 }}
          onClick={onSkip}
          className="mt-10 px-8 py-3 rounded-full bg-white/90 hover:bg-white text-pink font-bold shadow-pinky hover:scale-105 transition"
        >
          Enter the world →
        </motion.button>
      </div>
    </motion.div>
  );
}

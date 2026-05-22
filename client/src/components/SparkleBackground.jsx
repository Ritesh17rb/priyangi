import { useEffect, useState } from 'react';

const COLORS = ['#FF6B9D', '#C77DFF', '#FFD700', '#06D6A0', '#FFB347', '#FFB3D1'];

export default function SparkleBackground({ count = 40 }) {
  const [sparkles, setSparkles] = useState([]);

  useEffect(() => {
    const arr = Array.from({ length: count }).map((_, i) => ({
      id: i,
      left: Math.random() * 100,
      size: 3 + Math.random() * 7,
      delay: Math.random() * 8,
      duration: 8 + Math.random() * 12,
      color: COLORS[Math.floor(Math.random() * COLORS.length)],
    }));
    setSparkles(arr);
  }, [count]);

  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {sparkles.map((s) => (
        <span
          key={s.id}
          className="sparkle"
          style={{
            left: `${s.left}%`,
            width: s.size,
            height: s.size,
            background: `radial-gradient(circle, ${s.color}, transparent 70%)`,
            bottom: '-20px',
            animation: `floatUp ${s.duration}s linear ${s.delay}s infinite`,
          }}
        />
      ))}
      <style>{`
        @keyframes floatUp {
          0% { transform: translateY(0) scale(0); opacity: 0; }
          15% { opacity: 0.85; }
          85% { opacity: 0.5; }
          100% { transform: translateY(-110vh) scale(1.4); opacity: 0; }
        }
      `}</style>
    </div>
  );
}

import { useState } from 'react';
import { motion } from 'framer-motion';
import TicTacToe from '../games/TicTacToe.jsx';
import Memory from '../games/Memory.jsx';
import WordScramble from '../games/WordScramble.jsx';
import Hangman from '../games/Hangman.jsx';
import Game2048 from '../games/Game2048.jsx';
import Snake from '../games/Snake.jsx';
import Doodle from '../games/Doodle.jsx';
import Connect4 from '../games/Connect4.jsx';
import RockPaperScissors from '../games/RockPaperScissors.jsx';
import SimonSays from '../games/SimonSays.jsx';
import ReactionTime from '../games/ReactionTime.jsx';
import TriviaQuiz from '../games/TriviaQuiz.jsx';
import Minesweeper from '../games/Minesweeper.jsx';
import MazeRunner from '../games/MazeRunner.jsx';
import CosmicBlaster from '../games/CosmicBlaster.jsx';

const GAMES = [
  { id: 'cosmic', name: 'Cosmic Blaster X', badge: 'NEW', family: 'Arcade', difficulty: 'Expert', desc: 'Neon shooter with charge pulse and live dodging', cmp: CosmicBlaster, featured: true },
  { id: 'maze', name: 'Neon Maze Escape', badge: 'NEW', family: 'Adventure', difficulty: 'Medium', desc: 'Generated mazes, star unlocks, and path racing', cmp: MazeRunner, featured: true },
  { id: 'mines', name: 'Minesweeper Deluxe', badge: 'NEW', family: 'Puzzle', difficulty: 'Expert', desc: 'Safe first click, flags, and rising board sizes', cmp: Minesweeper, featured: true },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', badge: 'XO', family: 'Classic', difficulty: 'Easy', desc: '2-player classic', cmp: TicTacToe },
  { id: 'connect4', name: 'Connect 4', badge: 'C4', family: 'Classic', difficulty: 'Easy', desc: '4 in a row wins', cmp: Connect4 },
  { id: 'memory', name: 'Memory Match', badge: 'MEM', family: 'Puzzle', difficulty: 'Easy', desc: 'Flip and match the pairs', cmp: Memory },
  { id: 'simon', name: 'Simon Says', badge: 'SEQ', family: 'Arcade', difficulty: 'Easy', desc: 'Repeat the pattern', cmp: SimonSays },
  { id: 'word', name: 'Word Scramble', badge: 'WRD', family: 'Word', difficulty: 'Easy', desc: 'Unscramble cute words', cmp: WordScramble },
  { id: 'hangman', name: 'Hangman', badge: 'HNG', family: 'Word', difficulty: 'Medium', desc: 'Guess before time runs out', cmp: Hangman },
  { id: 'trivia', name: 'K-Pop Trivia', badge: 'POP', family: 'Trivia', difficulty: 'Medium', desc: '10 idol questions', cmp: TriviaQuiz },
  { id: 'rps', name: 'Rock Paper Scissors', badge: 'RPS', family: 'Classic', difficulty: 'Easy', desc: 'Battle the bot', cmp: RockPaperScissors },
  { id: 'reaction', name: 'Reaction Time', badge: 'RT', family: 'Arcade', difficulty: 'Easy', desc: 'Measure your reflexes', cmp: ReactionTime },
  { id: '2048', name: '2048', badge: '2048', family: 'Puzzle', difficulty: 'Medium', desc: 'Slide and combine tiles', cmp: Game2048 },
  { id: 'snake', name: 'Snake', badge: 'SNK', family: 'Arcade', difficulty: 'Medium', desc: 'Eat and grow', cmp: Snake },
  { id: 'doodle', name: 'Doodle Pad', badge: 'ART', family: 'Creative', difficulty: 'Easy', desc: 'Free-draw and scribble', cmp: Doodle },
];

const FILTERS = ['all', 'Arcade', 'Puzzle', 'Word', 'Classic', 'Adventure', 'Trivia', 'Creative'];

export default function Games() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  const activeGame = GAMES.find((game) => game.id === active);
  const Active = activeGame?.cmp;
  const visibleGames = filter === 'all' ? GAMES : GAMES.filter((game) => game.family === filter);

  return (
    <div className="max-w-6xl mx-auto px-5 pt-10 pb-16">
      <div className="card mb-8 overflow-hidden">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px] lg:items-end">
          <div>
            <div className="flex flex-wrap gap-2">
              <span className="chip">15 games</span>
              <span className="chip">Arcade + puzzle lab</span>
              <span className="chip">3 new advanced drops</span>
            </div>
            <h1 className="section-title text-left !mb-3 !mt-4">
              Game <span className="shimmer-text">Zone</span>
            </h1>
            <p className="max-w-3xl text-ink-light">
              Fast classics, bigger puzzle runs, and a few heavier games that feel more like mini arcade cabinets than quick widgets.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-3 text-center text-sm">
            <div className="rounded-2xl bg-pink-pale px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-ink-light">Featured</div>
              <div className="font-display text-2xl text-pink">3</div>
            </div>
            <div className="rounded-2xl bg-pink-pale px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-ink-light">Families</div>
              <div className="font-display text-2xl text-pink">7</div>
            </div>
            <div className="rounded-2xl bg-pink-pale px-4 py-3">
              <div className="text-xs uppercase tracking-wider text-ink-light">Modes</div>
              <div className="font-display text-2xl text-pink">Solo + Duo</div>
            </div>
          </div>
        </div>
      </div>

      {!active && (
        <>
          <div className="mb-5 flex flex-wrap gap-2">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={filter === item ? 'btn-primary !py-2 !px-4' : 'btn-ghost !py-2 !px-4'}
              >
                {item === 'all' ? 'All games' : item}
              </button>
            ))}
          </div>

          <div className="grid gap-5 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
            {visibleGames.map((game, index) => (
              <motion.button
                key={game.id}
                onClick={() => setActive(game.id)}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -4, scale: 1.03 }}
                className="card flex min-h-52 flex-col justify-between text-left"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-pink to-purple text-lg font-black tracking-[0.25em] text-white">
                    {game.badge}
                  </div>
                  <div className="flex flex-wrap justify-end gap-2 text-[11px] font-bold uppercase tracking-wider">
                    {game.featured && <span className="rounded-full bg-pink px-2 py-1 text-white">Featured</span>}
                    <span className="rounded-full bg-purple/10 px-2 py-1 text-purple">{game.family}</span>
                  </div>
                </div>

                <div>
                  <div className="font-display text-2xl shimmer-text">{game.name}</div>
                  <div className="mt-1 text-sm text-ink-light">{game.desc}</div>
                </div>

                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-ink-light">
                  <span>{game.difficulty}</span>
                  <span>Open</span>
                </div>
              </motion.button>
            ))}
          </div>
        </>
      )}

      {active && Active && (
        <div>
          <button onClick={() => setActive(null)} className="btn-ghost mb-5">Back to all games</button>
          <div className="mb-5 flex flex-wrap items-center gap-2 text-sm">
            <span className="chip">{activeGame.family}</span>
            <span className="chip">{activeGame.difficulty}</span>
            {activeGame.featured && <span className="chip">Featured</span>}
          </div>
          <Active />
        </div>
      )}
    </div>
  );
}

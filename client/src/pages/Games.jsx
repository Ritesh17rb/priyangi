import { useMemo, useState } from 'react';
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
import WhackAMole from '../games/WhackAMole.jsx';
import BubblePop from '../games/BubblePop.jsx';
import QuickMath from '../games/QuickMath.jsx';
import ColorMatch from '../games/ColorMatch.jsx';
import SlidingPuzzle from '../games/SlidingPuzzle.jsx';
import NumberRush from '../games/NumberRush.jsx';

const GAMES = [
  { id: 'whack', name: 'Whack-a-Sparkle', emoji: '✨', tint: 'from-pink to-purple-light', family: 'Arcade', difficulty: 'Easy', desc: 'Tap the sparkle before it hops', cmp: WhackAMole, isNew: true },
  { id: 'bubble', name: 'Bubble Pop', emoji: '🫧', tint: 'from-purple-light to-pink', family: 'Arcade', difficulty: 'Easy', desc: 'Pop floating bubbles fast', cmp: BubblePop, isNew: true },
  { id: 'slide', name: 'Sliding Puzzle', emoji: '🧩', tint: 'from-pink to-purple', family: 'Puzzle', difficulty: 'Medium', desc: 'Slide tiles 1–8 into order', cmp: SlidingPuzzle, isNew: true },
  { id: 'numrush', name: 'Number Rush', emoji: '🔢', tint: 'from-pink-light to-purple-light', family: 'Arcade', difficulty: 'Easy', desc: 'Tap 1 to 16 against the clock', cmp: NumberRush, isNew: true },
  { id: 'math', name: 'Quick Math', emoji: '➗', tint: 'from-purple to-pink', family: 'Brain', difficulty: 'Medium', desc: 'Solve sums before time runs out', cmp: QuickMath, isNew: true },
  { id: 'color', name: 'Color Match', emoji: '🌈', tint: 'from-pink to-purple-light', family: 'Brain', difficulty: 'Medium', desc: 'Word vs ink — match or not?', cmp: ColorMatch, isNew: true },
  { id: 'cosmic', name: 'Cosmic Blaster X', emoji: '🚀', tint: 'from-purple to-pink', family: 'Arcade', difficulty: 'Expert', desc: 'Neon shooter with charge pulse', cmp: CosmicBlaster },
  { id: 'maze', name: 'Neon Maze Escape', emoji: '🌀', tint: 'from-pink-light to-purple', family: 'Adventure', difficulty: 'Medium', desc: 'Generated mazes and star runs', cmp: MazeRunner },
  { id: 'mines', name: 'Minesweeper Deluxe', emoji: '💣', tint: 'from-purple to-pink-light', family: 'Puzzle', difficulty: 'Expert', desc: 'Safe first click, flags, big boards', cmp: Minesweeper },
  { id: 'tictactoe', name: 'Tic-Tac-Toe', emoji: '⭕', tint: 'from-pink-light to-pink', family: 'Classic', difficulty: 'Easy', desc: '2-player classic', cmp: TicTacToe },
  { id: 'connect4', name: 'Connect 4', emoji: '🔴', tint: 'from-purple-light to-purple', family: 'Classic', difficulty: 'Easy', desc: 'Four in a row wins', cmp: Connect4 },
  { id: 'memory', name: 'Memory Match', emoji: '🃏', tint: 'from-pink to-purple', family: 'Puzzle', difficulty: 'Easy', desc: 'Flip and match the pairs', cmp: Memory },
  { id: 'simon', name: 'Simon Says', emoji: '🎵', tint: 'from-purple to-pink-light', family: 'Arcade', difficulty: 'Easy', desc: 'Repeat the glowing pattern', cmp: SimonSays },
  { id: 'word', name: 'Word Scramble', emoji: '🔤', tint: 'from-pink-light to-purple', family: 'Word', difficulty: 'Easy', desc: 'Unscramble cute words', cmp: WordScramble },
  { id: 'hangman', name: 'Hangman', emoji: '🎈', tint: 'from-pink to-purple-light', family: 'Word', difficulty: 'Medium', desc: 'Guess the word in time', cmp: Hangman },
  { id: 'trivia', name: 'K-Pop Trivia', emoji: '💜', tint: 'from-purple to-pink', family: 'Trivia', difficulty: 'Medium', desc: '10 idol questions', cmp: TriviaQuiz },
  { id: 'rps', name: 'Rock Paper Scissors', emoji: '✊', tint: 'from-pink to-pink-light', family: 'Classic', difficulty: 'Easy', desc: 'Battle the bot', cmp: RockPaperScissors },
  { id: 'reaction', name: 'Reaction Time', emoji: '⚡', tint: 'from-purple-light to-pink', family: 'Arcade', difficulty: 'Easy', desc: 'Measure your reflexes', cmp: ReactionTime },
  { id: '2048', name: '2048', emoji: '🔟', tint: 'from-pink to-purple', family: 'Puzzle', difficulty: 'Medium', desc: 'Slide and combine tiles', cmp: Game2048 },
  { id: 'snake', name: 'Snake', emoji: '🐍', tint: 'from-purple to-pink-light', family: 'Arcade', difficulty: 'Medium', desc: 'Eat, grow, don\'t crash', cmp: Snake },
  { id: 'doodle', name: 'Doodle Pad', emoji: '🎨', tint: 'from-pink-light to-purple-light', family: 'Creative', difficulty: 'Easy', desc: 'Free-draw and scribble', cmp: Doodle },
];

const FILTERS = ['all', 'Arcade', 'Puzzle', 'Brain', 'Word', 'Classic', 'Adventure', 'Trivia', 'Creative'];

export default function Games() {
  const [active, setActive] = useState(null);
  const [filter, setFilter] = useState('all');
  const [query, setQuery] = useState('');
  const activeGame = GAMES.find((game) => game.id === active);
  const Active = activeGame?.cmp;

  const visibleGames = useMemo(() => {
    const q = query.trim().toLowerCase();
    return GAMES.filter((game) => {
      if (filter !== 'all' && game.family !== filter) return false;
      if (q && !`${game.name} ${game.desc} ${game.family}`.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [filter, query]);

  function openGame(id) {
    setActive(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function surprise() {
    openGame(GAMES[Math.floor(Math.random() * GAMES.length)].id);
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-5 pt-8 sm:pt-10 pb-16">
      <div className="card mb-6">
        <div className="flex flex-wrap gap-2">
          <span className="chip">{GAMES.length} games</span>
          <span className="chip">Mobile-first arcade</span>
          <span className="chip">6 fresh drops</span>
        </div>
        <h1 className="section-title text-left !mb-2 !mt-3">
          Game <span className="shimmer-text">Zone</span>
        </h1>
        <p className="text-ink-light">Tap-friendly classics, brain teasers and arcade runs — all built for your phone.</p>
        {!active && (
          <div className="mt-4 flex flex-col gap-2 sm:flex-row">
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search games…"
              className="input !py-2 flex-1"
            />
            <button onClick={surprise} className="btn-purple whitespace-nowrap">🎲 Surprise me</button>
          </div>
        )}
      </div>

      {!active && (
        <>
          <div className="mb-5 -mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
            {FILTERS.map((item) => (
              <button
                key={item}
                onClick={() => setFilter(item)}
                className={`whitespace-nowrap !py-1.5 !px-3 text-sm ${filter === item ? 'btn-primary' : 'btn-ghost'}`}
              >
                {item === 'all' ? 'All' : item}
              </button>
            ))}
          </div>

          {visibleGames.length === 0 ? (
            <div className="card py-12 text-center text-ink-light">No games match your search.</div>
          ) : (
            <div className="grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 lg:grid-cols-4">
              {visibleGames.map((game, index) => (
                <motion.button
                  key={game.id}
                  onClick={() => openGame(game.id)}
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: Math.min(index * 0.03, 0.4) }}
                  whileTap={{ scale: 0.97 }}
                  className="card !p-0 flex flex-col overflow-hidden text-left"
                >
                  <div className={`relative flex h-24 items-center justify-center bg-gradient-to-br sm:h-28 ${game.tint}`}>
                    <span className="text-5xl drop-shadow-[0_3px_8px_rgba(0,0,0,0.22)] sm:text-6xl">{game.emoji}</span>
                    {game.isNew && (
                      <span className="absolute left-1.5 top-1.5 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-black uppercase tracking-wide text-pink">
                        New
                      </span>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-3">
                    <div className="font-display text-base leading-tight text-ink sm:text-lg">{game.name}</div>
                    <div className="mt-0.5 flex-1 text-xs text-ink-light">{game.desc}</div>
                    <div className="mt-2 flex items-center justify-between text-[11px] font-bold uppercase tracking-wide text-ink-light">
                      <span>{game.family}</span>
                      <span className="text-pink">Play →</span>
                    </div>
                  </div>
                </motion.button>
              ))}
            </div>
          )}
        </>
      )}

      {active && Active && (
        <div>
          <button onClick={() => setActive(null)} className="btn-ghost mb-4">← All games</button>
          <div className="mb-4 flex flex-wrap items-center gap-2 text-sm">
            <span className="chip">{activeGame.family}</span>
            <span className="chip">{activeGame.difficulty}</span>
            {activeGame.isNew && <span className="chip">New</span>}
          </div>
          <Active />
        </div>
      )}
    </div>
  );
}

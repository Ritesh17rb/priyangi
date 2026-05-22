import { useEffect, useState } from 'react';

const LEVELS = {
  drift: { label: 'Drift', size: 15, stars: 3 },
  rush: { label: 'Rush', size: 21, stars: 4 },
  shadow: { label: 'Shadow', size: 27, stars: 5 },
};

const DIRECTIONS = [
  [0, -2],
  [2, 0],
  [0, 2],
  [-2, 0],
];

function shuffle(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[randomIndex]] = [copy[randomIndex], copy[i]];
  }
  return copy;
}

function createMaze(size) {
  const grid = Array.from({ length: size }, () => Array(size).fill(0));

  function carve(x, y) {
    grid[y][x] = 1;
    shuffle(DIRECTIONS).forEach(([dx, dy]) => {
      const nextX = x + dx;
      const nextY = y + dy;
      if (nextX <= 0 || nextY <= 0 || nextX >= size - 1 || nextY >= size - 1) return;
      if (grid[nextY][nextX] === 1) return;
      grid[y + dy / 2][x + dx / 2] = 1;
      carve(nextX, nextY);
    });
  }

  carve(1, 1);
  grid[size - 2][size - 2] = 1;
  return grid;
}

function keyFor(x, y) {
  return `${x}:${y}`;
}

function pickStars(grid, count) {
  const cells = [];
  for (let y = 1; y < grid.length - 1; y += 1) {
    for (let x = 1; x < grid.length - 1; x += 1) {
      if (grid[y][x] === 1 && !(x === 1 && y === 1) && !(x === grid.length - 2 && y === grid.length - 2)) {
        cells.push({ x, y });
      }
    }
  }

  return shuffle(cells).slice(0, count).map((cell, index) => ({ ...cell, id: `star-${index}` }));
}

function shortestPathLength(grid) {
  const exit = { x: grid.length - 2, y: grid.length - 2 };
  const queue = [{ x: 1, y: 1, distance: 0 }];
  const seen = new Set([keyFor(1, 1)]);

  while (queue.length) {
    const current = queue.shift();
    if (current.x === exit.x && current.y === exit.y) return current.distance;

    [
      [1, 0],
      [-1, 0],
      [0, 1],
      [0, -1],
    ].forEach(([dx, dy]) => {
      const nextX = current.x + dx;
      const nextY = current.y + dy;
      const nextKey = keyFor(nextX, nextY);
      if (grid[nextY]?.[nextX] !== 1 || seen.has(nextKey)) return;
      seen.add(nextKey);
      queue.push({ x: nextX, y: nextY, distance: current.distance + 1 });
    });
  }

  return 0;
}

function buildRun(level) {
  const config = LEVELS[level];
  const maze = createMaze(config.size);
  return {
    maze,
    stars: pickStars(maze, config.stars),
    pathLength: shortestPathLength(maze),
  };
}

export default function MazeRunner() {
  const [level, setLevel] = useState('rush');
  const [run, setRun] = useState(() => buildRun('rush'));
  const [player, setPlayer] = useState({ x: 1, y: 1 });
  const [visited, setVisited] = useState({ [keyFor(1, 1)]: true });
  const [moves, setMoves] = useState(0);
  const [seconds, setSeconds] = useState(0);
  const [status, setStatus] = useState('idle');
  const [collected, setCollected] = useState([]);

  const exit = { x: run.maze.length - 2, y: run.maze.length - 2 };
  const collectedSet = new Set(collected);

  useEffect(() => {
    if (status !== 'running') return undefined;
    const timer = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  function reset(nextLevel = level) {
    setLevel(nextLevel);
    setRun(buildRun(nextLevel));
    setPlayer({ x: 1, y: 1 });
    setVisited({ [keyFor(1, 1)]: true });
    setMoves(0);
    setSeconds(0);
    setStatus('idle');
    setCollected([]);
  }

  function move(dx, dy) {
    if (status === 'won') return;

    const nextX = player.x + dx;
    const nextY = player.y + dy;
    if (run.maze[nextY]?.[nextX] !== 1) return;

    const nextKey = keyFor(nextX, nextY);
    setPlayer({ x: nextX, y: nextY });
    setVisited((current) => ({ ...current, [nextKey]: true }));
    setMoves((current) => current + 1);
    setStatus((current) => (current === 'idle' ? 'running' : current));

    const star = run.stars.find((item) => item.x === nextX && item.y === nextY);
    if (star && !collectedSet.has(star.id)) {
      setCollected((current) => [...current, star.id]);
    }

    const allStarsCollected = collectedSet.size + (star && !collectedSet.has(star.id) ? 1 : 0) === run.stars.length;
    if (nextX === exit.x && nextY === exit.y && allStarsCollected) {
      setStatus('won');
    }
  }

  useEffect(() => {
    function onKeyDown(event) {
      const map = {
        ArrowUp: [0, -1],
        ArrowDown: [0, 1],
        ArrowLeft: [-1, 0],
        ArrowRight: [1, 0],
        w: [0, -1],
        s: [0, 1],
        a: [-1, 0],
        d: [1, 0],
      };

      const direction = map[event.key];
      if (!direction) return;
      event.preventDefault();
      move(direction[0], direction[1]);
    }

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [move]);

  return (
    <div className="card mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">New</span>
            <span className="chip">Adventure</span>
            <span className="chip">Generated maze</span>
          </div>
          <h2 className="mt-3 font-display text-4xl shimmer-text">Neon Maze Escape</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            Every run builds a fresh maze. Collect every star, unlock the exit, and beat the shortest-path benchmark.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center text-sm sm:grid-cols-4">
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Stars</div>
            <div className="font-display text-2xl text-pink">{collected.length}/{run.stars.length}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Moves</div>
            <div className="font-display text-2xl text-pink">{moves}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Timer</div>
            <div className="font-display text-2xl text-pink">{seconds}s</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Best path</div>
            <div className="font-display text-2xl text-pink">{run.pathLength}</div>
          </div>
        </div>
      </div>

      <div className="mt-5 flex flex-wrap items-center gap-2">
        {Object.entries(LEVELS).map(([id, item]) => (
          <button
            key={id}
            onClick={() => reset(id)}
            className={id === level ? 'btn-primary !py-2 !px-4' : 'btn-ghost !py-2 !px-4'}
          >
            {item.label}
          </button>
        ))}
        <button onClick={() => reset(level)} className="btn-ghost !py-2 !px-4">Regenerate</button>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div className="overflow-auto rounded-3xl border border-pink-light/60 bg-[#fff9fd] p-3">
          <div
            className="mx-auto grid gap-[2px]"
            style={{
              gridTemplateColumns: `repeat(${run.maze.length}, minmax(0, 1fr))`,
              width: `min(100%, ${Math.min(run.maze.length * 20, 540)}px)`,
            }}
          >
            {run.maze.flatMap((row, y) =>
              row.map((cell, x) => {
                const currentKey = keyFor(x, y);
                const star = run.stars.find((item) => item.x === x && item.y === y);
                const hasStar = star && !collectedSet.has(star.id);
                const isExit = x === exit.x && y === exit.y;
                const isPlayer = x === player.x && y === player.y;
                const isVisited = visited[currentKey];

                let background = '#241335';
                if (cell === 1) background = isVisited ? '#ffe6f2' : '#f8f0fb';
                if (isExit) background = collected.length === run.stars.length ? '#c77dff' : '#f8d7ea';
                if (hasStar) background = '#ffd766';
                if (isPlayer) background = '#ff6b9d';

                return (
                  <div
                    key={currentKey}
                    className="aspect-square rounded-[4px] transition"
                    style={{ background }}
                    title={isExit ? 'Exit portal' : hasStar ? 'Star shard' : ''}
                  />
                );
              })
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-pink-light/60 bg-white/80 p-4">
            <div className="font-display text-2xl">How to clear it</div>
            <div className="mt-3 space-y-2 text-sm text-ink-light">
              <div>Use arrow keys or WASD to move.</div>
              <div>Collect every gold star before touching the portal.</div>
              <div>Dark corridors are unexplored. Light tiles mark your route.</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span />
            <button onClick={() => move(0, -1)} className="btn-ghost !px-3 !py-2">Up</button>
            <span />
            <button onClick={() => move(-1, 0)} className="btn-ghost !px-3 !py-2">Left</button>
            <button onClick={() => move(0, 1)} className="btn-ghost !px-3 !py-2">Down</button>
            <button onClick={() => move(1, 0)} className="btn-ghost !px-3 !py-2">Right</button>
          </div>

          <div className="rounded-3xl border border-pink-light/60 bg-white/80 p-4 text-sm text-ink-light">
            {status === 'idle' && 'The maze is fresh. Start moving to begin the timer.'}
            {status === 'running' && collected.length < run.stars.length && 'The exit is sealed until every star is collected.'}
            {status === 'running' && collected.length === run.stars.length && 'Portal unlocked. Head for the purple exit.'}
            {status === 'won' && 'Escape complete. Regenerate for a brand-new maze.'}
          </div>
        </div>
      </div>
    </div>
  );
}

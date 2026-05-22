import { useEffect, useState } from 'react';

const LEVELS = {
  rookie: { label: 'Rookie', rows: 9, cols: 9, mines: 10 },
  pro: { label: 'Pro', rows: 12, cols: 12, mines: 22 },
  elite: { label: 'Elite', rows: 16, cols: 16, mines: 40 },
};

const NEIGHBORS = [-1, 0, 1];

function keyFor(row, col) {
  return `${row}:${col}`;
}

function makeEmptyBoard(rows, cols) {
  return Array.from({ length: rows }, (_, row) =>
    Array.from({ length: cols }, (_, col) => ({
      row,
      col,
      mine: false,
      revealed: false,
      flagged: false,
      adjacent: 0,
    }))
  );
}

function neighborsOf(rows, cols, row, col) {
  const cells = [];
  for (const dy of NEIGHBORS) {
    for (const dx of NEIGHBORS) {
      if (dx === 0 && dy === 0) continue;
      const nextRow = row + dy;
      const nextCol = col + dx;
      if (nextRow < 0 || nextRow >= rows || nextCol < 0 || nextCol >= cols) continue;
      cells.push([nextRow, nextCol]);
    }
  }
  return cells;
}

function plantMines(rows, cols, mines, safeRow, safeCol) {
  const board = makeEmptyBoard(rows, cols);
  const blocked = new Set([keyFor(safeRow, safeCol)]);
  neighborsOf(rows, cols, safeRow, safeCol).forEach(([row, col]) => blocked.add(keyFor(row, col)));

  const slots = [];
  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (!blocked.has(keyFor(row, col))) slots.push([row, col]);
    }
  }

  for (let i = slots.length - 1; i > 0; i -= 1) {
    const randomIndex = Math.floor(Math.random() * (i + 1));
    [slots[i], slots[randomIndex]] = [slots[randomIndex], slots[i]];
  }

  slots.slice(0, mines).forEach(([row, col]) => {
    board[row][col].mine = true;
  });

  for (let row = 0; row < rows; row += 1) {
    for (let col = 0; col < cols; col += 1) {
      if (board[row][col].mine) continue;
      board[row][col].adjacent = neighborsOf(rows, cols, row, col).filter(
        ([nextRow, nextCol]) => board[nextRow][nextCol].mine
      ).length;
    }
  }

  return board;
}

function revealZeros(board, row, col) {
  const nextBoard = board.map((boardRow) => boardRow.map((cell) => ({ ...cell })));
  const queue = [[row, col]];
  const seen = new Set();

  while (queue.length) {
    const [currentRow, currentCol] = queue.shift();
    const currentKey = keyFor(currentRow, currentCol);
    if (seen.has(currentKey)) continue;
    seen.add(currentKey);

    const cell = nextBoard[currentRow][currentCol];
    if (cell.flagged || cell.revealed) continue;
    cell.revealed = true;

    if (cell.adjacent !== 0 || cell.mine) continue;
    neighborsOf(nextBoard.length, nextBoard[0].length, currentRow, currentCol).forEach((neighbor) => {
      queue.push(neighbor);
    });
  }

  return nextBoard;
}

function revealMines(board, explodedRow, explodedCol) {
  return board.map((boardRow) =>
    boardRow.map((cell) => ({
      ...cell,
      revealed: cell.mine || cell.revealed || (cell.row === explodedRow && cell.col === explodedCol),
    }))
  );
}

function countRevealed(board) {
  return board.flat().filter((cell) => cell.revealed).length;
}

function numberClass(value) {
  const map = {
    1: 'text-sky-600',
    2: 'text-emerald-600',
    3: 'text-rose-600',
    4: 'text-indigo-600',
    5: 'text-orange-600',
    6: 'text-cyan-700',
    7: 'text-slate-700',
    8: 'text-fuchsia-700',
  };
  return map[value] || 'text-ink';
}

export default function Minesweeper() {
  const [level, setLevel] = useState('pro');
  const [board, setBoard] = useState(() => makeEmptyBoard(LEVELS.pro.rows, LEVELS.pro.cols));
  const [status, setStatus] = useState('idle');
  const [seconds, setSeconds] = useState(0);
  const [tool, setTool] = useState('reveal');

  const config = LEVELS[level];
  const flagsUsed = board.flat().filter((cell) => cell.flagged).length;
  const cleared = countRevealed(board);
  const target = config.rows * config.cols - config.mines;

  useEffect(() => {
    if (status !== 'playing') return undefined;
    const timer = setInterval(() => setSeconds((current) => current + 1), 1000);
    return () => clearInterval(timer);
  }, [status]);

  function reset(nextLevel = level) {
    const nextConfig = LEVELS[nextLevel];
    setLevel(nextLevel);
    setBoard(makeEmptyBoard(nextConfig.rows, nextConfig.cols));
    setStatus('idle');
    setSeconds(0);
    setTool('reveal');
  }

  function toggleFlag(row, col) {
    if (status === 'won' || status === 'lost') return;

    setBoard((current) =>
      current.map((boardRow) =>
        boardRow.map((cell) => {
          if (cell.row !== row || cell.col !== col || cell.revealed) return cell;
          if (!cell.flagged && flagsUsed >= config.mines) return cell;
          return { ...cell, flagged: !cell.flagged };
        })
      )
    );
  }

  function reveal(row, col) {
    if (status === 'won' || status === 'lost') return;

    const currentCell = board[row][col];
    if (currentCell.flagged || currentCell.revealed) return;

    let nextBoard = board;
    if (status === 'idle') {
      nextBoard = plantMines(config.rows, config.cols, config.mines, row, col);
      setStatus('playing');
    }

    const nextCell = nextBoard[row][col];
    if (nextCell.mine) {
      setBoard(revealMines(nextBoard, row, col));
      setStatus('lost');
      return;
    }

    const revealedBoard = revealZeros(nextBoard, row, col);
    setBoard(revealedBoard);

    if (countRevealed(revealedBoard) >= target) {
      setStatus('won');
    }
  }

  function onCellAction(row, col) {
    if (tool === 'flag') {
      toggleFlag(row, col);
      return;
    }
    reveal(row, col);
  }

  return (
    <div className="card mx-auto max-w-5xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">New</span>
            <span className="chip">Puzzle</span>
            <span className="chip">Safe first click</span>
          </div>
          <h2 className="mt-3 font-display text-4xl shimmer-text">Minesweeper Deluxe</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            First click is always safe. Use reveal mode on mobile, or right-click to plant flags on desktop.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-3 text-center text-sm">
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Mines</div>
            <div className="font-display text-2xl text-pink">{config.mines - flagsUsed}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Cleared</div>
            <div className="font-display text-2xl text-pink">{cleared}/{target}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Timer</div>
            <div className="font-display text-2xl text-pink">{seconds}s</div>
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
        <button
          onClick={() => setTool('reveal')}
          className={tool === 'reveal' ? 'btn-purple !py-2 !px-4' : 'btn-ghost !py-2 !px-4'}
        >
          Reveal
        </button>
        <button
          onClick={() => setTool('flag')}
          className={tool === 'flag' ? 'btn-purple !py-2 !px-4' : 'btn-ghost !py-2 !px-4'}
        >
          Flag
        </button>
        <button onClick={() => reset(level)} className="btn-ghost !py-2 !px-4">Reset</button>
      </div>

      <div className="mt-4 overflow-auto rounded-3xl border border-pink-light/60 bg-white/70 p-3">
        <div
          className="mx-auto grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${config.cols}, minmax(0, 1fr))`,
            width: `min(92vw, ${Math.min(config.cols * 34, 560)}px)`,
          }}
        >
          {board.flat().map((cell) => (
            <button
              key={keyFor(cell.row, cell.col)}
              onClick={() => onCellAction(cell.row, cell.col)}
              onContextMenu={(event) => {
                event.preventDefault();
                toggleFlag(cell.row, cell.col);
              }}
              className={[
                'aspect-square rounded-xl border text-sm font-bold transition',
                cell.revealed
                  ? 'border-white/70 bg-white text-ink shadow-inner'
                  : 'border-pink-light/70 bg-gradient-to-br from-pink-pale to-white hover:-translate-y-0.5 hover:shadow-soft',
              ].join(' ')}
            >
              {cell.revealed && cell.mine && 'X'}
              {cell.revealed && !cell.mine && cell.adjacent > 0 && (
                <span className={numberClass(cell.adjacent)}>{cell.adjacent}</span>
              )}
              {!cell.revealed && cell.flagged && 'F'}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="text-sm text-ink-light">
          {status === 'idle' && 'Pick any cell to start. The opening area is protected.'}
          {status === 'playing' && 'Clear every safe tile and use flags only where you are confident.'}
          {status === 'won' && 'Board cleared. You beat the minefield.'}
          {status === 'lost' && 'A mine exploded. Reset and try a cleaner run.'}
        </div>
        <div className="flex gap-2">
          <button onClick={() => reset(level)} className="btn-primary">
            {status === 'idle' ? 'Start fresh' : 'Play again'}
          </button>
        </div>
      </div>
    </div>
  );
}

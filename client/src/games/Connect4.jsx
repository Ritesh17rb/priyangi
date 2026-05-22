import { useState } from 'react';

const ROWS = 6, COLS = 7;
const empty = () => Array.from({ length: ROWS }, () => Array(COLS).fill(0));

function checkWin(b, r, c, p) {
  const dirs = [[0,1],[1,0],[1,1],[1,-1]];
  for (const [dr, dc] of dirs) {
    let count = 1;
    for (const sign of [1, -1]) {
      let i = 1;
      while (true) {
        const nr = r + dr * i * sign, nc = c + dc * i * sign;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) break;
        if (b[nr][nc] !== p) break;
        count++; i++;
      }
    }
    if (count >= 4) return true;
  }
  return false;
}

export default function Connect4() {
  const [board, setBoard] = useState(empty);
  const [turn, setTurn] = useState(1);
  const [winner, setWinner] = useState(0);
  const [draw, setDraw] = useState(false);

  function drop(c) {
    if (winner || draw) return;
    let r = -1;
    for (let i = ROWS - 1; i >= 0; i--) if (!board[i][c]) { r = i; break; }
    if (r === -1) return;
    const nb = board.map((row) => [...row]);
    nb[r][c] = turn;
    setBoard(nb);
    if (checkWin(nb, r, c, turn)) setWinner(turn);
    else if (nb.flat().every(Boolean)) setDraw(true);
    else setTurn(turn === 1 ? 2 : 1);
  }

  function reset() { setBoard(empty()); setTurn(1); setWinner(0); setDraw(false); }

  const status = winner ? `Player ${winner === 1 ? '💖 Pink' : '💜 Purple'} wins!` : draw ? '🤝 Draw!' : `Turn: Player ${turn === 1 ? '💖 Pink' : '💜 Purple'}`;

  return (
    <div className="card max-w-md mx-auto text-center">
      <h2 className="font-display text-3xl mb-1">Connect 4</h2>
      <div className="text-ink-light mb-3">{status}</div>
      <div className="grid grid-cols-7 gap-1 bg-gradient-to-br from-pink-light to-purple-light p-2 rounded-2xl">
        {Array.from({ length: COLS }).map((_, c) => (
          <div key={c} className="flex flex-col gap-1">
            {board.map((row, r) => (
              <button
                key={r}
                onClick={() => drop(c)}
                className={`aspect-square rounded-full transition ${
                  row[c] === 1 ? 'bg-pink shadow-pinky' : row[c] === 2 ? 'bg-purple shadow-soft' : 'bg-white/80 hover:bg-white'
                }`}
              />
            ))}
          </div>
        ))}
      </div>
      <button onClick={reset} className="btn-primary mt-4">New game</button>
    </div>
  );
}

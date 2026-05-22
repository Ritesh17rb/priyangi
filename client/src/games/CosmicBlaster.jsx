import { useEffect, useRef, useState } from 'react';

const WIDTH = 360;
const HEIGHT = 560;
const PLAYER_SPEED = 0.35;
const BULLET_SPEED = 0.7;

function randomBetween(min, max) {
  return Math.random() * (max - min) + min;
}

function makeStars() {
  return Array.from({ length: 30 }, (_, index) => ({
    id: `star-${index}`,
    x: randomBetween(0, WIDTH),
    y: randomBetween(0, HEIGHT),
    speed: randomBetween(0.04, 0.18),
    size: randomBetween(1, 3),
  }));
}

function createEnemy(level) {
  const width = randomBetween(26, 44);
  return {
    id: `enemy-${Math.random().toString(36).slice(2)}`,
    x: randomBetween(10, WIDTH - width - 10),
    y: -50,
    w: width,
    h: width,
    speed: randomBetween(0.08, 0.16) + level * 0.01,
    drift: randomBetween(-0.08, 0.08),
    hp: level >= 4 && Math.random() < 0.2 ? 2 : 1,
  };
}

function baseGame() {
  return {
    running: false,
    over: false,
    score: 0,
    lives: 3,
    level: 1,
    charge: 0,
    player: {
      x: WIDTH / 2 - 18,
      y: HEIGHT - 58,
      w: 36,
      h: 36,
      cooldown: 0,
      invulnerable: 0,
    },
    bullets: [],
    enemies: [],
    stars: makeStars(),
    spawnTimer: 900,
    pulseFlash: 0,
  };
}

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

function overlaps(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function snapshot(game) {
  return {
    running: game.running,
    over: game.over,
    score: game.score,
    lives: game.lives,
    level: game.level,
    charge: game.charge,
    player: { ...game.player },
    bullets: game.bullets.map((item) => ({ ...item })),
    enemies: game.enemies.map((item) => ({ ...item })),
    stars: game.stars.map((item) => ({ ...item })),
    pulseFlash: game.pulseFlash,
  };
}

function holdControl(target, value, active) {
  return {
    onMouseDown: () => {
      target.current[value] = active;
    },
    onMouseUp: () => {
      target.current[value] = false;
    },
    onMouseLeave: () => {
      target.current[value] = false;
    },
    onTouchStart: () => {
      target.current[value] = active;
    },
    onTouchEnd: () => {
      target.current[value] = false;
    },
  };
}

export default function CosmicBlaster() {
  const gameRef = useRef(baseGame());
  const keysRef = useRef({});
  const rafRef = useRef(0);
  const lastFrameRef = useRef(0);
  const [view, setView] = useState(() => snapshot(gameRef.current));

  useEffect(() => {
    function onKeyDown(event) {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'a', 'd', 'w', 's', 'e'].includes(event.key)) {
        event.preventDefault();
      }
      keysRef.current[event.key] = true;
    }

    function onKeyUp(event) {
      keysRef.current[event.key] = false;
    }

    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);

    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
      cancelAnimationFrame(rafRef.current);
    };
  }, []);

  function reset() {
    const next = baseGame();
    gameRef.current = next;
    setView(snapshot(next));
    keysRef.current = {};
    cancelAnimationFrame(rafRef.current);
    lastFrameRef.current = 0;
  }

  function fireBullet(game) {
    if (game.player.cooldown > 0) return;
    game.bullets.push({
      id: `bullet-${Math.random().toString(36).slice(2)}`,
      x: game.player.x + game.player.w / 2 - 3,
      y: game.player.y - 10,
      w: 6,
      h: 16,
    });
    game.player.cooldown = game.charge >= 100 ? 90 : 150;
  }

  function releasePulse() {
    const game = gameRef.current;
    if (game.charge < 100 || game.over) return;
    game.score += game.enemies.length * 2;
    game.enemies = [];
    game.charge = 0;
    game.pulseFlash = 220;
    setView(snapshot(game));
  }

  function tick(timestamp) {
    const game = gameRef.current;
    if (!game.running) return;

    if (!lastFrameRef.current) {
      lastFrameRef.current = timestamp;
    }

    const delta = Math.min(32, timestamp - lastFrameRef.current);
    lastFrameRef.current = timestamp;
    const keys = keysRef.current;

    const moveX = (keys.ArrowLeft || keys.a ? -1 : 0) + (keys.ArrowRight || keys.d ? 1 : 0);
    const moveY = (keys.ArrowUp || keys.w ? -1 : 0) + (keys.ArrowDown || keys.s ? 1 : 0);

    game.player.x = clamp(game.player.x + moveX * PLAYER_SPEED * delta, 8, WIDTH - game.player.w - 8);
    game.player.y = clamp(game.player.y + moveY * PLAYER_SPEED * delta, HEIGHT / 2, HEIGHT - game.player.h - 8);
    game.player.cooldown = Math.max(0, game.player.cooldown - delta);
    game.player.invulnerable = Math.max(0, game.player.invulnerable - delta);
    game.pulseFlash = Math.max(0, game.pulseFlash - delta);

    if (keys[' ']) fireBullet(game);
    if (keys.e) releasePulse();

    game.spawnTimer -= delta;
    if (game.spawnTimer <= 0) {
      game.enemies.push(createEnemy(game.level));
      game.spawnTimer = Math.max(240, 900 - game.level * 70);
    }

    game.level = 1 + Math.floor(game.score / 12);

    game.stars.forEach((star) => {
      star.y += star.speed * delta;
      if (star.y > HEIGHT) {
        star.y = -5;
        star.x = randomBetween(0, WIDTH);
      }
    });

    game.bullets.forEach((bullet) => {
      bullet.y -= BULLET_SPEED * delta;
    });
    game.bullets = game.bullets.filter((bullet) => bullet.y + bullet.h > -20);

    game.enemies.forEach((enemy) => {
      enemy.y += enemy.speed * delta;
      enemy.x = clamp(enemy.x + enemy.drift * delta, 6, WIDTH - enemy.w - 6);
    });

    const nextBullets = [];
    game.bullets.forEach((bullet) => {
      let hit = false;
      game.enemies = game.enemies
        .map((enemy) => {
          if (hit || !overlaps(bullet, enemy)) return enemy;
          hit = true;
          return { ...enemy, hp: enemy.hp - 1 };
        })
        .filter((enemy) => {
          if (enemy.hp > 0) return true;
          game.score += 1;
          game.charge = clamp(game.charge + 12, 0, 100);
          return false;
        });

      if (!hit) nextBullets.push(bullet);
    });
    game.bullets = nextBullets;

    game.enemies = game.enemies.filter((enemy) => {
      if (enemy.y > HEIGHT + 20) {
        game.lives -= 1;
        game.charge = clamp(game.charge - 15, 0, 100);
        return false;
      }

      if (game.player.invulnerable <= 0 && overlaps(enemy, game.player)) {
        game.lives -= 1;
        game.player.invulnerable = 1200;
        game.charge = clamp(game.charge - 20, 0, 100);
        return false;
      }

      return true;
    });

    if (game.lives <= 0) {
      game.running = false;
      game.over = true;
    }

    setView(snapshot(game));

    if (game.running) {
      rafRef.current = requestAnimationFrame(tick);
    }
  }

  function start() {
    const game = gameRef.current;
    if (game.running) return;
    game.running = true;
    game.over = false;
    lastFrameRef.current = 0;
    setView(snapshot(game));
    rafRef.current = requestAnimationFrame(tick);
  }

  return (
    <div className="card mx-auto max-w-6xl">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap gap-2">
            <span className="chip">New</span>
            <span className="chip">Arcade</span>
            <span className="chip">Keyboard action</span>
          </div>
          <h2 className="mt-3 font-display text-4xl shimmer-text">Cosmic Blaster X</h2>
          <p className="mt-2 max-w-2xl text-sm text-ink-light">
            Dodge, fire, and charge a full-screen pulse. Arrow keys or WASD move, Space fires, and E detonates the pulse when the meter is full.
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 text-center text-sm sm:grid-cols-4">
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Score</div>
            <div className="font-display text-2xl text-pink">{view.score}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Lives</div>
            <div className="font-display text-2xl text-pink">{view.lives}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Level</div>
            <div className="font-display text-2xl text-pink">{view.level}</div>
          </div>
          <div className="rounded-2xl bg-pink-pale px-4 py-3">
            <div className="text-xs uppercase tracking-wider text-ink-light">Pulse</div>
            <div className="font-display text-2xl text-pink">{view.charge}%</div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_280px]">
        <div>
          <div
            className="relative mx-auto overflow-hidden rounded-[32px] border border-pink-light/70 shadow-soft"
            style={{
              width: 'min(92vw, 420px)',
              aspectRatio: `${WIDTH} / ${HEIGHT}`,
              background:
                'radial-gradient(circle at top, rgba(199,125,255,0.45), rgba(29,11,47,0.98) 52%), linear-gradient(180deg, #160924 0%, #08040f 100%)',
              boxShadow: view.pulseFlash > 0 ? '0 0 40px rgba(255, 107, 157, 0.55)' : undefined,
            }}
          >
            {view.stars.map((star) => (
              <div
                key={star.id}
                className="absolute rounded-full bg-white/80"
                style={{
                  left: `${(star.x / WIDTH) * 100}%`,
                  top: `${(star.y / HEIGHT) * 100}%`,
                  width: star.size,
                  height: star.size,
                  opacity: 0.7,
                }}
              />
            ))}

            {view.bullets.map((bullet) => (
              <div
                key={bullet.id}
                className="absolute rounded-full bg-[#ffe26d]"
                style={{
                  left: `${(bullet.x / WIDTH) * 100}%`,
                  top: `${(bullet.y / HEIGHT) * 100}%`,
                  width: `${(bullet.w / WIDTH) * 100}%`,
                  height: `${(bullet.h / HEIGHT) * 100}%`,
                  boxShadow: '0 0 16px rgba(255, 226, 109, 0.85)',
                }}
              />
            ))}

            {view.enemies.map((enemy) => (
              <div
                key={enemy.id}
                className="absolute"
                style={{
                  left: `${(enemy.x / WIDTH) * 100}%`,
                  top: `${(enemy.y / HEIGHT) * 100}%`,
                  width: `${(enemy.w / WIDTH) * 100}%`,
                  height: `${(enemy.h / HEIGHT) * 100}%`,
                }}
              >
                <div
                  className="h-full w-full"
                  style={{
                    clipPath: 'polygon(50% 0%, 100% 35%, 80% 100%, 20% 100%, 0% 35%)',
                    background: enemy.hp > 1 ? '#ff9e4a' : '#ff6b9d',
                    boxShadow: '0 0 20px rgba(255, 107, 157, 0.55)',
                  }}
                />
              </div>
            ))}

            <div
              className="absolute"
              style={{
                left: `${(view.player.x / WIDTH) * 100}%`,
                top: `${(view.player.y / HEIGHT) * 100}%`,
                width: `${(view.player.w / WIDTH) * 100}%`,
                height: `${(view.player.h / HEIGHT) * 100}%`,
                opacity: view.player.invulnerable > 0 ? 0.55 : 1,
              }}
            >
              <div
                className="h-full w-full"
                style={{
                  clipPath: 'polygon(50% 0%, 0% 100%, 35% 76%, 65% 76%, 100% 100%)',
                  background: 'linear-gradient(180deg, #7bf4ff 0%, #ff6b9d 100%)',
                  boxShadow: '0 0 24px rgba(123, 244, 255, 0.7)',
                }}
              />
            </div>

            {(view.over || !view.running) && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/35 text-center text-white backdrop-blur-[2px]">
                <div className="font-display text-4xl">{view.over ? 'Mission failed' : 'Ready for launch'}</div>
                <div className="mt-2 max-w-xs text-sm text-white/80">
                  {view.over ? 'Restart and push for a higher score.' : 'Start the run, build pulse charge, and clear the lane.'}
                </div>
              </div>
            )}
          </div>

          <div className="mt-4 flex flex-wrap gap-2">
            <button onClick={start} className="btn-primary">
              {view.over ? 'Restart run' : view.running ? 'Running' : 'Start run'}
            </button>
            <button onClick={reset} className="btn-ghost">Reset</button>
            <button
              onClick={releasePulse}
              disabled={view.charge < 100}
              className={view.charge >= 100 ? 'btn-purple' : 'btn-ghost opacity-60 cursor-not-allowed'}
            >
              Pulse
            </button>
          </div>
        </div>

        <div className="space-y-4">
          <div className="rounded-3xl border border-pink-light/60 bg-white/80 p-4">
            <div className="font-display text-2xl">Combat notes</div>
            <div className="mt-3 space-y-2 text-sm text-ink-light">
              <div>Move with arrow keys or WASD.</div>
              <div>Hold Space to keep firing.</div>
              <div>When the pulse meter hits 100%, press E or tap Pulse.</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            <span />
            <button {...holdControl(keysRef, 'w', true)} className="btn-ghost !px-3 !py-2">Up</button>
            <span />
            <button {...holdControl(keysRef, 'a', true)} className="btn-ghost !px-3 !py-2">Left</button>
            <button {...holdControl(keysRef, ' ', true)} className="btn-purple !px-3 !py-2">Fire</button>
            <button {...holdControl(keysRef, 'd', true)} className="btn-ghost !px-3 !py-2">Right</button>
            <span />
            <button {...holdControl(keysRef, 's', true)} className="btn-ghost !px-3 !py-2">Down</button>
            <span />
          </div>

          <div className="rounded-3xl border border-pink-light/60 bg-white/80 p-4 text-sm text-ink-light">
            The arena speeds up every 12 points. Missing enemies costs lives, so use the pulse as crowd control rather than waiting for panic.
          </div>
        </div>
      </div>
    </div>
  );
}

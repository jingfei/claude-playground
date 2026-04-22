import { useEffect, useRef, useState } from 'react';

const W = 800;
const H = 560;

const PITCHER = { x: 400, y: 110 };
const PLATE = { x: 400, y: 470 };
const BATTER = { x: 470, y: 450 };
const ZONE = { x: 365, y: 380, w: 70, h: 60 };

function lerp(a, b, t) {
  return a + (b - a) * t;
}

function createGameState() {
  return {
    phase: 'ready', // ready | pitching | result
    ballT: 0,
    ballEnd: null,
    inZone: false,
    swingT: -1,
    hit: null,
    balls: 0,
    strikes: 0,
    result: '',
    resultTimer: 0,
  };
}

// ---- Drawing ----
function drawField(ctx) {
  ctx.fillStyle = '#4a9a3a';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#55a544';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y, 520, 430, 0, Math.PI, 0);
  ctx.fill();

  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.moveTo(PLATE.x, PLATE.y + 10);
  ctx.lineTo(PLATE.x - 200, PLATE.y - 180);
  ctx.lineTo(PLATE.x, PLATE.y - 340);
  ctx.lineTo(PLATE.x + 200, PLATE.y - 180);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#4a9a3a';
  ctx.beginPath();
  ctx.moveTo(PLATE.x, PLATE.y - 30);
  ctx.lineTo(PLATE.x - 140, PLATE.y - 180);
  ctx.lineTo(PLATE.x, PLATE.y - 300);
  ctx.lineTo(PLATE.x + 140, PLATE.y - 180);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#fff';
  [
    [-200, -180],
    [0, -340],
    [200, -180],
  ].forEach(([dx, dy]) => {
    ctx.save();
    ctx.translate(PLATE.x + dx, PLATE.y + dy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  });

  ctx.fillStyle = '#b57a3a';
  ctx.beginPath();
  ctx.ellipse(PITCHER.x, PITCHER.y + 10, 55, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(PITCHER.x - 16, PITCHER.y + 4, 32, 4);

  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(PLATE.x - 18, PLATE.y + 8);
  ctx.lineTo(PLATE.x + 18, PLATE.y + 8);
  ctx.lineTo(PLATE.x + 18, PLATE.y);
  ctx.lineTo(PLATE.x, PLATE.y - 10);
  ctx.lineTo(PLATE.x - 18, PLATE.y);
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PLATE.x + 22, PLATE.y - 28, 46, 74);
  ctx.strokeRect(PLATE.x - 68, PLATE.y - 28, 46, 74);

  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PLATE.x, PLATE.y);
  ctx.lineTo(-30, -30);
  ctx.moveTo(PLATE.x, PLATE.y);
  ctx.lineTo(W + 30, -30);
  ctx.stroke();
}

function drawStrikeZone(ctx) {
  ctx.fillStyle = 'rgba(255, 255, 100, 0.15)';
  ctx.fillRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h);
  ctx.strokeStyle = 'rgba(255, 255, 100, 0.85)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 3]);
  ctx.strokeRect(ZONE.x, ZONE.y, ZONE.w, ZONE.h);
  ctx.setLineDash([]);
  ctx.fillStyle = 'rgba(255,255,100,0.75)';
  ctx.font = '11px system-ui';
  ctx.fillText('STRIKE ZONE', ZONE.x - 2, ZONE.y - 6);
}

function drawPitcher(ctx, g) {
  const x = PITCHER.x;
  const y = PITCHER.y;

  let armAngle = 0;
  if (g.phase === 'pitching') {
    if (g.ballT < 0.15) {
      armAngle = lerp(0, -Math.PI / 2, g.ballT / 0.15);
    } else if (g.ballT < 0.3) {
      armAngle = lerp(-Math.PI / 2, Math.PI / 2, (g.ballT - 0.15) / 0.15);
    } else {
      armAngle = Math.PI / 2;
    }
  }

  ctx.fillStyle = '#2a4a8a';
  ctx.beginPath();
  ctx.ellipse(x, y, 18, 22, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('17', x, y + 4);
  ctx.textAlign = 'left';

  ctx.strokeStyle = '#2a4a8a';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x - 14, y);
  ctx.lineTo(x - 32, y + 8);
  ctx.stroke();
  ctx.fillStyle = '#7a4820';
  ctx.beginPath();
  ctx.arc(x - 34, y + 10, 7, 0, Math.PI * 2);
  ctx.fill();

  const shX = x + 14;
  const shY = y;
  const handX = shX + Math.cos(armAngle) * 32;
  const handY = shY + Math.sin(armAngle) * 32;
  ctx.strokeStyle = '#2a4a8a';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.moveTo(shX, shY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  ctx.fillStyle = '#f4c891';
  ctx.beginPath();
  ctx.arc(x, y - 8, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a4a8a';
  ctx.beginPath();
  ctx.arc(x, y - 8, 13, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.ellipse(x, y + 2, 12, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 10px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('P', x, y - 5);
  ctx.textAlign = 'left';

  if (g.phase !== 'pitching' || g.ballT < 0.3) {
    drawBall(ctx, handX, handY, 5);
  }
}

function drawBatter(ctx, g) {
  const x = BATTER.x;
  const y = BATTER.y;

  let batAngle;
  if (g.swingT < 0) {
    batAngle = -Math.PI / 4;
  } else {
    batAngle = lerp(-Math.PI / 4, -Math.PI * 1.1, g.swingT);
  }

  ctx.fillStyle = '#c22';
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 2, y - 14, 4, 28);

  ctx.fillStyle = '#f4c891';
  ctx.beginPath();
  ctx.arc(x, y - 10, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#222';
  ctx.beginPath();
  ctx.arc(x, y - 10, 12, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#111';
  ctx.beginPath();
  ctx.ellipse(x - 4, y - 16, 4, 5, 0, 0, Math.PI * 2);
  ctx.fill();

  const handX = x + 6;
  const handY = y - 6;

  ctx.strokeStyle = '#c22';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  const batLen = 70;
  const batEndX = handX + Math.cos(batAngle) * batLen;
  const batEndY = handY + Math.sin(batAngle) * batLen;

  ctx.strokeStyle = '#5a3010';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(handX + Math.cos(batAngle) * 20, handY + Math.sin(batAngle) * 20);
  ctx.stroke();

  ctx.strokeStyle = '#a66a32';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(handX + Math.cos(batAngle) * 18, handY + Math.sin(batAngle) * 18);
  ctx.lineTo(batEndX, batEndY);
  ctx.stroke();
}

function drawBall(ctx, x, y, r) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c33';
  ctx.lineWidth = 1;
  ctx.stroke();
}

function drawPitchBall(ctx, g) {
  if (g.phase !== 'pitching' || g.ballT < 0.3 || !g.ballEnd) return;
  const t = (g.ballT - 0.3) / 0.7;
  const sx = PITCHER.x + 30;
  const sy = PITCHER.y + 30;
  const ex = g.ballEnd.x;
  const ey = g.ballEnd.y;
  const x = sx + (ex - sx) * t;
  const y = sy + (ey - sy) * t;

  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, ey + 20, 6 + t * 3, 2 + t, 0, 0, Math.PI * 2);
  ctx.fill();

  drawBall(ctx, x, y, 5 + t * 3);
}

function drawHitBall(ctx, g) {
  if (!g.hit) return;
  const t = Math.min(1, g.hit.t);
  const sx = PLATE.x;
  const sy = PLATE.y - 10;
  const ex = g.hit.x;
  const ey = g.hit.y;
  const peakY = Math.min(sy, ey) - 160;
  const peakX = (sx + ex) / 2;

  const bx = (ti) =>
    (1 - ti) * (1 - ti) * sx + 2 * (1 - ti) * ti * peakX + ti * ti * ex;
  const by = (ti) =>
    (1 - ti) * (1 - ti) * sy + 2 * (1 - ti) * ti * peakY + ti * ti * ey;

  for (let i = 6; i >= 1; i--) {
    const ti = Math.max(0, t - i * 0.05);
    ctx.globalAlpha = (7 - i) / 14;
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(bx(ti), by(ti), 5, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalAlpha = 1;

  drawBall(ctx, bx(t), by(t), 6);

  if (t >= 1) {
    ctx.strokeStyle = '#ff0';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(ex, ey, 18, 0, Math.PI * 2);
    ctx.stroke();
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 16px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(g.hit.type, ex, ey - 26);
    ctx.textAlign = 'left';
  }
}

// ---- Game logic ----
function startPitch(g) {
  const inZone = Math.random() < 0.65;
  let ex;
  let ey;
  if (inZone) {
    ex = ZONE.x + Math.random() * ZONE.w;
    ey = ZONE.y + Math.random() * ZONE.h;
  } else {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
      ex = ZONE.x + Math.random() * ZONE.w;
      ey = ZONE.y - 20 - Math.random() * 30;
    } else if (side === 1) {
      ex = ZONE.x + Math.random() * ZONE.w;
      ey = ZONE.y + ZONE.h + 10 + Math.random() * 30;
    } else if (side === 2) {
      ex = ZONE.x - 25 - Math.random() * 30;
      ey = ZONE.y + Math.random() * ZONE.h;
    } else {
      ex = ZONE.x + ZONE.w + 15 + Math.random() * 30;
      ey = ZONE.y + Math.random() * ZONE.h;
    }
  }
  g.ballEnd = { x: ex, y: ey };
  g.inZone = inZone;
  g.phase = 'pitching';
  g.ballT = 0;
  g.swingT = -1;
  g.hit = null;
  g.result = '';
  g.resultTimer = 0;
}

function swing(g) {
  if (g.phase !== 'pitching' || g.swingT >= 0) return;
  g.swingT = 0;
}

function resolve(g) {
  const swung = g.swingT >= 0;

  if (swung) {
    const goodTiming = g.swingT > 0.35 && g.swingT < 0.85;

    if (goodTiming && g.inZone) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2);
      const dist = 180 + Math.random() * 260;
      const hx = PLATE.x + Math.cos(angle) * dist;
      const hy = PLATE.y + Math.sin(angle) * dist;

      let type = 'SINGLE';
      const r = Math.random();
      if (dist > 380) type = 'HOME RUN!';
      else if (r > 0.85) type = 'TRIPLE';
      else if (r > 0.55) type = 'DOUBLE';
      g.hit = { x: hx, y: hy, type, t: 0 };
      g.result = 'HIT!';
      g.balls = 0;
      g.strikes = 0;
    } else {
      if (Math.random() < 0.25 && g.inZone) {
        const side = Math.random() < 0.5 ? -1 : 1;
        const hx = PLATE.x + side * (180 + Math.random() * 120);
        const hy = PLATE.y - (60 + Math.random() * 180);
        g.hit = { x: hx, y: hy, type: 'FOUL', t: 0 };
        g.result = 'FOUL!';
        if (g.strikes < 2) g.strikes++;
      } else {
        g.result = 'MISS!';
        g.strikes++;
      }
    }
  } else if (g.inZone) {
    g.result = 'STRIKE!';
    g.strikes++;
  } else {
    g.result = 'BALL!';
    g.balls++;
  }

  if (g.strikes >= 3) {
    g.result = 'STRIKEOUT';
    g.strikes = 0;
    g.balls = 0;
  } else if (g.balls >= 4) {
    g.result = 'WALK';
    g.strikes = 0;
    g.balls = 0;
  }

  g.resultTimer = 90;
  g.phase = 'result';
}

// ---- React component ----
const RESULT_COLORS = {
  'STRIKE!': 'text-red-400',
  'BALL!': 'text-green-400',
  'HIT!': 'text-yellow-300',
  'FOUL!': 'text-orange-400',
  'MISS!': 'text-red-300',
  STRIKEOUT: 'text-red-500',
  WALK: 'text-green-400',
};

export default function BaseballGame() {
  const canvasRef = useRef(null);
  const gameRef = useRef(createGameState());
  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [phase, setPhase] = useState('ready');
  const [resultText, setResultText] = useState('');
  const [resultAlpha, setResultAlpha] = useState(0);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    const g = gameRef.current;

    let rafId;

    const tick = () => {
      if (g.phase === 'pitching') {
        g.ballT += 0.018;
        if (g.swingT >= 0) g.swingT += 0.05;
        if (g.ballT >= 1) {
          g.ballT = 1;
          resolve(g);
          setBalls(g.balls);
          setStrikes(g.strikes);
          setResultText(g.result);
          setPhase(g.phase);
        }
      } else if (g.phase === 'result') {
        if (g.resultTimer > 0) g.resultTimer--;
        if (g.hit) g.hit.t = Math.min(1, g.hit.t + 0.022);
      }

      // result alpha: fade as timer runs down, but only for text overlay
      const alpha = g.resultTimer > 0 ? Math.min(1, g.resultTimer / 30) : 0;
      setResultAlpha(alpha);

      // render
      drawField(ctx);
      drawStrikeZone(ctx);
      drawHitBall(ctx, g);
      drawPitcher(ctx, g);
      drawPitchBall(ctx, g);
      drawBatter(ctx, g);

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const canStartNext = () =>
      g.phase === 'ready' || (g.phase === 'result' && g.resultTimer < 30);

    const doStart = () => {
      startPitch(g);
      setPhase(g.phase);
      setResultText('');
    };

    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (g.phase === 'pitching') swing(g);
        else if (canStartNext()) doStart();
      } else if (canStartNext()) {
        doStart();
      }
    };

    const onClick = () => {
      if (g.phase === 'pitching') swing(g);
      else if (canStartNext()) doStart();
    };

    window.addEventListener('keydown', onKey);
    canvas.addEventListener('click', onClick);

    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  const resultColor = RESULT_COLORS[resultText] ?? 'text-white';

  return (
    <div
      className="relative rounded-lg overflow-hidden border-2 border-neutral-700 shadow-2xl shadow-black/50"
      style={{ width: W, height: H }}
    >
      <canvas ref={canvasRef} width={W} height={H} className="block cursor-pointer" />

      {/* Scoreboard overlay */}
      <div className="absolute top-3 left-3 px-4 py-3 rounded-md bg-black/75 border border-neutral-700 backdrop-blur-sm">
        <div className="text-xs font-bold tracking-widest text-neutral-300 mb-2">
          COUNT
        </div>
        <div className="flex items-center gap-2 mb-1.5">
          <span className="text-xs text-neutral-400 w-4">B</span>
          {Array.from({ length: 4 }).map((_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full border ${
                i < balls
                  ? 'bg-green-500 border-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
                  : 'bg-neutral-800 border-neutral-600'
              }`}
            />
          ))}
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-neutral-400 w-4">S</span>
          {Array.from({ length: 3 }).map((_, i) => (
            <span
              key={i}
              className={`w-3.5 h-3.5 rounded-full border ${
                i < strikes
                  ? 'bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]'
                  : 'bg-neutral-800 border-neutral-600'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Result banner */}
      {resultText && resultAlpha > 0 && (
        <div
          className="absolute inset-x-0 top-1/3 flex items-center justify-center pointer-events-none"
          style={{ opacity: resultAlpha }}
        >
          <div
            className={`text-6xl font-black tracking-wider drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] ${resultColor}`}
          >
            {resultText}
          </div>
        </div>
      )}

      {/* Ready prompt */}
      {phase === 'ready' && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/70 text-sm text-neutral-200 border border-neutral-700">
            Press any key to pitch
          </div>
        </div>
      )}
    </div>
  );
}

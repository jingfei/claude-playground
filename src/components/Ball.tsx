import { useImperativeHandle, useRef } from 'react';
import { W, H, PITCHER, PLATE } from '../game/constants.ts';
import { drawBall } from '../game/draw.ts';
import type { DrawHandle, GameState } from '../types.ts';

interface Props {
  ref: React.Ref<DrawHandle>;
}

export default function Ball({ ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, (): DrawHandle => ({
    draw(g: GameState) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      drawPitchBall(ctx, g);
      drawHitBall(ctx, g);
    },
  }));

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="absolute inset-0 pointer-events-none"
    />
  );
}

function drawPitchBall(ctx: CanvasRenderingContext2D, g: GameState): void {
  if (g.phase !== 'pitching' || g.ballT < 0.3 || !g.ballEnd) return;
  const t = (g.ballT - 0.3) / 0.7;
  const sx = PITCHER.x + 30;
  const sy = PITCHER.y + 30;
  const { x: ex, y: ey } = g.ballEnd;
  const x = sx + (ex - sx) * t;
  const y = sy + (ey - sy) * t;

  // Ground shadow
  ctx.fillStyle = 'rgba(0,0,0,0.25)';
  ctx.beginPath();
  ctx.ellipse(x, ey + 20, 6 + t * 3, 2 + t, 0, 0, Math.PI * 2);
  ctx.fill();

  drawBall(ctx, x, y, 5 + t * 3);
}

function drawHitBall(ctx: CanvasRenderingContext2D, g: GameState): void {
  if (!g.hit) return;
  const t = Math.min(1, g.hit.t);
  const sx = PLATE.x;
  const sy = PLATE.y - 10;
  const { x: ex, y: ey } = g.hit;
  const peakY = Math.min(sy, ey) - 160;
  const peakX = (sx + ex) / 2;

  const bx = (ti: number) =>
    (1 - ti) * (1 - ti) * sx + 2 * (1 - ti) * ti * peakX + ti * ti * ex;
  const by = (ti: number) =>
    (1 - ti) * (1 - ti) * sy + 2 * (1 - ti) * ti * peakY + ti * ti * ey;

  // Trail
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

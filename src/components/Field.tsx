import { useEffect, useRef } from 'react';
import { W, H, PITCHER, PLATE, ZONE } from '../game/constants.ts';

// Bases in fair territory.
// Diamond side s = 340/√2 ≈ 240 px (home-to-second = 340 px).
// First/third base centers moved ~15 px inward from the foul line so
// the full base square sits inside fair territory.
const FIRST  = { x: PLATE.x + 155, y: PLATE.y - 185 };
const SECOND = { x: PLATE.x,       y: PLATE.y - 340 };
const THIRD  = { x: PLATE.x - 155, y: PLATE.y - 185 };

// Back vertex of home plate — where the two foul lines originate.
const VERTEX = { x: PLATE.x, y: PLATE.y + 10 };

export default function Field() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    drawField(ctx);
    drawStrikeZone(ctx);
  }, []);

  return <canvas ref={canvasRef} width={W} height={H} className="absolute inset-0" />;
}

function drawField(ctx: CanvasRenderingContext2D): void {
  // ── Grass ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#4a9a3a';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#55a544';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y, 520, 430, 0, Math.PI, 0);
  ctx.fill();

  // ── Infield dirt ───────────────────────────────────────────────────────
  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(THIRD.x,  THIRD.y);
  ctx.lineTo(SECOND.x, SECOND.y);
  ctx.lineTo(FIRST.x,  FIRST.y);
  ctx.closePath();
  ctx.fill();

  // ── Inner grass (inside the basepath) ──────────────────────────────────
  const shrink = 40; // inset the inner-grass polygon
  ctx.fillStyle = '#4a9a3a';
  ctx.beginPath();
  ctx.moveTo(PLATE.x,           VERTEX.y  - shrink);
  ctx.lineTo(THIRD.x  + shrink, THIRD.y  + shrink * 0.3);
  ctx.lineTo(SECOND.x,          SECOND.y + shrink);
  ctx.lineTo(FIRST.x  - shrink, FIRST.y  + shrink * 0.3);
  ctx.closePath();
  ctx.fill();

  // ── Foul lines — exactly 90° (±45° from vertical), start at plate vertex ─
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  const reach = 700; // long enough to exit the canvas
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(VERTEX.x + reach, VERTEX.y - reach); // right foul line  +45°
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(VERTEX.x - reach, VERTEX.y - reach); // left foul line   −45°
  ctx.stroke();

  // ── Pitcher's mound ────────────────────────────────────────────────────
  ctx.fillStyle = '#b57a3a';
  ctx.beginPath();
  ctx.ellipse(PITCHER.x, PITCHER.y + 10, 55, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(PITCHER.x - 16, PITCHER.y + 4, 32, 4);

  // ── Home plate — pentagon, flat edge toward pitcher, vertex toward catcher ─
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(PLATE.x - 18, PLATE.y - 10); // front-left
  ctx.lineTo(PLATE.x + 18, PLATE.y - 10); // front-right
  ctx.lineTo(PLATE.x + 18, PLATE.y);      // right shoulder
  ctx.lineTo(PLATE.x,      PLATE.y + 10); // back vertex  ← toward catcher
  ctx.lineTo(PLATE.x - 18, PLATE.y);      // left shoulder
  ctx.closePath();
  ctx.fill();

  // ── Batter's boxes ─────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PLATE.x + 20,  PLATE.y - 30, 46, 74);
  ctx.strokeRect(PLATE.x - 66,  PLATE.y - 30, 46, 74);

  // ── Bases ──────────────────────────────────────────────────────────────
  ctx.fillStyle = '#fff';
  [FIRST, SECOND, THIRD].forEach(({ x, y }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  });
}

function drawStrikeZone(ctx: CanvasRenderingContext2D): void {
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

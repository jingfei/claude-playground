import { useEffect, useRef } from 'react';
import { W, H, PITCHER, PLATE, ZONE, VERTEX, FIRST, SECOND, THIRD, BASE_R, INFIELD_ARC, COLOR_GRASS, COLOR_DIRT, COLOR_MOUND } from '../game/constants.ts';

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
  const SCALE  = 340 / 127.279;
  const baseR  = 15 * SCALE;   // ≈  40px  15-ft dirt circle around each base
  const moundR =  9 * SCALE;   // ≈  24px  18-ft mound diameter → 9-ft radius
  const br     = BASE_R;       // ≈  30px  half-diagonal of 18″ rotated base

  // ── Outfield grass ─────────────────────────────────────────────────────
  ctx.fillStyle = COLOR_GRASS;
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#55a544';   // lighter fair-territory grass
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(W, VERTEX.y - (W - VERTEX.x));   // right foul line → canvas edge (800, 90)
  ctx.lineTo(W, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, VERTEX.y - VERTEX.x);         // left foul line → canvas edge (0, 90)
  ctx.closePath();
  ctx.fill();

  // ── Infield dirt — bounded by foul lines and 95-ft arc ─────────────────
  ctx.fillStyle = COLOR_DIRT;
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(INFIELD_ARC.rightX, INFIELD_ARC.rightY);                              // up right foul line
  ctx.arc(PITCHER.x, PITCHER.y, INFIELD_ARC.r, INFIELD_ARC.angR, INFIELD_ARC.angL, true); // arc through top
  ctx.closePath();                                                                  // back down left foul line
  ctx.fill();

  // ── Inner grass diamond ─────────────────────────────────────────────────
  // Home corner: foul-line-parallel intersection → y=460; second corner → y=180
  const homeCornerY   = FIRST.x + FIRST.y - PLATE.x;   // 460
  const secondCornerY = FIRST.y - (FIRST.x - PLATE.x);  // 180
  ctx.fillStyle = COLOR_GRASS;
  ctx.beginPath();
  ctx.moveTo(PLATE.x,  homeCornerY);   // home corner
  ctx.lineTo(THIRD.x,  THIRD.y);       // center of third
  ctx.lineTo(PLATE.x,  secondCornerY); // second corner (perp lines meet)
  ctx.lineTo(FIRST.x,  FIRST.y);       // center of first
  ctx.closePath();
  ctx.fill();

  // ── Foul lines — 45° from VERTEX ───────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  const reach = 700;
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(VERTEX.x + reach, VERTEX.y - reach);
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(VERTEX.x - reach, VERTEX.y - reach);
  ctx.stroke();

  // ── Dirt circles around first, second, third — clipped to fair territory ─
  // Fair territory: VERTEX → right foul (800,90) → top-right → top-left → left foul (0,90)
  ctx.save();
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(W, VERTEX.y - (W - VERTEX.x));   // right foul line at canvas edge
  ctx.lineTo(W, 0);
  ctx.lineTo(0, 0);
  ctx.lineTo(0, VERTEX.y - VERTEX.x);         // left foul line at canvas edge
  ctx.closePath();
  ctx.clip();
  ctx.fillStyle = COLOR_DIRT;
  [FIRST, SECOND, THIRD].forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, baseR, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // ── Dirt circle around home plate (may exceed foul lines) ───────────────
  ctx.fillStyle = COLOR_DIRT;
  ctx.beginPath();
  ctx.arc(PLATE.x, PLATE.y, baseR, 0, Math.PI * 2);
  ctx.fill();

  // ── Pitcher's mound (18-ft diameter circle) ────────────────────────────
  ctx.fillStyle = COLOR_MOUND;
  ctx.beginPath();
  ctx.arc(PITCHER.x, PITCHER.y, moundR, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(PITCHER.x - 16, PITCHER.y + 2, 32, 4); // pitcher's rubber (24″×6″)

  // ── Home plate — 40px wide × 40px deep, matches 17″×17″ ratio ──────────
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(PLATE.x - 20, PLATE.y - 20); // front-left
  ctx.lineTo(PLATE.x + 20, PLATE.y - 20); // front-right
  ctx.lineTo(PLATE.x + 20, PLATE.y);      // right shoulder
  ctx.lineTo(PLATE.x,      PLATE.y + 20); // back vertex
  ctx.lineTo(PLATE.x - 20, PLATE.y);      // left shoulder
  ctx.closePath();
  ctx.fill();

  // ── Batter's boxes ─────────────────────────────────────────────────────
  ctx.strokeStyle = 'rgba(255,255,255,0.55)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PLATE.x + 22, PLATE.y - 30, 46, 74);
  ctx.strokeRect(PLATE.x - 68, PLATE.y - 30, 46, 74);

  // ── Bases (18″ square, rotated 45°) ────────────────────────────────────
  ctx.fillStyle = '#fff';
  [FIRST, SECOND, THIRD].forEach(({ x, y }) => {
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-21, -21, 42, 42);
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

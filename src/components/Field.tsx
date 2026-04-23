import { useEffect, useRef } from 'react';
import { W, H, PITCHER, PLATE, ZONE } from '../game/constants.ts';

// All distances from VERTEX=(400,490). Foul lines: x+y=890 (right), x−y=−90 (left).
// Home→first/third: VERTEX to back corner (right-pointing corner, on foul line) = 90ft = 240px.
//   Back corner of FIRST = (570,320) on right foul; center = back corner − (br,0) ≈ (540,320).
//   Back corner of THIRD = (230,320) on left foul; center = back corner + (br,0) ≈ (260,320).
// Home→second: VERTEX to center of second base = 127.279ft diagonal = 340px → (400,150).
// MLB pitcher = 60.5ft (162px from VERTEX) < 66.8ft to second (178px) → closer to HOME. ✓
const FIRST  = { x: PLATE.x + 140, y: PLATE.y - 150 }; // (540, 320)
const SECOND = { x: PLATE.x,       y: PLATE.y - 320 }; // (400, 150) = VERTEX.y − 340
const THIRD  = { x: PLATE.x - 140, y: PLATE.y - 150 }; // (260, 320)

// Back vertex of home plate — where the two foul lines originate.
const VERTEX = { x: PLATE.x, y: PLATE.y + 20 };

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
  // MLB scale: 340px = 127.279ft (home-to-second diagonal)
  const SCALE  = 340 / 127.279;
  const arcR   = 95 * SCALE;   // ≈ 254px  95-ft infield arc centered on mound
  const baseR  = 15 * SCALE;   // ≈  40px  15-ft dirt circle around each base
  const moundR =  9 * SCALE;   // ≈  24px  18-ft mound diameter → 9-ft radius
  const br     = 21 * Math.SQRT2; // ≈  30px  half-diagonal of 18″ rotated base

  // ── Outfield grass ─────────────────────────────────────────────────────
  ctx.fillStyle = '#4a9a3a';
  ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = '#55a544';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y, 520, 430, 0, Math.PI, 0);
  ctx.fill();

  // ── Infield dirt — bounded by foul lines and 95-ft arc ─────────────────
  // Solve for arc ∩ right foul line (x+y = VERTEX.x+VERTEX.y):
  //   let u = x−PITCHER.x; 2u²−2·FmPy·u+(FmPy²−arcR²)=0
  //   FmPy = foulSum−PITCHER.x−PITCHER.y
  const foulSum = VERTEX.x + VERTEX.y;
  const fmpy    = foulSum - PITCHER.x - PITCHER.y;
  const chord   = Math.sqrt(2 * arcR * arcR - fmpy * fmpy);
  const uR      = (fmpy + chord) / 2;
  const arcRX   = PITCHER.x + uR;
  const arcRY   = foulSum - arcRX;               // on right foul line
  const arcLX   = 2 * PITCHER.x - arcRX;        // symmetric left intersection
  const arcLY   = arcRY;
  const angR    = Math.atan2(arcRY - PITCHER.y, arcRX - PITCHER.x);
  const angL    = Math.atan2(arcLY - PITCHER.y, arcLX - PITCHER.x);

  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.moveTo(VERTEX.x, VERTEX.y);
  ctx.lineTo(arcRX, arcRY);                              // up right foul line
  ctx.arc(PITCHER.x, PITCHER.y, arcR, angR, angL, true); // arc through top (anticlockwise)
  ctx.closePath();                                       // back down left foul line
  ctx.fill();

  // ── Inner grass diamond ─────────────────────────────────────────────────
  // Edges touch the UP corners of first/third (towards second) and DOWN corner of second.
  ctx.fillStyle = '#4a9a3a';
  ctx.beginPath();
  ctx.moveTo(PLATE.x,        VERTEX.y - 40);      // home side
  ctx.lineTo(THIRD.x,        THIRD.y  - br);      // top of third
  ctx.lineTo(SECOND.x,       SECOND.y);            // center of second
  ctx.lineTo(FIRST.x,        FIRST.y  - br);      // top of first
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
  ctx.fillStyle = '#c68a4a';
  [FIRST, SECOND, THIRD].forEach(({ x, y }) => {
    ctx.beginPath();
    ctx.arc(x, y, baseR, 0, Math.PI * 2);
    ctx.fill();
  });
  ctx.restore();

  // ── Dirt circle around home plate (may exceed foul lines) ───────────────
  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.arc(PLATE.x, PLATE.y, baseR, 0, Math.PI * 2);
  ctx.fill();

  // ── Pitcher's mound (18-ft diameter circle) ────────────────────────────
  ctx.fillStyle = '#b57a3a';
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

import { useImperativeHandle, useRef } from 'react';
import { W, H, ZONE } from '../game/constants.ts';
import { lerp } from '../game/state.ts';
import { drawBall } from '../game/draw.ts';
import type { DrawHandle, GameState } from '../types.ts';

interface Props {
  ref: React.Ref<DrawHandle>;
}

// Batter POV layout — pitcher in top-center (~30% down), zone in bottom-center, batter beside.
const POV_PITCHER = { x: W / 2, y: H * 0.30 };           // (400, ~168) — feet land on mound
const POV_ZONE    = { x: 300, y: 340, w: 200, h: 180 };  // strike zone centered at x=400
const POV_BATTER  = { x: 590, y: 430 };                  // right-handed, right of zone
const POV_RELEASE = { x: W / 2, y: POV_PITCHER.y + 18 }; // (400, ~186) — above zone center

function mapBallEnd(end: { x: number; y: number }) {
  return {
    x: POV_ZONE.x + ((end.x - ZONE.x) / ZONE.w) * POV_ZONE.w,
    y: POV_ZONE.y + ((end.y - ZONE.y) / ZONE.h) * POV_ZONE.h,
  };
}

export default function BatterView({ ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, (): DrawHandle => ({
    draw(g: GameState) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      drawBackground(ctx);
      drawPitcher(ctx, g);
      drawStrikeZone(ctx);
      drawPitchBall(ctx, g);
      drawBatter(ctx, g);
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

function drawBackground(ctx: CanvasRenderingContext2D): void {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.26);
  sky.addColorStop(0, '#1a2d48');
  sky.addColorStop(1, '#5a7ea0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.26);

  // Outfield wall stripe (at horizon)
  ctx.fillStyle = '#1f5218';
  ctx.fillRect(0, H * 0.24, W, 12);

  // Outfield grass (far, narrow band in perspective)
  const ofGrass = ctx.createLinearGradient(0, H * 0.26, 0, H * 0.40);
  ofGrass.addColorStop(0, '#55a544');
  ofGrass.addColorStop(1, '#4a9a3a');
  ctx.fillStyle = ofGrass;
  ctx.fillRect(0, H * 0.26, W, H * 0.14);

  // Infield dirt — strip between outfield grass and infield grass
  ctx.fillStyle = '#b07838';
  ctx.fillRect(0, H * 0.40, W, H * 0.03);

  // Infield grass (BIG — pitcher stands here)
  const ifGrass = ctx.createLinearGradient(0, H * 0.43, 0, H * 0.72);
  ifGrass.addColorStop(0, '#4a9a3a');
  ifGrass.addColorStop(1, '#55a544');
  ctx.fillStyle = ifGrass;
  ctx.fillRect(0, H * 0.43, W, H * 0.29);

  // Pitcher's mound — at pitcher's feet, inside infield grass
  const moundY = POV_PITCHER.y + 72;   // feet level ≈ 240, inside infield grass (y≈241+)
  ctx.fillStyle = '#a56d2f';
  ctx.beginPath();
  ctx.ellipse(POV_PITCHER.x, moundY, 100, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Infield dirt (near camera — basepath / batter area)
  const ifDirtNear = ctx.createLinearGradient(0, H * 0.72, 0, H);
  ifDirtNear.addColorStop(0, '#b87a3c');
  ifDirtNear.addColorStop(1, '#8d5a2a');
  ctx.fillStyle = ifDirtNear;
  ctx.fillRect(0, H * 0.72, W, H * 0.28);

  // Home plate (near bottom-center)
  ctx.fillStyle = '#fff';
  const hpx = W / 2;
  const hpy = H - 18;
  ctx.beginPath();
  ctx.moveTo(hpx - 110, hpy);
  ctx.lineTo(hpx + 110, hpy);
  ctx.lineTo(hpx + 110, hpy + 8);
  ctx.lineTo(hpx,       hpy + 18);
  ctx.lineTo(hpx - 110, hpy + 8);
  ctx.closePath();
  ctx.fill();
}

function drawPitcher(ctx: CanvasRenderingContext2D, g: GameState): void {
  const { x, y } = POV_PITCHER;

  // Overhand throwing arm: ready low-right, windup up-back, throw forward-down, follow through.
  let armAngle = Math.PI * 0.85;
  if (g.phase === 'pitching') {
    if (g.ballT < 0.15) {
      armAngle = lerp(Math.PI * 0.85, -Math.PI * 0.55, g.ballT / 0.15);
    } else if (g.ballT < 0.3) {
      armAngle = lerp(-Math.PI * 0.55, Math.PI * 0.4, (g.ballT - 0.15) / 0.15);
    } else {
      armAngle = Math.PI * 0.4;
    }
  }

  // Pants / legs
  ctx.fillStyle = '#d8d8d8';
  ctx.fillRect(x - 16, y + 36, 12, 34);
  ctx.fillRect(x + 4,  y + 36, 12, 34);
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x - 16, y + 66, 12, 6);
  ctx.fillRect(x + 4,  y + 66, 12, 6);

  // Torso
  ctx.fillStyle = '#2a4a8a';
  ctx.beginPath();
  ctx.ellipse(x, y + 12, 22, 30, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 12px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('17', x, y + 16);
  ctx.textAlign = 'left';

  // Glove arm (pitcher's left = viewer's right), mostly static
  ctx.strokeStyle = '#2a4a8a';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x + 18, y + 4);
  ctx.lineTo(x + 30, y + 18);
  ctx.stroke();
  ctx.fillStyle = '#6a3c18';
  ctx.beginPath();
  ctx.arc(x + 34, y + 20, 9, 0, Math.PI * 2);
  ctx.fill();

  // Throwing arm (pitcher's right = viewer's left)
  const shX = x - 18, shY = y + 2;
  const armLen = 32;
  const handX = shX + Math.cos(armAngle) * armLen;
  const handY = shY + Math.sin(armAngle) * armLen;
  ctx.strokeStyle = '#2a4a8a';
  ctx.lineWidth = 8;
  ctx.beginPath();
  ctx.moveTo(shX, shY);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Head
  ctx.fillStyle = '#f4c891';
  ctx.beginPath();
  ctx.arc(x, y - 20, 13, 0, Math.PI * 2);
  ctx.fill();

  // Cap (forward-facing)
  ctx.fillStyle = '#2a4a8a';
  ctx.beginPath();
  ctx.arc(x, y - 22, 13, Math.PI, 0);
  ctx.fill();
  ctx.fillRect(x - 13, y - 22, 26, 2);
  ctx.beginPath();
  ctx.ellipse(x, y - 18, 16, 4, 0, 0, Math.PI);
  ctx.fill();

  // Eyes
  ctx.fillStyle = '#000';
  ctx.fillRect(x - 5, y - 16, 2, 3);
  ctx.fillRect(x + 3, y - 16, 2, 3);

  // Ball in hand before release
  if (g.phase !== 'pitching' || g.ballT < 0.3) {
    drawBall(ctx, handX, handY, 5);
  }
}

function drawStrikeZone(ctx: CanvasRenderingContext2D): void {
  ctx.fillStyle = 'rgba(255, 255, 100, 0.10)';
  ctx.fillRect(POV_ZONE.x, POV_ZONE.y, POV_ZONE.w, POV_ZONE.h);
  ctx.strokeStyle = 'rgba(255, 255, 100, 0.85)';
  ctx.lineWidth = 2.5;
  ctx.setLineDash([6, 4]);
  ctx.strokeRect(POV_ZONE.x, POV_ZONE.y, POV_ZONE.w, POV_ZONE.h);
  ctx.setLineDash([]);

  // 3x3 grid lines
  ctx.strokeStyle = 'rgba(255, 255, 100, 0.28)';
  ctx.lineWidth = 1;
  for (let i = 1; i < 3; i++) {
    const vx = POV_ZONE.x + (POV_ZONE.w * i) / 3;
    const hy = POV_ZONE.y + (POV_ZONE.h * i) / 3;
    ctx.beginPath();
    ctx.moveTo(vx, POV_ZONE.y);
    ctx.lineTo(vx, POV_ZONE.y + POV_ZONE.h);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(POV_ZONE.x, hy);
    ctx.lineTo(POV_ZONE.x + POV_ZONE.w, hy);
    ctx.stroke();
  }
}

function drawPitchBall(ctx: CanvasRenderingContext2D, g: GameState): void {
  if (!g.ballEnd) return;

  if (g.phase === 'pitching' && g.ballT >= 0.3) {
    const t = (g.ballT - 0.3) / 0.7;
    const end = mapBallEnd(g.ballEnd);
    const x = lerp(POV_RELEASE.x, end.x, t);
    const y = lerp(POV_RELEASE.y, end.y, t);
    const r = 3 + t * t * 13; // quadratic growth for perspective

    // Shadow at ground level
    const shadowY = POV_ZONE.y + POV_ZONE.h + 22;
    ctx.fillStyle = `rgba(0,0,0,${0.08 + t * 0.22})`;
    ctx.beginPath();
    ctx.ellipse(x, shadowY, r * 0.7, r * 0.3, 0, 0, Math.PI * 2);
    ctx.fill();
    drawBall(ctx, x, y, r);
  } else if (g.phase === 'result' && !g.hit) {
    // Keep ball visible at final position so the user can see where it crossed
    const end = mapBallEnd(g.ballEnd);
    drawBall(ctx, end.x, end.y, 16);
  }
}

function drawBatter(ctx: CanvasRenderingContext2D, g: GameState): void {
  const { x, y } = POV_BATTER;

  // Right-handed batter, viewed from behind: bat starts up-right (back shoulder),
  // swings clockwise — barrel sweeps down and across through the zone to follow-through.
  const batAngle =
    g.swingT < 0
      ? -Math.PI / 3
      : lerp(-Math.PI / 3, Math.PI * 0.95, g.swingT);

  // Legs
  ctx.fillStyle = '#1a1a1a';
  ctx.fillRect(x - 22, y + 35, 14, 55);
  ctx.fillRect(x + 8,  y + 35, 14, 55);

  // Torso (back view, red jersey)
  ctx.fillStyle = '#c22';
  ctx.beginPath();
  ctx.ellipse(x, y + 5, 27, 42, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 20px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('9', x, y + 14);
  ctx.textAlign = 'left';

  // Helmet (back of head)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x, y - 36, 17, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.arc(x - 15, y - 34, 5, 0, Math.PI * 2);
  ctx.fill();

  // Hands grip point
  const handX = x - 8;
  const handY = y - 18;

  // Bat
  const batLen = 115;
  const batEndX = handX + Math.cos(batAngle) * batLen;
  const batEndY = handY + Math.sin(batAngle) * batLen;

  // Handle
  ctx.strokeStyle = '#4a2a10';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(handX + Math.cos(batAngle) * 30, handY + Math.sin(batAngle) * 30);
  ctx.stroke();

  // Barrel
  ctx.strokeStyle = '#a66a32';
  ctx.lineWidth = 11;
  ctx.beginPath();
  ctx.moveTo(handX + Math.cos(batAngle) * 28, handY + Math.sin(batAngle) * 28);
  ctx.lineTo(batEndX, batEndY);
  ctx.stroke();

  // Hand
  ctx.fillStyle = '#f4c891';
  ctx.beginPath();
  ctx.arc(handX, handY, 6, 0, Math.PI * 2);
  ctx.fill();
}

function drawHitBall(ctx: CanvasRenderingContext2D, g: GameState): void {
  if (!g.hit) return;
  const t = Math.min(1, g.hit.t);
  // Ball flies from bat contact toward and past the pitcher, shrinking with distance.
  const startX = POV_BATTER.x - 40;
  const startY = POV_BATTER.y - 20;
  const endX = POV_PITCHER.x + (startX - POV_PITCHER.x) * 0.25;
  const endY = POV_PITCHER.y - 80;
  const x = lerp(startX, endX, t);
  const y = lerp(startY, endY, t);
  const r = lerp(12, 2, t);
  if (r > 1) drawBall(ctx, x, y, r);

  if (t >= 1) {
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    ctx.fillText(g.hit.type, W / 2, POV_PITCHER.y - 60);
    ctx.textAlign = 'left';
  }
}

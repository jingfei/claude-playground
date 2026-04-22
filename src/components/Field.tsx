import { useEffect, useRef } from 'react';
import { W, H, PITCHER, PLATE, ZONE } from '../game/constants.ts';

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
  // Grass
  ctx.fillStyle = '#4a9a3a';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = '#55a544';
  ctx.beginPath();
  ctx.ellipse(PLATE.x, PLATE.y, 520, 430, 0, Math.PI, 0);
  ctx.fill();

  // Dirt infield
  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.moveTo(PLATE.x, PLATE.y + 10);
  ctx.lineTo(PLATE.x - 170, PLATE.y - 170);
  ctx.lineTo(PLATE.x, PLATE.y - 340);
  ctx.lineTo(PLATE.x + 170, PLATE.y - 170);
  ctx.closePath();
  ctx.fill();

  // Inner grass
  ctx.fillStyle = '#4a9a3a';
  ctx.beginPath();
  ctx.moveTo(PLATE.x, PLATE.y - 30);
  ctx.lineTo(PLATE.x - 120, PLATE.y - 170);
  ctx.lineTo(PLATE.x, PLATE.y - 290);
  ctx.lineTo(PLATE.x + 120, PLATE.y - 170);
  ctx.closePath();
  ctx.fill();

  // Bases — proper square diamond: side ≈ 240px, first/third at (±170, -170)
  ctx.fillStyle = '#fff';
  (
    [
      [-170, -170], // third base
      [0, -340],    // second base
      [170, -170],  // first base
    ] as [number, number][]
  ).forEach(([dx, dy]) => {
    ctx.save();
    ctx.translate(PLATE.x + dx, PLATE.y + dy);
    ctx.rotate(Math.PI / 4);
    ctx.fillRect(-8, -8, 16, 16);
    ctx.restore();
  });

  // Pitcher's mound
  ctx.fillStyle = '#b57a3a';
  ctx.beginPath();
  ctx.ellipse(PITCHER.x, PITCHER.y + 10, 55, 38, 0, 0, Math.PI * 2);
  ctx.fill();
  // Rubber
  ctx.fillStyle = '#fff';
  ctx.fillRect(PITCHER.x - 16, PITCHER.y + 4, 32, 4);

  // Home plate
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(PLATE.x - 18, PLATE.y + 8);
  ctx.lineTo(PLATE.x + 18, PLATE.y + 8);
  ctx.lineTo(PLATE.x + 18, PLATE.y);
  ctx.lineTo(PLATE.x, PLATE.y - 10);
  ctx.lineTo(PLATE.x - 18, PLATE.y);
  ctx.closePath();
  ctx.fill();

  // Batter's boxes
  ctx.strokeStyle = 'rgba(255,255,255,0.6)';
  ctx.lineWidth = 1.5;
  ctx.strokeRect(PLATE.x + 22, PLATE.y - 28, 46, 74);
  ctx.strokeRect(PLATE.x - 68, PLATE.y - 28, 46, 74);

  // Foul lines
  ctx.strokeStyle = 'rgba(255,255,255,0.65)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(PLATE.x, PLATE.y);
  ctx.lineTo(-30, -30);
  ctx.moveTo(PLATE.x, PLATE.y);
  ctx.lineTo(W + 30, -30);
  ctx.stroke();
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

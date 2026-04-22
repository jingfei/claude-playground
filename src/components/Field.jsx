import { useEffect, useRef } from 'react';
import { W, H, PITCHER, PLATE, ZONE } from '../game/constants.js';

export default function Field() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const ctx = canvasRef.current.getContext('2d');
    drawField(ctx);
    drawStrikeZone(ctx);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      width={W}
      height={H}
      className="absolute inset-0"
    />
  );
}

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

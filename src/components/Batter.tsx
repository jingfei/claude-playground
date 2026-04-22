import { useImperativeHandle, useRef } from 'react';
import { W, H, BATTER } from '../game/constants.ts';
import { lerp } from '../game/state.ts';
import type { DrawHandle, GameState } from '../types.ts';

interface Props {
  ref: React.Ref<DrawHandle>;
}

export default function Batter({ ref }: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useImperativeHandle(ref, (): DrawHandle => ({
    draw(g: GameState) {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      ctx.clearRect(0, 0, W, H);
      drawBatter(ctx, g);
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

function drawBatter(ctx: CanvasRenderingContext2D, g: GameState): void {
  const { x, y } = BATTER;

  const batAngle =
    g.swingT < 0
      ? -Math.PI / 4
      : lerp(-Math.PI / 4, -Math.PI * 1.1, g.swingT);

  // Body
  ctx.fillStyle = '#c22';
  ctx.beginPath();
  ctx.ellipse(x, y, 16, 20, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.fillRect(x - 2, y - 14, 4, 28);

  // Head + helmet
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

  // Arm
  ctx.strokeStyle = '#c22';
  ctx.lineWidth = 5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(x, y - 5);
  ctx.lineTo(handX, handY);
  ctx.stroke();

  // Bat
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

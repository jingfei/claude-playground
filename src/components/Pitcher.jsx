import { useImperativeHandle, useRef } from 'react';
import { W, H, PITCHER } from '../game/constants.js';
import { lerp } from '../game/state.js';
import { drawBall } from '../game/draw.js';

export default function Pitcher({ ref }) {
  const canvasRef = useRef(null);

  useImperativeHandle(ref, () => ({
    draw(g) {
      const ctx = canvasRef.current.getContext('2d');
      ctx.clearRect(0, 0, W, H);
      drawPitcher(ctx, g);
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

  // glove arm
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

  // throwing arm
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

  // head + cap
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

  // ball in hand before release
  if (g.phase !== 'pitching' || g.ballT < 0.3) {
    drawBall(ctx, handX, handY, 5);
  }
}

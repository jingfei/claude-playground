export function drawBall(ctx, x, y, r) {
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#c33';
  ctx.lineWidth = 1;
  ctx.stroke();
}

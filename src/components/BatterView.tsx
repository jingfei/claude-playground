import { useImperativeHandle, useRef } from 'react';
import { W, H, ZONE, PLATE } from '../game/constants.ts';
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

// Perspective projection: maps top-down (tx, ty) to batter-view screen coords.
// Calibrated so depth=142 (pitcher mound) → pvY=240 and depth→∞ → pvY≈H*0.24 (outfield wall).
const PROJ_D  = 48;                          // depth constant (controls perspective curve)
const PROJ_S  = 10.0;                        // horizontal spread scale
const PROJ_Y0 = H - 18;                      // home plate screen Y  (542)
const PROJ_C  = PROJ_Y0 - H * 0.24;          // Y range to outfield horizon (≈408)

// Foul-line far endpoints — depth 400 along the 45° diagonals. projectToPOV is a
// function declaration so it is hoisted and safe to call in these const initializers.
const pvFoulR = projectToPOV(PLATE.x + 400, PLATE.y - 400);  // ≈ (829, 178)
const pvFoulL = projectToPOV(PLATE.x - 400, PLATE.y - 400);  // ≈ (-29, 178)
// x coordinate on the right/left visual foul line at batter-view screen y=pvY
const bvFoulRX = (pvY: number) =>
  W / 2 + 110 + ((PROJ_Y0 - pvY) / (PROJ_Y0 - pvFoulR.y)) * (pvFoulR.x - (W / 2 + 110));
const bvFoulLX = (pvY: number) =>
  W / 2 - 110 + ((PROJ_Y0 - pvY) / (PROJ_Y0 - pvFoulL.y)) * (pvFoulL.x - (W / 2 - 110));

function projectToPOV(tx: number, ty: number): { x: number; y: number } {
  const depth   = PLATE.y - ty;
  const lateral = tx - PLATE.x;
  return {
    x: W / 2 + (lateral * PROJ_D * PROJ_S) / (depth + PROJ_D),
    y: PROJ_Y0 - (PROJ_C * depth) / (depth + PROJ_D),
  };
}

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
      drawFieldLines(ctx);
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

function drawFieldLines(ctx: CanvasRenderingContext2D): void {
  // Each base is a square rotated 45° (diamond orientation) projected into batter-view.
  // SZ = top-down side length; r = half-diagonal used to place the four corners.
  const SZ = 20;
  const r  = SZ / Math.SQRT2;

  const pvSecond = projectToPOV(PLATE.x, PLATE.y - 320);
  const hpx = W / 2;
  const hpy = PROJ_Y0;

  // First base: foul corner anchored at (PLATE.x+150, PLATE.y-150) on the right foul line.
  // The four corners of the rotated square in top-down → projected to batter-view.
  const r1raw = {
    top:  projectToPOV(PLATE.x + 150 - r, PLATE.y - 150 - r),
    foul: projectToPOV(PLATE.x + 150,     PLATE.y - 150),
    bot:  projectToPOV(PLATE.x + 150 - r, PLATE.y - 150 + r),
    fair: projectToPOV(PLATE.x + 150 - 2 * r, PLATE.y - 150),
  };
  // Snap foul corner onto the visual foul line (the two don't align because the visual
  // foul line starts at the home-plate corner, not through the perspective formula).
  const dx1 = bvFoulRX(r1raw.foul.y) - r1raw.foul.x;
  const f1 = {
    top:  { x: r1raw.top.x  + dx1, y: r1raw.top.y  },
    foul: { x: r1raw.foul.x + dx1, y: r1raw.foul.y },
    bot:  { x: r1raw.bot.x  + dx1, y: r1raw.bot.y  },
    fair: { x: r1raw.fair.x + dx1, y: r1raw.fair.y },
  };

  // Third base: mirror of first along the centre axis.
  const r3raw = {
    top:  projectToPOV(PLATE.x - 150 + r, PLATE.y - 150 - r),
    foul: projectToPOV(PLATE.x - 150,     PLATE.y - 150),
    bot:  projectToPOV(PLATE.x - 150 + r, PLATE.y - 150 + r),
    fair: projectToPOV(PLATE.x - 150 + 2 * r, PLATE.y - 150),
  };
  const dx3 = bvFoulLX(r3raw.foul.y) - r3raw.foul.x;
  const f3 = {
    top:  { x: r3raw.top.x  + dx3, y: r3raw.top.y  },
    foul: { x: r3raw.foul.x + dx3, y: r3raw.foul.y },
    bot:  { x: r3raw.bot.x  + dx3, y: r3raw.bot.y  },
    fair: { x: r3raw.fair.x + dx3, y: r3raw.fair.y },
  };

  // Second base: diamond centred on the midline at depth 320.
  const f2 = {
    top:   projectToPOV(PLATE.x,     PLATE.y - 320 - r),
    right: projectToPOV(PLATE.x + r, PLATE.y - 320),
    bot:   projectToPOV(PLATE.x,     PLATE.y - 320 + r),
    left:  projectToPOV(PLATE.x - r, PLATE.y - 320),
  };

  // Basepath dirt strips
  // Home→first and home→third: filled polygon strips of width SZ/2 following the foul line.
  // Fair-side edge is offset perpendicular to the foul line by ofs (inward toward fair territory).
  const ofs = SZ / 2 / Math.SQRT2;  // perpendicular inset = half-base-width / √2

  const f1sfRaw = projectToPOV(PLATE.x + 150 - ofs, PLATE.y - 150 - ofs);
  const f1sf    = { x: f1sfRaw.x + dx1, y: f1sfRaw.y };
  const f3sfRaw = projectToPOV(PLATE.x - 150 + ofs, PLATE.y - 150 - ofs);
  const f3sf    = { x: f3sfRaw.x + dx3, y: f3sfRaw.y };

  const nfR  = { x: hpx + 110, y: hpy };
  const nfL  = { x: hpx - 110, y: hpy };
  const nffR = { x: nfR.x + (f1sf.x - f1.foul.x), y: nfR.y + (f1sf.y - f1.foul.y) };
  const nffL = { x: nfL.x + (f3sf.x - f3.foul.x), y: nfL.y + (f3sf.y - f3.foul.y) };

  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.moveTo(nfR.x, nfR.y);
  ctx.lineTo(f1.foul.x, f1.foul.y);
  ctx.lineTo(f1sf.x, f1sf.y);
  ctx.lineTo(nffR.x, nffR.y);
  ctx.closePath();
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(nfL.x, nfL.y);
  ctx.lineTo(f3.foul.x, f3.foul.y);
  ctx.lineTo(f3sf.x, f3sf.y);
  ctx.lineTo(nffL.x, nffL.y);
  ctx.closePath();
  ctx.fill();

  // First→second and third→second basepath strips
  ctx.strokeStyle = '#c68a4a';
  ctx.lineWidth = 14;
  ctx.setLineDash([]);
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(f1.top.x, f1.top.y);
  ctx.lineTo(pvSecond.x, pvSecond.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(f3.top.x, f3.top.y);
  ctx.lineTo(pvSecond.x, pvSecond.y);
  ctx.stroke();

  // Chalk foul lines
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(hpx + 110, hpy);
  ctx.lineTo(pvFoulR.x, pvFoulR.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hpx - 110, hpy);
  ctx.lineTo(pvFoulL.x, pvFoulL.y);
  ctx.stroke();

  const baseBorder = 'rgba(180, 180, 180, 0.8)';

  // First base (perspective diamond)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(f1.top.x,  f1.top.y);
  ctx.lineTo(f1.foul.x, f1.foul.y);
  ctx.lineTo(f1.bot.x,  f1.bot.y);
  ctx.lineTo(f1.fair.x, f1.fair.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = baseBorder; ctx.lineWidth = 1; ctx.stroke();

  // Second base (perspective diamond)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(f2.top.x,   f2.top.y);
  ctx.lineTo(f2.right.x, f2.right.y);
  ctx.lineTo(f2.bot.x,   f2.bot.y);
  ctx.lineTo(f2.left.x,  f2.left.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = baseBorder; ctx.lineWidth = 1; ctx.stroke();

  // Third base (perspective diamond)
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.moveTo(f3.top.x,  f3.top.y);
  ctx.lineTo(f3.foul.x, f3.foul.y);
  ctx.lineTo(f3.bot.x,  f3.bot.y);
  ctx.lineTo(f3.fair.x, f3.fair.y);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = baseBorder; ctx.lineWidth = 1; ctx.stroke();
}

function drawBackground(ctx: CanvasRenderingContext2D): void {
  // Sky
  const sky = ctx.createLinearGradient(0, 0, 0, H * 0.26);
  sky.addColorStop(0, '#1a2d48');
  sky.addColorStop(1, '#5a7ea0');
  ctx.fillStyle = sky;
  ctx.fillRect(0, 0, W, H * 0.26);

  // Infield grass — solid dark fill for the entire band below the sky.
  ctx.fillStyle = '#4a9a3a';
  ctx.fillRect(0, H * 0.26, W, H * 0.74);

  // Pitcher's mound — at pitcher's feet, inside infield grass
  const moundY = POV_PITCHER.y + 72;
  ctx.fillStyle = '#c68a4a';
  ctx.beginPath();
  ctx.ellipse(POV_PITCHER.x, moundY, 100, 18, 0, 0, Math.PI * 2);
  ctx.fill();

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
  ctx.fillRect(x - 31, y + 49, 20, 77);
  ctx.fillRect(x + 11, y + 49, 20, 77);

  // Torso (back view, red jersey)
  ctx.fillStyle = '#c22';
  ctx.beginPath();
  ctx.ellipse(x, y + 7, 38, 59, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 28px system-ui';
  ctx.textAlign = 'center';
  ctx.fillText('9', x, y + 20);
  ctx.textAlign = 'left';

  // Helmet (back of head)
  ctx.fillStyle = '#1a1a1a';
  ctx.beginPath();
  ctx.arc(x, y - 50, 24, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#2a2a2a';
  ctx.beginPath();
  ctx.arc(x - 21, y - 48, 7, 0, Math.PI * 2);
  ctx.fill();

  // Hands grip point
  const handX = x - 12;
  const handY = y - 25;

  // Bat — length 285 so barrel tip reaches the far edge of the strike zone at full swing
  const batLen = 285;
  const batEndX = handX + Math.cos(batAngle) * batLen;
  const batEndY = handY + Math.sin(batAngle) * batLen;

  // Handle
  ctx.strokeStyle = '#4a2a10';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(handX, handY);
  ctx.lineTo(handX + Math.cos(batAngle) * 45, handY + Math.sin(batAngle) * 45);
  ctx.stroke();

  // Barrel
  ctx.strokeStyle = '#a66a32';
  ctx.lineWidth = 16;
  ctx.beginPath();
  ctx.moveTo(handX + Math.cos(batAngle) * 43, handY + Math.sin(batAngle) * 43);
  ctx.lineTo(batEndX, batEndY);
  ctx.stroke();

  // Hand
  ctx.fillStyle = '#f4c891';
  ctx.beginPath();
  ctx.arc(handX, handY, 9, 0, Math.PI * 2);
  ctx.fill();
}

function drawHitBall(ctx: CanvasRenderingContext2D, g: GameState): void {
  if (!g.hit) return;
  const t = Math.min(1, g.hit.t);

  // Derive direction from top-down hit position relative to home plate.
  // cos(hitAngle): positive = right field, negative = left field.
  // All hits have negative sin (forward toward pitcher), so ball always rises on screen.
  const hitAngle = Math.atan2(g.hit.y - PLATE.y, g.hit.x - PLATE.x);

  // Ball starts near bat barrel contact point (left of batter, mid-zone height)
  const startX = POV_BATTER.x - 50;
  const startY = POV_BATTER.y - 30;

  // Horizontal spread: cos maps left-field→left-screen, right-field→right-screen, fouls→far sides
  const endX = W / 2 + Math.cos(hitAngle) * W * 0.55;
  const endY = POV_PITCHER.y - 60;

  const x = lerp(startX, endX, t);
  const y = lerp(startY, endY, t);
  const r = lerp(14, 2, t);
  if (r > 1) drawBall(ctx, x, y, r);

  if (t >= 1) {
    ctx.fillStyle = '#ff0';
    ctx.font = 'bold 22px system-ui';
    ctx.textAlign = 'center';
    // Clamp label to stay on screen for extreme foul balls
    ctx.fillText(g.hit.type, Math.max(60, Math.min(W - 60, endX)), endY - 20);
    ctx.textAlign = 'left';
  }
}

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
  // Base positions in top-down coords (matching Field.tsx definitions)
  const pvFirst  = projectToPOV(PLATE.x + 140, PLATE.y - 150);  // (540, 320)
  const pvSecond = projectToPOV(PLATE.x,       PLATE.y - 320);  // (400, 150)
  const pvThird  = projectToPOV(PLATE.x - 140, PLATE.y - 150);  // (260, 320)

  // Far ends of foul lines — depth 400 along the 45° diagonals into the outfield
  const pvFoulR = projectToPOV(PLATE.x + 400, PLATE.y - 400);
  const pvFoulL = projectToPOV(PLATE.x - 400, PLATE.y - 400);

  const hpx = W / 2;
  const hpy = PROJ_Y0;  // H - 18 = 542 — home-plate level

  // Foul lines (white chalk)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.80)';
  ctx.lineWidth = 2;
  ctx.setLineDash([]);
  ctx.beginPath();
  ctx.moveTo(hpx + 110, hpy);
  ctx.lineTo(pvFoulR.x, pvFoulR.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(hpx - 110, hpy);
  ctx.lineTo(pvFoulL.x, pvFoulL.y);
  ctx.stroke();

  // Basepaths first↔second and third↔second (dashed white)
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.40)';
  ctx.lineWidth = 1.5;
  ctx.setLineDash([5, 5]);
  ctx.beginPath();
  ctx.moveTo(pvFirst.x,  pvFirst.y);
  ctx.lineTo(pvSecond.x, pvSecond.y);
  ctx.stroke();
  ctx.beginPath();
  ctx.moveTo(pvThird.x,  pvThird.y);
  ctx.lineTo(pvSecond.x, pvSecond.y);
  ctx.stroke();
  ctx.setLineDash([]);

  // Base squares (white, perspective-scaled)
  const drawBase = (pv: { x: number; y: number }, size: number) => {
    ctx.fillStyle = '#fff';
    ctx.fillRect(pv.x - size / 2, pv.y - size / 2, size, size);
    ctx.strokeStyle = 'rgba(180, 180, 180, 0.8)';
    ctx.lineWidth = 1;
    ctx.strokeRect(pv.x - size / 2, pv.y - size / 2, size, size);
  };
  drawBase(pvFirst,  12);
  drawBase(pvSecond,  9);
  drawBase(pvThird,  12);
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

  // Infield grass — extends to screen bottom; foul-territory corners at the near end show grass
  const ifGrass = ctx.createLinearGradient(0, H * 0.43, 0, H * 0.72);
  ifGrass.addColorStop(0, '#4a9a3a');
  ifGrass.addColorStop(1, '#55a544');
  ctx.fillStyle = ifGrass;
  ctx.fillRect(0, H * 0.43, W, H * 0.57);  // full remainder of screen

  // Pitcher's mound — at pitcher's feet, inside infield grass
  const moundY = POV_PITCHER.y + 72;
  ctx.fillStyle = '#a56d2f';
  ctx.beginPath();
  ctx.ellipse(POV_PITCHER.x, moundY, 100, 18, 0, 0, Math.PI * 2);
  ctx.fill();

  // Near dirt — perspective projection of the home-plate dirt circle (baseR ≈ 40 px in
  // top-down, matching Field.tsx) clipped to fair territory between the foul lines.
  {
    const foulDepth = 400;
    const pvFoulR = projectToPOV(PLATE.x + foulDepth, PLATE.y - foulDepth);
    const pvFoulL = projectToPOV(PLATE.x - foulDepth, PLATE.y - foulDepth);
    const DIRT_R  = 15 * (340 / 127.279);  // 15-ft radius ≈ 40 px — same as baseR in Field.tsx
    const dirtTopY = PROJ_Y0 - PROJ_C * DIRT_R / (DIRT_R + PROJ_D); // projected arc apex ≈ 357

    // Clip region: fair-territory cone (home-plate corners → foul far ends) plus full screen bottom
    ctx.save();
    ctx.beginPath();
    ctx.moveTo(W / 2 - 110, PROJ_Y0);   // left home-plate corner
    ctx.lineTo(pvFoulL.x, pvFoulL.y);
    ctx.lineTo(pvFoulR.x, pvFoulR.y);
    ctx.lineTo(W / 2 + 110, PROJ_Y0);   // right home-plate corner
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.clip();

    // Draw the projected forward semicircle of the dirt circle as the top boundary
    const dirtGrad = ctx.createLinearGradient(0, dirtTopY, 0, H);
    dirtGrad.addColorStop(0, '#b87a3c');
    dirtGrad.addColorStop(1, '#8d5a2a');
    ctx.fillStyle = dirtGrad;
    ctx.beginPath();
    for (let i = 0; i <= 32; i++) {
      const phi = (i / 32) * Math.PI;  // phi=0: left side; phi=π/2: apex; phi=π: right side
      const p = projectToPOV(
        PLATE.x - DIRT_R * Math.cos(phi),
        PLATE.y - DIRT_R * Math.sin(phi),
      );
      if (i === 0) ctx.moveTo(p.x, p.y);
      else ctx.lineTo(p.x, p.y);
    }
    ctx.lineTo(W, H);
    ctx.lineTo(0, H);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
  }

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

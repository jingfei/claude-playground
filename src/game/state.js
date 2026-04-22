import { PLATE, ZONE } from './constants.js';

export function lerp(a, b, t) {
  return a + (b - a) * t;
}

export function createGameState() {
  return {
    phase: 'ready', // ready | pitching | result
    ballT: 0,
    ballEnd: null,
    inZone: false,
    swingT: -1,
    hit: null,
    balls: 0,
    strikes: 0,
    result: '',
    resultTimer: 0,
  };
}

export function startPitch(g) {
  const inZone = Math.random() < 0.65;
  let ex;
  let ey;
  if (inZone) {
    ex = ZONE.x + Math.random() * ZONE.w;
    ey = ZONE.y + Math.random() * ZONE.h;
  } else {
    const side = Math.floor(Math.random() * 4);
    if (side === 0) {
      ex = ZONE.x + Math.random() * ZONE.w;
      ey = ZONE.y - 20 - Math.random() * 30;
    } else if (side === 1) {
      ex = ZONE.x + Math.random() * ZONE.w;
      ey = ZONE.y + ZONE.h + 10 + Math.random() * 30;
    } else if (side === 2) {
      ex = ZONE.x - 25 - Math.random() * 30;
      ey = ZONE.y + Math.random() * ZONE.h;
    } else {
      ex = ZONE.x + ZONE.w + 15 + Math.random() * 30;
      ey = ZONE.y + Math.random() * ZONE.h;
    }
  }
  g.ballEnd = { x: ex, y: ey };
  g.inZone = inZone;
  g.phase = 'pitching';
  g.ballT = 0;
  g.swingT = -1;
  g.hit = null;
  g.result = '';
  g.resultTimer = 0;
}

export function swing(g) {
  if (g.phase !== 'pitching' || g.swingT >= 0) return;
  g.swingT = 0;
}

export function resolve(g) {
  const swung = g.swingT >= 0;

  if (swung) {
    const goodTiming = g.swingT > 0.35 && g.swingT < 0.85;

    if (goodTiming && g.inZone) {
      const angle = -Math.PI / 2 + (Math.random() - 0.5) * (Math.PI / 2);
      const dist = 180 + Math.random() * 260;
      const hx = PLATE.x + Math.cos(angle) * dist;
      const hy = PLATE.y + Math.sin(angle) * dist;

      let type = 'SINGLE';
      const r = Math.random();
      if (dist > 380) type = 'HOME RUN!';
      else if (r > 0.85) type = 'TRIPLE';
      else if (r > 0.55) type = 'DOUBLE';
      g.hit = { x: hx, y: hy, type, t: 0 };
      g.result = 'HIT!';
      g.balls = 0;
      g.strikes = 0;
    } else if (Math.random() < 0.25 && g.inZone) {
      const side = Math.random() < 0.5 ? -1 : 1;
      const hx = PLATE.x + side * (180 + Math.random() * 120);
      const hy = PLATE.y - (60 + Math.random() * 180);
      g.hit = { x: hx, y: hy, type: 'FOUL', t: 0 };
      g.result = 'FOUL!';
      if (g.strikes < 2) g.strikes++;
    } else {
      g.result = 'MISS!';
      g.strikes++;
    }
  } else if (g.inZone) {
    g.result = 'STRIKE!';
    g.strikes++;
  } else {
    g.result = 'BALL!';
    g.balls++;
  }

  if (g.strikes >= 3) {
    g.result = 'STRIKEOUT';
    g.strikes = 0;
    g.balls = 0;
  } else if (g.balls >= 4) {
    g.result = 'WALK';
    g.strikes = 0;
    g.balls = 0;
  }

  g.resultTimer = 90;
  g.phase = 'result';
}

export const W = 800;
export const H = 560;

// Diamond: 90-ft square rotated 45°, home-to-second = 340px
export const PLATE   = { x: 400, y: 470 };
export const PITCHER = { x: 400, y: 328 }; // 60.5ft from rear vertex of home plate
export const BATTER  = { x: 445, y: 477 }; // center of right batter's box
export const ZONE    = { x: 365, y: 410, w: 70, h: 60 };
export const OUTFIELD = { rx: 520, ry: 430 };

// Base positions (top-down coordinates, same system as PLATE/PITCHER)
export const VERTEX = { x: PLATE.x,       y: PLATE.y + 20  };  // home plate back vertex; foul lines origin
export const FIRST  = { x: PLATE.x + 140, y: PLATE.y - 150 };  // (540, 320)
export const SECOND = { x: PLATE.x,       y: PLATE.y - 320 };  // (400, 150)
export const THIRD  = { x: PLATE.x - 140, y: PLATE.y - 150 };  // (260, 320)

// Base size: 18″ square rotated 45° in field scale (340px = 127.279ft).
// BASE_R is the half-diagonal — distance from center to any corner of the rotated square.
export const BASE_R = 21 * Math.SQRT2;  // ≈ 30px  (matches `br` in Field.tsx)

// Field colors — single source of truth for both top-down and batter views
export const COLOR_GRASS = '#4a9a3a';  // fair-territory / foul-territory grass
export const COLOR_DIRT  = '#c68a4a';  // infield dirt
export const COLOR_MOUND = '#b57a3a';  // pitcher's mound (slightly darker dirt)

// 95-ft infield arc centered on the pitcher's mound, bounded by the two foul lines.
// Geometry mirrors drawField() in Field.tsx exactly.
const _SCALE   = 340 / 127.279;
const _arcR    = 95 * _SCALE;
const _foulSum = VERTEX.x + VERTEX.y;                           // 890
const _fmpy    = _foulSum - PITCHER.x - PITCHER.y;              // 162
const _chord   = Math.sqrt(2 * _arcR * _arcR - _fmpy * _fmpy);
const _uR      = (_fmpy + _chord) / 2;
const _arcRX   = PITCHER.x + _uR;
const _arcRY   = _foulSum - _arcRX;                             // right foul-line endpoint
const _arcLX   = 2 * PITCHER.x - _arcRX;                       // left foul-line endpoint (symmetric)
export const INFIELD_ARC = {
  r:      _arcR,
  cx:     PITCHER.x,
  cy:     PITCHER.y,
  angR:   Math.atan2(_arcRY - PITCHER.y, _arcRX - PITCHER.x),  // angle to right endpoint
  angL:   Math.atan2(_arcRY - PITCHER.y, _arcLX - PITCHER.x),  // angle to left endpoint
  rightX: _arcRX,  // right foul-line intersection (used as arc start in Field.tsx)
  rightY: _arcRY,
};

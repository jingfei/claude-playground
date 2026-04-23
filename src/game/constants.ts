export const W = 800;
export const H = 560;

// Diamond: 90-ft square rotated 45°, home-to-second = 340px
// Side length s = 340/√2 ≈ 240px  →  s/√2 ≈ 170px
// First/Third base: (±170, -170) from PLATE
// Second base:      (  0, -340) from PLATE
export const PLATE   = { x: 400, y: 470 };
export const PITCHER = { x: 400, y: 328 }; // 60.5ft from rear vertex of home plate: VERTEX.y(490) − 162px
export const BATTER  = { x: 445, y: 477 }; // center of right batter's box
export const ZONE     = { x: 365, y: 410, w: 70, h: 60 };
export const OUTFIELD = { rx: 520, ry: 430 }; // outfield grass ellipse semi-axes from PLATE

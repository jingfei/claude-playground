export type GamePhase = 'ready' | 'pitching' | 'result';

export interface BallTarget {
  x: number;
  y: number;
}

export interface HitInfo {
  x: number;
  y: number;
  type: string;
  t: number;
}

export interface GameState {
  phase: GamePhase;
  ballT: number;
  ballEnd: BallTarget | null;
  inZone: boolean;
  swingT: number;
  hit: HitInfo | null;
  balls: number;
  strikes: number;
  result: string;
  resultTimer: number;
}

export interface DrawHandle {
  draw: (g: GameState) => void;
}

import { useEffect, useRef, useState } from 'react';
import Field from './Field.jsx';
import Pitcher from './Pitcher.jsx';
import Batter from './Batter.jsx';
import Ball from './Ball.jsx';
import Scoreboard from './Scoreboard.jsx';
import ResultBanner from './ResultBanner.jsx';
import { W, H } from '../game/constants.js';
import { createGameState, startPitch, swing, resolve } from '../game/state.js';

export default function BaseballGame() {
  const gameRef = useRef(createGameState());
  const pitcherRef = useRef(null);
  const batterRef = useRef(null);
  const ballRef = useRef(null);

  const [balls, setBalls] = useState(0);
  const [strikes, setStrikes] = useState(0);
  const [phase, setPhase] = useState('ready');
  const [resultText, setResultText] = useState('');
  const [resultAlpha, setResultAlpha] = useState(0);

  useEffect(() => {
    const g = gameRef.current;
    let rafId;

    const tick = () => {
      if (g.phase === 'pitching') {
        g.ballT += 0.018;
        if (g.swingT >= 0) g.swingT += 0.05;
        if (g.ballT >= 1) {
          g.ballT = 1;
          resolve(g);
          setBalls(g.balls);
          setStrikes(g.strikes);
          setResultText(g.result);
          setPhase(g.phase);
        }
      } else if (g.phase === 'result') {
        if (g.resultTimer > 0) g.resultTimer--;
        if (g.hit) g.hit.t = Math.min(1, g.hit.t + 0.022);
      }
      setResultAlpha(g.resultTimer > 0 ? Math.min(1, g.resultTimer / 30) : 0);

      pitcherRef.current?.draw(g);
      batterRef.current?.draw(g);
      ballRef.current?.draw(g);

      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    const canStartNext = () =>
      g.phase === 'ready' || (g.phase === 'result' && g.resultTimer < 30);
    const doStart = () => {
      startPitch(g);
      setPhase(g.phase);
      setResultText('');
    };
    const onKey = (e) => {
      if (e.code === 'Space') {
        e.preventDefault();
        if (g.phase === 'pitching') swing(g);
        else if (canStartNext()) doStart();
      } else if (canStartNext()) {
        doStart();
      }
    };

    window.addEventListener('keydown', onKey);
    return () => {
      cancelAnimationFrame(rafId);
      window.removeEventListener('keydown', onKey);
    };
  }, []);

  const onClick = () => {
    const g = gameRef.current;
    if (g.phase === 'pitching') {
      swing(g);
    } else if (g.phase === 'ready' || (g.phase === 'result' && g.resultTimer < 30)) {
      startPitch(g);
      setPhase(g.phase);
      setResultText('');
    }
  };

  return (
    <div
      onClick={onClick}
      className="relative rounded-lg overflow-hidden border-2 border-neutral-700 shadow-2xl shadow-black/50 cursor-pointer"
      style={{ width: W, height: H }}
    >
      <Field />
      <Ball ref={ballRef} />
      <Pitcher ref={pitcherRef} />
      <Batter ref={batterRef} />
      <Scoreboard balls={balls} strikes={strikes} />
      <ResultBanner text={resultText} alpha={resultAlpha} />
      {phase === 'ready' && (
        <div className="absolute inset-x-0 bottom-4 flex items-center justify-center pointer-events-none">
          <div className="px-4 py-2 rounded-full bg-black/70 text-sm text-neutral-200 border border-neutral-700">
            Press any key to pitch
          </div>
        </div>
      )}
    </div>
  );
}

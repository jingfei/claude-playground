import BaseballGame from './components/BaseballGame.jsx';

export default function App() {
  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 flex flex-col items-center justify-center p-6">
      <h1 className="text-2xl font-semibold mb-4 tracking-wide">⚾ Baseball</h1>
      <BaseballGame />
      <p className="mt-3 text-sm text-neutral-400">
        Press <kbd className="px-1.5 py-0.5 rounded bg-neutral-800 border border-neutral-700 text-xs">SPACE</kbd> to swing ·
        any other key for next pitch
      </p>
    </div>
  );
}

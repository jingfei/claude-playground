export default function Scoreboard({ balls, strikes }) {
  return (
    <div className="absolute top-3 left-3 px-4 py-3 rounded-md bg-black/75 border border-neutral-700 backdrop-blur-sm pointer-events-none">
      <div className="text-xs font-bold tracking-widest text-neutral-300 mb-2">
        COUNT
      </div>
      <Row label="B" filled={balls} total={4} color="green" />
      <Row label="S" filled={strikes} total={3} color="red" />
    </div>
  );
}

function Row({ label, filled, total, color }) {
  const onStyles =
    color === 'green'
      ? 'bg-green-500 border-green-400 shadow-[0_0_6px_rgba(34,197,94,0.6)]'
      : 'bg-red-500 border-red-400 shadow-[0_0_6px_rgba(239,68,68,0.6)]';
  return (
    <div className="flex items-center gap-2 mb-1.5 last:mb-0">
      <span className="text-xs text-neutral-400 w-4">{label}</span>
      {Array.from({ length: total }).map((_, i) => (
        <span
          key={i}
          className={`w-3.5 h-3.5 rounded-full border ${
            i < filled ? onStyles : 'bg-neutral-800 border-neutral-600'
          }`}
        />
      ))}
    </div>
  );
}

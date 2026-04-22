const RESULT_COLORS = {
  'STRIKE!': 'text-red-400',
  'BALL!': 'text-green-400',
  'HIT!': 'text-yellow-300',
  'FOUL!': 'text-orange-400',
  'MISS!': 'text-red-300',
  STRIKEOUT: 'text-red-500',
  WALK: 'text-green-400',
};

export default function ResultBanner({ text, alpha }) {
  if (!text || alpha <= 0) return null;
  const color = RESULT_COLORS[text] ?? 'text-white';
  return (
    <div
      className="absolute inset-x-0 top-1/3 flex items-center justify-center pointer-events-none"
      style={{ opacity: alpha }}
    >
      <div
        className={`text-6xl font-black tracking-wider drop-shadow-[0_4px_6px_rgba(0,0,0,0.8)] ${color}`}
      >
        {text}
      </div>
    </div>
  );
}

// Friendly illustrated avatars (inline SVG, no photographs). Ids: f1-f6 (Female), m1-m6 (Male).

type Cfg = { skin: string; hair: string; bg: string; shirt: string; style: string };

const CONFIG: Record<string, Cfg> = {
  f1: { skin: '#8D5524', hair: '#231F20', bg: '#F6D7D9', shirt: '#921B21', style: 'long' },
  f2: { skin: '#C68642', hair: '#3B2314', bg: '#DCEBF5', shirt: '#2F6C8F', style: 'bun' },
  f3: { skin: '#6F4220', hair: '#231F20', bg: '#FBE8C8', shirt: '#B7791F', style: 'puff' },
  f4: { skin: '#A8693A', hair: '#231F20', bg: '#E1F0DE', shirt: '#3F7D4E', style: 'braids' },
  f5: { skin: '#E0AC69', hair: '#5A3A22', bg: '#EADFF5', shirt: '#6B4C9A', style: 'bob' },
  f6: { skin: '#5C3317', hair: '#231F20', bg: '#FDE1D3', shirt: '#C2410C', style: 'curly' },
  m1: { skin: '#8D5524', hair: '#231F20', bg: '#DCEBF5', shirt: '#2F6C8F', style: 'short' },
  m2: { skin: '#5C3317', hair: '#231F20', bg: '#FBE8C8', shirt: '#B7791F', style: 'afro' },
  m3: { skin: '#C68642', hair: '#3B2314', bg: '#E1F0DE', shirt: '#3F7D4E', style: 'fade' },
  m4: { skin: '#A8693A', hair: '#231F20', bg: '#F6D7D9', shirt: '#921B21', style: 'cap' },
  m5: { skin: '#6F4220', hair: '#231F20', bg: '#EADFF5', shirt: '#6B4C9A', style: 'beard' },
  m6: { skin: '#E0AC69', hair: '#231F20', bg: '#FDE1D3', shirt: '#C2410C', style: 'locs' },
};

export const AVATARS = {
  Female: ['f1', 'f2', 'f3', 'f4', 'f5', 'f6'],
  Male: ['m1', 'm2', 'm3', 'm4', 'm5', 'm6'],
} as const;

function HairBack({ style, c }: { style: string; c: string }) {
  switch (style) {
    case 'long':
      return <path d="M30 46C28 18 72 18 70 46L73 84L27 84Z" fill={c} />;
    case 'bun':
      return <circle cx="50" cy="20" r="9" fill={c} />;
    case 'puff':
      return <circle cx="50" cy="36" r="26" fill={c} />;
    case 'braids':
      return (
        <g fill={c}>
          <rect x="27" y="44" width="6" height="36" rx="3" />
          <rect x="67" y="44" width="6" height="36" rx="3" />
        </g>
      );
    case 'bob':
      return <path d="M29 50C26 16 74 16 71 50L71 62L29 62Z" fill={c} />;
    case 'curly':
      return (
        <g fill={c}>
          <circle cx="34" cy="34" r="10" />
          <circle cx="50" cy="26" r="12" />
          <circle cx="66" cy="34" r="10" />
          <circle cx="30" cy="48" r="7" />
          <circle cx="70" cy="48" r="7" />
        </g>
      );
    case 'afro':
      return <circle cx="50" cy="34" r="25" fill={c} />;
    case 'locs':
      return (
        <g fill={c}>
          <rect x="28" y="32" width="6" height="40" rx="3" />
          <rect x="35" y="28" width="6" height="40" rx="3" />
          <rect x="59" y="28" width="6" height="40" rx="3" />
          <rect x="66" y="32" width="6" height="40" rx="3" />
        </g>
      );
    default:
      return null;
  }
}

function HairFront({ style, c }: { style: string; c: string }) {
  const fringe = <path d="M31 44C31 22 69 22 69 44C60 33 40 33 31 44Z" fill={c} />;
  switch (style) {
    case 'long':
    case 'bun':
    case 'braids':
    case 'bob':
    case 'short':
    case 'beard':
    case 'locs':
      return fringe;
    case 'fade':
      return <path d="M32 40C32 26 68 26 68 40C60 34 40 34 32 40Z" fill={c} />;
    case 'cap':
      return (
        <g>
          <path d="M30 40C30 18 70 18 70 40Z" fill="#231F20" />
          <path d="M30 39L76 39L76 44L30 44Z" fill="#231F20" />
        </g>
      );
    default:
      return null;
  }
}

export function Avatar({ id, size = 64, className = '' }: { id: string; size?: number; className?: string }) {
  const cfg = CONFIG[id];
  if (!cfg) return null;
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={`rounded-full ${className}`}
      role="img"
      aria-label={`Avatar ${id}`}
    >
      <circle cx="50" cy="50" r="50" fill={cfg.bg} />
      <clipPath id={`clip-${id}-${size}`}>
        <circle cx="50" cy="50" r="50" />
      </clipPath>
      <g clipPath={`url(#clip-${id}-${size})`}>
        <HairBack style={cfg.style} c={cfg.hair} />
        <path d="M18 104C18 80 34 73 50 73C66 73 82 80 82 104Z" fill={cfg.shirt} />
        <rect x="44" y="60" width="12" height="16" rx="4" fill={cfg.skin} />
        <ellipse cx="50" cy="46" rx="18" ry="21" fill={cfg.skin} />
        {cfg.style === 'beard' && <path d="M33 52C34 72 66 72 67 52C60 61 40 61 33 52Z" fill={cfg.hair} />}
        <HairFront style={cfg.style} c={cfg.hair} />
        <circle cx="42" cy="48" r="2.2" fill="#231F20" />
        <circle cx="58" cy="48" r="2.2" fill="#231F20" />
        <path d="M43 57Q50 63 57 57" stroke="#231F20" strokeWidth="2" fill="none" strokeLinecap="round" />
      </g>
    </svg>
  );
}

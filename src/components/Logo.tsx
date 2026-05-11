import { activeClient } from '@/config/clients';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showMark?: boolean;
}

export function Logo({ size = 'md', showMark = true }: LogoProps) {
  const sizes = {
    sm: { mark: 24, text: 'text-base' },
    md: { mark: 32, text: 'text-lg' },
    lg: { mark: 44, text: 'text-2xl' },
  } as const;
  const s = sizes[size];

  return (
    <div className="flex items-center gap-2">
      {showMark && <LatchedMark size={s.mark} />}
      <div className="flex items-baseline gap-1.5">
        <span className={`font-display ${s.text} leading-none text-primary`}>
          {activeClient.brand.logoText.latched}
        </span>
        <span className={`${s.text} font-medium leading-none text-foreground`}>
          {activeClient.brand.logoText.beginnings}
        </span>
      </div>
    </div>
  );
}

function LatchedMark({ size }: { size: number }) {
  // Stylized heart + parent/child mark inspired by the LB logo.
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden
    >
      <path
        d="M14 24c0-7 5-13 12-13 4 0 7 2 9 5 1-1 2-2 4-2 5 0 9 4 9 9 0 11-14 21-22 28C18 44 14 35 14 24z"
        stroke="currentColor"
        strokeWidth="3.5"
        strokeLinejoin="round"
        className="text-primary"
        fill="none"
      />
      <circle cx="29" cy="20" r="3.5" stroke="currentColor" strokeWidth="2.5" className="text-primary" fill="none" />
      <circle cx="32" cy="33" r="5" stroke="currentColor" strokeWidth="2.5" className="text-primary" fill="none" />
    </svg>
  );
}

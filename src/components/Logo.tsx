import { useTheme } from '@/lib/store/theme';
import { activeClient } from '@/config/clients';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
}

const HEIGHTS = { sm: 28, md: 36, lg: 56 } as const;

export function Logo({ size = 'md' }: LogoProps) {
  const { theme } = useTheme();
  const src = theme === 'dark' ? '/latched-logo-white.png' : '/latched-logo.png';

  return (
    <img
      src={src}
      alt={activeClient.name}
      height={HEIGHTS[size]}
      style={{ height: HEIGHTS[size], width: 'auto' }}
      className="select-none"
      draggable={false}
    />
  );
}

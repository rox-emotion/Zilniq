import { useMemo } from 'react';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { palettes, type ColorPalette } from '@/constants/colors';

export function useColors(): ColorPalette {
  const scheme = useColorScheme() ?? 'light';
  return useMemo(() => palettes[scheme], [scheme]);
}

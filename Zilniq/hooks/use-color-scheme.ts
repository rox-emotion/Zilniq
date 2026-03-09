import { useTheme } from '@/providers/ThemeProvider';

export function useColorScheme() {
  return useTheme().resolvedScheme;
}

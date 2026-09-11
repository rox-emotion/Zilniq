import { queryClient } from '@/api/queryClient';
import { focusManager, QueryClientProvider } from '@tanstack/react-query';
import { useEffect } from 'react';
import { AppState, type AppStateStatus, Platform } from 'react-native';

interface QueryProviderProps {
  children: React.ReactNode;
}

// Bridge React Native's foreground/background state into React Query so queries
// that opt into `refetchOnWindowFocus` refresh when the app comes back to the
// foreground. Queries keep `refetchOnWindowFocus: false` by default (see
// api/queryClient.ts) — only opted-in queries react to this.
function onAppStateChange(status: AppStateStatus) {
  if (Platform.OS !== 'web') {
    focusManager.setFocused(status === 'active');
  }
}

export function QueryProvider({ children }: QueryProviderProps) {
  useEffect(() => {
    const subscription = AppState.addEventListener('change', onAppStateChange);
    return () => subscription.remove();
  }, []);

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}

import { usePathname } from 'expo-router';
import { useEffect, useRef } from 'react';

import { logScreen } from '@/utils/analytics';

/**
 * Logs a Firebase `screen_view` event whenever the active expo-router path
 * changes. Mount once, near the root of the app.
 */
export function useScreenTracking() {
  const pathname = usePathname();
  const previous = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname || pathname === previous.current) return;
    previous.current = pathname;
    logScreen(pathname);
  }, [pathname]);
}

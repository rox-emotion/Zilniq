import * as SecureStore from 'expo-secure-store';
import { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';

type ThemeOverride = 'light' | 'dark' | null;
type ColorScheme = 'light' | 'dark';

interface ThemeContextValue {
  override: ThemeOverride;
  setOverride: (value: ThemeOverride) => void;
  resolvedScheme: ColorScheme;
}

const STORE_KEY = 'theme_override';

export const ThemeContext = createContext<ThemeContextValue>({
  override: null,
  setOverride: () => {},
  resolvedScheme: 'light',
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemScheme = useNativeColorScheme() ?? 'light';
  const [override, setOverrideState] = useState<ThemeOverride>(null);

  useEffect(() => {
    SecureStore.getItemAsync(STORE_KEY).then((value) => {
      if (value === 'light' || value === 'dark') {
        setOverrideState(value);
      }
    });
  }, []);

  const setOverride = (value: ThemeOverride) => {
    setOverrideState(value);
    if (value === null) {
      SecureStore.deleteItemAsync(STORE_KEY);
    } else {
      SecureStore.setItemAsync(STORE_KEY, value);
    }
  };

  const resolvedScheme: ColorScheme = override ?? systemScheme;

  return (
    <ThemeContext.Provider value={{ override, setOverride, resolvedScheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

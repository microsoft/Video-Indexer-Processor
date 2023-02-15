import { IPartialTheme, ThemeProvider as FluentUiThemProvider } from '@fluentui/react';
import { createContext, Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { useLocalStorage } from '../hooks/useStorage';
import * as themes from '../theme';

// create an empty context
export const ThemeContext = createContext<[string, Dispatch<SetStateAction<string>>]>(['', () => {}]);

// context provider container
export const ThemeProvider = ({ value, children }: { value?: string; children: JSX.Element | JSX.Element[] }) => {
  const [theme, setTheme] = useLocalStorage('theme', () => value || 'lightTheme');

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const contextTheme = useMemo<[string, Dispatch<SetStateAction<string>>]>(() => [theme, setTheme], [theme]);

  const getPartialTheme = useCallback((theme: string): IPartialTheme => {
    switch (theme) {
      case 'darkTheme':
        return themes.darkTheme;
      default:
        return themes.lightTheme;
    }
  }, []);

  return (
    <ThemeContext.Provider value={contextTheme}>
      <FluentUiThemProvider theme={getPartialTheme(theme)} applyTo="body">
        {children}
      </FluentUiThemProvider>
    </ThemeContext.Provider>
  );
};

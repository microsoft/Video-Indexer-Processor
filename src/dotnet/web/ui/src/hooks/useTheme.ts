import { ThemeContext } from '../providers/themeProvider';
import { useContext } from 'react';

// custom context hook
export const useTheme = () => useContext(ThemeContext);

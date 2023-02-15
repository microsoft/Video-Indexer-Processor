import { act, renderHook } from '@testing-library/react-hooks/dom';
import { useTheme } from '../../hooks/useTheme';
import { ThemeProvider } from '../../providers/themeProvider';

describe('useTheme tests', () => {
  test('should returns an default theme value from theme context', async () => {
    const wrapper = ({ children }) => {
      return <ThemeProvider value="lightTheme">{children}</ThemeProvider>;
    };

    const { result } = renderHook(() => useTheme(), { wrapper });

    const [theme] = result.current;

    expect(theme).toBe('lightTheme');
  });

  test('should returns an correct updated value from the theme context', async () => {
    const wrapper = ({ children }) => {
      return <ThemeProvider value="lightTheme">{children}</ThemeProvider>;
    };

    const { result, rerender } = renderHook(() => useTheme(), { wrapper });

    act(() => {
      const [, setTheme] = result.current;
      setTheme('darkTheme');
    });

    rerender();

    const [theme] = result.current;

    expect(theme).toBe('darkTheme');
  });
});

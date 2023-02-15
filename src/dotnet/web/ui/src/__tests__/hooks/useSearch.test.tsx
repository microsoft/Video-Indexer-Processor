import { act, renderHook } from '@testing-library/react-hooks/dom';
import { useSearch } from '../../hooks/useSearch';
import { SearchProvider } from '../../providers/searchProvider';
import { SearchContextType, SearchMode, SearchType, SEARCH_CRITERIA_DEFAULTS } from '../../types';

describe('useSearch tests', () => {
  test('should returns a default search value from context', async () => {
    const wrapper = ({ children }) => {
      return <SearchProvider>{children}</SearchProvider>;
    };

    const { result } = renderHook(() => useSearch(), { wrapper });

    const expected: SearchContextType = {
      searchId: SEARCH_CRITERIA_DEFAULTS.SEARCH_ID,
      searchText: SEARCH_CRITERIA_DEFAULTS.SEARCH_TEXT,
      size: SEARCH_CRITERIA_DEFAULTS.SIZE,
      page: SEARCH_CRITERIA_DEFAULTS.PAGE,
      searchMode: SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE,
      searchType: SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE,
    };
    const [search] = result.current;

    expect(search).toStrictEqual<SearchContextType>(expected);
  });

  test('should returns an correct value from the search context', async () => {
    const wrapper = ({ children }) => {
      return <SearchProvider>{children}</SearchProvider>;
    };

    const { result, rerender } = renderHook(() => useSearch(), { wrapper });

    const expected: SearchContextType = {
      searchId: 'id',
      searchText: 'test',
      size: 100,
      page: 1,
      searchMode: SearchMode.ALL,
      searchType: SearchType.FUZZY,
    };

    act(() => {
      const [, setSearch] = result.current;
      setSearch(expected);
    });

    rerender();

    const [search] = result.current;

    expect(search).toStrictEqual<SearchContextType>(expected);
  });
});

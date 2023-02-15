import { createContext, Dispatch, SetStateAction, useMemo } from 'react';
import { useSessionStorage } from '../hooks/useStorage';
import { SearchContextType, SEARCH_CRITERIA_DEFAULTS } from '../types';

// create an empty context
export const SearchContext = createContext<[SearchContextType, Dispatch<SetStateAction<SearchContextType>>]>([null, () => {}]);

// context provider container
export const SearchProvider = ({ children }: { value?: SearchContextType; children: JSX.Element | JSX.Element[] }) => {
  const [search, setSearch] = useSessionStorage<SearchContextType>('search', {
    searchId: SEARCH_CRITERIA_DEFAULTS.SEARCH_ID,
    searchText: SEARCH_CRITERIA_DEFAULTS.SEARCH_TEXT,
    size: SEARCH_CRITERIA_DEFAULTS.SIZE,
    searchType: SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE,
    searchMode: SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE,
    page: SEARCH_CRITERIA_DEFAULTS.PAGE,
  });

  const [contextSearch, setContextSearch] = useMemo<[SearchContextType, Dispatch<SetStateAction<SearchContextType>>]>(
    () => [search, setSearch],
    [search, setSearch],
  );

  return <SearchContext.Provider value={[contextSearch, setContextSearch]}>{children}</SearchContext.Provider>;
};

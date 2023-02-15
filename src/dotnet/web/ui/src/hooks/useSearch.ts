import { useContext } from 'react';
import { SearchContext } from '../providers/searchProvider';

// custom context hook
export const useSearch = () => useContext(SearchContext);

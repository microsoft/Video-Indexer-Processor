import { SearchMode } from './SearchMode';
import { SearchType } from './SearchType';

export type QuerySearchParams = {
  searchText?: string;
  size?: number;
  page?: number;
  searchType?: SearchType;
  searchMode?: SearchMode;
  time?: string;
};

export type SearchContextType = {
  searchId: string;
} & QuerySearchParams;

export const SEARCH_CRITERIA_DEFAULTS = {
  SEARCH_ID: '',
  SEARCH_TEXT: '',
  SIZE: 50,
  PAGE: 1,
  SEARCH_MODE: SearchMode.ANY,
  SEARCH_TYPE: SearchType.EXACT,
  TIME: 'n',
};

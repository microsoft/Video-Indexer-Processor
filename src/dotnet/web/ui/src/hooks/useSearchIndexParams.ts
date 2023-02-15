import { useLayoutEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { parseUrlParamNumber } from '../helpers';
import { QuerySearchParams, SearchMode, SearchType, SEARCH_CRITERIA_DEFAULTS } from '../types';

export type SetQuerySearchParams = (nextInit: QuerySearchParams, navigateOptions?: { replace?: boolean | undefined; state?: any } | undefined) => void;

export const useSearchIndexParams = (): [QuerySearchParams, SetQuerySearchParams] => {
  const [searchParams, setSearchParams] = useSearchParams();

  const [qsp, setQsp] = useState<QuerySearchParams>({
    page: SEARCH_CRITERIA_DEFAULTS.PAGE,
    searchMode: SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE,
    searchText: SEARCH_CRITERIA_DEFAULTS.SEARCH_TEXT,
    searchType: SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE,
    size: SEARCH_CRITERIA_DEFAULTS.SIZE,
    time: SEARCH_CRITERIA_DEFAULTS.TIME,
  });

  useLayoutEffect(() => {
    let q = searchParams.get('q') ?? SEARCH_CRITERIA_DEFAULTS.SEARCH_TEXT;
    // size
    let s = parseUrlParamNumber(searchParams, 's', SEARCH_CRITERIA_DEFAULTS.SIZE);
    // page number
    let p = parseUrlParamNumber(searchParams, 'p', 1);
    // search mode
    let sm: SearchMode = (searchParams.get('sm')?.toUpperCase() as SearchMode) ?? SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE;
    // search type
    let st: SearchType = (searchParams.get('st')?.toUpperCase() as SearchType) ?? SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE;
    // time
    let t = searchParams.get('t') ?? SEARCH_CRITERIA_DEFAULTS.TIME;

    let qsp: QuerySearchParams = {
      searchText: q,
      page: p,
      size: s,
      searchMode: sm,
      searchType: st,
      time: t,
    };
    setQsp(qsp);
  }, [searchParams, setQsp]);

  let setSearchIndexParams: SetQuerySearchParams = (qspPart, navigateOptions) => {
    setQsp((prev) => {
      // merge objects... love javascript... sometimes... don't say it.
      let newQsp = { ...prev, ...qspPart };

      let newSearchParams = new URLSearchParams([
        ['q', newQsp.searchText],
        ['s', newQsp.size.toString()],
        ['p', newQsp.page.toString()],
        ['sm', newQsp.searchMode.toLowerCase()],
        ['st', newQsp.searchType.toLowerCase()],
        ['t', newQsp.time],
      ]);
      setSearchParams(newSearchParams, navigateOptions);
      return newQsp;
    });
  };

  return [qsp, setSearchIndexParams];
};

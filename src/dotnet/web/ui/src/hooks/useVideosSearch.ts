import { UseQueryResult } from 'react-query';
import { Filter, SelectFields } from '../types';
import { Result, SearchResult } from '../types/VideoIndex';
import { useApi } from './useApi';
import { useApiAccessToken } from './useApiAccessToken';
import { useSearchIndexParams } from './useSearchIndexParams';
import dayjs from 'dayjs';

/**
 * Get a video search result based on query params
 *
 */
export const useVideosSearch = (filters: Filter[]): { videosSearch: SearchResult & UseQueryResult<any, any> } => {
  const { apiAccessToken } = useApiAccessToken();
  const [searchIndexParams] = useSearchIndexParams();
  let tmpStartDate: string;

  if (searchIndexParams.time && searchIndexParams.time.split('-').length === 2) {
    let pValue = +searchIndexParams.time.split('-')[1];
    let pInterval = searchIndexParams.time.split('-')[0];

    switch (pInterval) {
      case 'm':
        tmpStartDate = dayjs().subtract(pValue, 'minutes').startOf('minute').toJSON();
        break;
      case 'h':
        tmpStartDate = dayjs().subtract(pValue, 'hours').startOf('hour').toJSON();
        break;
      case 'd':
        tmpStartDate = dayjs().subtract(pValue, 'days').startOf('day').toJSON();
        break;
      case 'w':
        tmpStartDate = dayjs().subtract(pValue, 'weeks').startOf('week').toJSON();
        break;
      case 't':
        tmpStartDate = dayjs().subtract(pValue, 'months').startOf('month').toJSON();
        break;
      case 'y':
        tmpStartDate = dayjs().subtract(pValue, 'years').startOf('year').toJSON();
        break;
      default:
        tmpStartDate = null;
        break;
    }
  }

  // body expected by web api
  let searchCriteria = {
    searchText: searchIndexParams.searchText,
    searchMode: searchIndexParams.searchMode,
    searchType: searchIndexParams.searchType,
    size: searchIndexParams.size,
    skip: searchIndexParams.size * (searchIndexParams.page - 1),
    select: SelectFields,
    filters: filters,
    startDate: tmpStartDate,
  };

  let body = JSON.stringify(searchCriteria);

  let enabled = !!(
    searchIndexParams &&
    searchIndexParams.searchText &&
    searchIndexParams.searchText.trim() !== '' &&
    searchIndexParams.size > 0 &&
    apiAccessToken
  );

  const response = useApi({
    accessToken: apiAccessToken,
    url: `${process.env.REACT_APP_API_ROOT_URI}/api/Search`,
    method: 'POST',
    body,
    key: body,
    enabled: enabled,
  });

  var res = {
    get results(): Result[] {
      return response?.data?.results;
    },
    get facets(): any {
      return response?.data?.facets;
    },
    get count(): number {
      return response?.data?.count;
    },
    ...response,
  };
  return { videosSearch: res };
};

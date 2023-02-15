import { UseQueryResult } from 'react-query';
import { useApi } from './useApi';
import { useApiAccessToken } from './useApiAccessToken';

/**
 * Get the dashboard url
 *
 */
export const useDashboard = (): { url: string } & UseQueryResult<any, any> => {
  const { apiAccessToken } = useApiAccessToken();

  const response = useApi({
    accessToken: apiAccessToken,
    url: `${process.env.REACT_APP_API_ROOT_URI}/api/Dashboard`,
    method: 'GET',
    body: null,
    key: 'dashboard',
    enabled: !!apiAccessToken,
  });

  return {
    get url() {
      return response.data;
    },
    ...response,
  };
};

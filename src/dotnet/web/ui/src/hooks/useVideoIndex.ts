import { UseQueryResult } from 'react-query';
import { useApi } from './useApi';

/**
 * Get the video index, with all insights
 *
 * @param {string} accessToken access token to be used in header.
 * @param {string} videoId Video Id from Video Indexer
 */
export const useVideoIndex = (accessToken: string, videoId: string): { index: any } & UseQueryResult<any, any> => {
  const response = useApi({
    accessToken,
    url: `${process.env.REACT_APP_API_ROOT_URI}/api/Videos/${videoId}/index`,
    method: 'GET',
    body: null,
    key: videoId,
    enabled: !!(videoId && accessToken),
  });

  return {
    get index() {
      return response.data;
    },
    ...response,
  };
};

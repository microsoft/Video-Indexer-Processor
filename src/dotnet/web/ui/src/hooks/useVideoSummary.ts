import { UseQueryResult } from 'react-query';
import { useApi } from './useApi';

/**
 * Get the video summary, without all insights, way much lighter
 *
 * @param {string} accessToken access token to be used in header.
 * @param {string} videoId Video Id from Video Indexer
 */
export const useVideoSummary = (accessToken: string, videoId: string): { summary: any } & UseQueryResult<any, any> => {
  const response = useApi({
    accessToken,
    url: `${process.env.REACT_APP_API_ROOT_URI}/api/Videos/${videoId}/summary`,
    method: 'GET',
    body: null,
    key: videoId,
    enabled: !!(videoId && accessToken),
  });
  return {
    get summary() {
      return response.data;
    },
    ...response,
  };
};

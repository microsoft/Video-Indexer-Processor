import { UseQueryResult } from 'react-query';
import { useApi } from './useApi';

/**
 * Get a video streaming config containing url & jwt
 *
 * @param {string} accessToken access token to be used in header.
 * @param {string} videoId Video Id coming from Video Indexer
 */
export const useVideoStreamingConfig = (accessToken: string, videoId: string): { url: string; jwt: string } & UseQueryResult<any, any> => {
  // call the api
  const response = useApi({
    accessToken,
    url: `${process.env.REACT_APP_API_ROOT_URI}/api/Videos/${videoId}/streamingurl`,
    method: 'GET',
    body: null,
    key: videoId,
    enabled: !!(videoId && accessToken),
  });

  // return restructured object
  return {
    get url(): string {
      return response.data ? response.data.url : undefined;
    },
    get jwt(): string {
      return response.data ? response.data.jwt : undefined;
    },
    ...response,
  };
};

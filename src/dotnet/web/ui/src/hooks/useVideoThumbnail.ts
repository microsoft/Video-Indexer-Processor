import { UseQueryResult } from 'react-query';
import { ApiRequestReturnType } from '../types';
import { useApi } from './useApi';

/**
 * Get a video thumbnail url, to use within an Image component
 *
 * @param {string} accessToken access token to be used in header.
 * @param {string} videoId Video Id from Video Indexer
 */
export const useVideoThumbnail = (accessToken: string, videoId: string, thumbnailId: string): { thumbnail: Blob } & UseQueryResult<any, any> => {
  let url = `${process.env.REACT_APP_API_ROOT_URI}/api/videos/${videoId}/thumbnails/${thumbnailId}`;
  let key = `${videoId}-${thumbnailId}`;

  const response = useApi({ accessToken, url: url, key: key, returnType: ApiRequestReturnType.blob, enabled: !!(videoId && accessToken && thumbnailId) });

  return {
    get thumbnail() {
      return response.data;
    },
    ...response,
  };
};

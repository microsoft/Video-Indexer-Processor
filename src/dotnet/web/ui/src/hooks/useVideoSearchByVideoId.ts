import { UseQueryResult } from 'react-query';
import { useApi } from './useApi';

/**
 * Get a video from the Search index, by its id
 *
 * @param {string} accessToken access token to be used in header.
 * @param {string} videoId Video Id to find
 */
export const useVideoSearchByVideoId = (accessToken: string, videoId: string): { document: any; document_description: string[] } & UseQueryResult<any, any> => {
  let url = `${process.env.REACT_APP_API_ROOT_URI}/api/Search/${videoId}`;
  const response = useApi({ accessToken, url: url, method: 'GET', key: url, enabled: !!(videoId && accessToken) });

  var res = {
    get document(): any {
      return response?.data;
    },
    get document_description(): string[] {
      let doc = response?.data;

      if (!doc) return undefined;

      try {
        let desc = JSON.parse(doc.metadata_video_description);
        return desc;
      } catch (error) {
        return [doc.metadata_video_description];
      }
    },

    ...response,
  };
  return res;
};

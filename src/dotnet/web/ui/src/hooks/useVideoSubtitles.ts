import { useRef } from 'react';
import { UseQueryResult } from 'react-query';
import { ApiRequestReturnType } from '../types';
import { useApi } from './useApi';

/**
 * Generate the subtitles url
 * @param {string} videoId Video Id from Video Indexer
 * @param {string} lang subtitle code language
 */
export const useVideoSubtitles = (videoId: string, lang?: string, accessToken?: string): { url: string } & UseQueryResult<any, any> => {
  let url = `${process.env.REACT_APP_API_ROOT_URI}/api/Videos/${videoId}/subtitlesfile`;
  let key = `${videoId}-subtitlesfile`;
  if (lang) {
    url = `${url}?language=${lang}`;
    key = `${key}-${lang}`;
  }

  // useRef instead of useState to avoid side effects
  const _url = useRef<string>();

  const response = useApi({ accessToken, url: url, key: key, returnType: ApiRequestReturnType.blob, enabled: !!(videoId && accessToken) });

  return {
    get url() {
      if (_url.current) return _url.current;

      if (response && response.data && response.isFetched) _url.current = URL.createObjectURL(response.data);

      return _url.current ?? undefined;
    },
    ...response,
  };
};

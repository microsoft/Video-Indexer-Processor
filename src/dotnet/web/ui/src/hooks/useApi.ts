import { useIsAuthenticated } from '@azure/msal-react';
import { useQuery, UseQueryResult } from 'react-query';
import { ApiRequest, ApiRequestReturnType } from '../types';

/**
 * allows to call any APIS from the backend, with the authentication bearer token.
 *
 * @param request Api config object
 * @return {UseQueryResult} query result
 */
export const useApi = (request: ApiRequest): UseQueryResult<any, any> => {
  const isAuthenticated = useIsAuthenticated();
  const callKey = request.key ? request.key : request.url;
  const isEnabled = request.enabled === undefined ? true : request.enabled;

  const callApiAsync = async () => {
    if (!isAuthenticated || !request.url || !request.accessToken || !isEnabled) {
      return null;
    }

    // preparing the headers
    const headers = new Headers();
    headers.append('Authorization', `Bearer ${request.accessToken}`);
    headers.append('Content-Type', 'application/json');
    headers.append('Accept', 'application/json');

    var requestInit: RequestInit = {
      method: request.method ?? 'GET',
      headers: headers,
    };

    if (request.method && request.method === 'POST') {
      requestInit.body = request.body;
    }

    var response = await fetch(request.url, requestInit);

    if (!response) throw new Error(`No response available for ${request.url}`);
    else if (response.status < 200 || response.status > 204) {
      var message = await response.text();
      throw new Error(message);
    }

    let returnType = request.returnType ?? ApiRequestReturnType.json;

    switch (returnType) {
      case ApiRequestReturnType.text:
        return await response.text();
      case ApiRequestReturnType.blob:
        return await response.blob();
      case ApiRequestReturnType.json:
      default:
        return await response.json();
    }
  };

  // calling API
  const queryResult = useQuery<any, any>([request.url, callKey], callApiAsync, {
    refetchInterval: 0,
    refetchOnMount: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    enabled: isEnabled,
  });

  return queryResult;
};

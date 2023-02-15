import { useMsal } from '@azure/msal-react';
import { useCallback, useLayoutEffect, useState } from 'react';
import { apiRequest } from '../msalConfig';

/**
 * Gets an access token to be able to call directly Video Indexer
 */
export const useApiVIAccessToken = (): { videoIndexerAccessToken: string } => {
  const { instance, accounts } = useMsal();
  const [videoIndexerAccessToken, setVideoIndexerAccessToken] = useState<string>();

  const getAccessToken = useCallback(async () => {
    if (accounts && accounts.length > 0) {
      let localToken = await instance.acquireTokenSilent({
        ...apiRequest,
        account: accounts[0],
      });

      // preparing the headers
      const headers = new Headers();
      headers.append('Authorization', `Bearer ${localToken.accessToken}`);
      headers.append('Content-Type', 'application/json');
      headers.append('Accept', 'application/json');

      var response = await fetch(`${process.env.REACT_APP_API_ROOT_URI}/api/Search/token`, {
        method: 'GET',
        headers: headers,
      });

      if (response.status < 200 || response.status > 204) {
        var result = await response.text();
        throw new Error(result);
      }

      var tokenString = await response.json();

      return tokenString;
    }
  }, [accounts, instance]);

  // fetch token. using a proxy call because useLayoutEffect does not accept async call
  useLayoutEffect(() => {
    (async () => {
      var viToken = await getAccessToken();
      if (viToken) {
        setVideoIndexerAccessToken(viToken);
      }
    })();
  }, [setVideoIndexerAccessToken, getAccessToken]);

  return { videoIndexerAccessToken };
};

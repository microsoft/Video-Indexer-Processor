import { AccountInfo, IPublicClientApplication } from '@azure/msal-browser';
import { useMsal } from '@azure/msal-react';
import { useCallback, useLayoutEffect, useState } from 'react';
import { decodeJwt } from '../helpers';
import { isTokenExpired } from '../helpers/jwtHelper';
import { apiRequest } from '../msalConfig';

/**
 * Gets an access token to be able to access the api backend
 */
export const useApiAccessToken = (): { apiAccessToken: string } => {
  const { instance, accounts } = useMsal();
  const [apiAccessToken, setApiAccessToken] = useState<string>();

  const getAccessToken = useCallback(async (instance: IPublicClientApplication, accounts: AccountInfo[]) => {
    if (accounts && accounts.length > 0) {
      let localToken = await instance.acquireTokenSilent({
        ...apiRequest,
        account: accounts[0],
      });
      return localToken;
    }
  }, []);

  // fetch token. using a proxy call because useEffect does not accept async call
  useLayoutEffect(() => {
    (async () => {
      if (apiAccessToken) {
        let token = decodeJwt(apiAccessToken);
        if (token && token.exp && !isTokenExpired(token.exp)) return;
      } else {
        let token = await getAccessToken(instance, accounts);
        if (token) {
          setApiAccessToken(token.accessToken);
        }
      }
    })();
  }, [accounts, apiAccessToken, getAccessToken, instance]);

  return { apiAccessToken };
};

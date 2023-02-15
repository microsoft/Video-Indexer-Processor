import { useApiAccessToken } from '../../hooks/useApiAccessToken';
import { MsalProvider } from '@azure/msal-react';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { renderHook } from '@testing-library/react-hooks/dom';
import { testResult } from '../misc/Constants';

describe('useApiAccessToken tests', () => {
  test('should returns an access token from MsalProvider', async () => {
    const wrapper = ({ children }) => <MsalProvider instance={getMockPublicClientApplication()}>{children}</MsalProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useApiAccessToken(), { wrapper });

    // wait for a new render to happens (Layout render) to get the token
    await waitForNextUpdate();

    expect(result.current.apiAccessToken).toBe(testResult.accessToken);
  });
});

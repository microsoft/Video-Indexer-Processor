import { useApiVIAccessToken } from '../../hooks/useApiVIAccessToken';
import { MsalProvider } from '@azure/msal-react';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { renderHook } from '@testing-library/react-hooks/dom';
import { TEST_ACCESS_TOKEN } from '../misc/Constants';
import { mockAllFetch } from '../misc/MockFetch';

describe('useApiVIAccessToken tests', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch');
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/Search/token`, response: TEST_ACCESS_TOKEN, responseType: 'JSON' }]));
  });
  afterEach(() => jest.resetAllMocks());

  test('should returns an access token from MsalProvider', async () => {
    const wrapper = ({ children }) => <MsalProvider instance={getMockPublicClientApplication()}>{children}</MsalProvider>;
    const { result, waitForNextUpdate } = renderHook(() => useApiVIAccessToken(), { wrapper });

    // wait for a new render to happens (Layout render) to get the token
    await waitForNextUpdate();

    expect(result.current.videoIndexerAccessToken).toBe(TEST_ACCESS_TOKEN);
  });
});

import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useVideoStreamingConfig } from '../../hooks/useVideoStreamingConfig';
import { testResult, testVideo } from '../misc/Constants';
import { mockAllFetch, mockFetchNotFound } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useVideoStreamingConfig tests', () => {
  beforeEach(() => jest.spyOn(window, 'fetch'));
  afterEach(() => jest.resetAllMocks());

  test('should returns a valid stream config payload', async () => {
    const expected = {
      url: 'https://.....',
      jwt: 'ejby.....',
    };
    (window.fetch as any).mockImplementation(
      mockAllFetch([{ fetchUrl: `/api/Videos/${testVideo.id}/streamingurl`, response: expected, responseType: 'JSON' }]),
    );

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoStreamingConfig(testResult.accessToken, testVideo.id), { wrapper });

    await actAwait(10);

    expect(result.current.url).toBe(expected.url);
    expect(result.current.jwt).toBe(expected.jwt);
  });

  test('should returns a undefined if not found', async () => {
    (window.fetch as any).mockImplementation(mockFetchNotFound());

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoStreamingConfig(testResult.accessToken, testVideo.id), { wrapper });

    await actAwait(10);

    expect(result.current.jwt).toBeUndefined();
    expect(result.current.url).toBeUndefined();
  });
});

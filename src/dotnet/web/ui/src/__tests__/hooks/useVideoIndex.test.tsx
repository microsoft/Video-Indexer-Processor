import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useVideoIndex } from '../../hooks/useVideoIndex';
import { testResult, testVideo } from '../misc/Constants';
import { mockAllFetch, mockFetchNotFound } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useVideoIndex tests', () => {
  beforeEach(() => jest.spyOn(window, 'fetch'));
  afterEach(() => jest.resetAllMocks());

  test('should returns a valid video payload', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/Videos/${testVideo.id}/index`, response: testVideo, responseType: 'JSON' }]));
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoIndex(testResult.accessToken, testVideo.id), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.index).toMatchObject(testVideo);
  });

  test('should returns undefined if access token is null', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/Videos/${testVideo.id}/index`, response: testVideo, responseType: 'JSON' }]));
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoIndex(null, testVideo.id), { wrapper });

    // wait 1 ms in act() to get a result from fetch
    await actAwait(1);

    expect(result.current.index).toBeUndefined();
  });

  test('should returns undefined if videoId is null', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/Videos/${testVideo.id}/index`, response: testVideo, responseType: 'JSON' }]));
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoIndex(testResult.accessToken, undefined), { wrapper });

    // wait 1 ms in act() to get a result from fetch
    await actAwait(1);

    expect(result.current.index).toBeUndefined();
  });

  test('should returns a undefined if not found', async () => {
    (window.fetch as any).mockImplementation(mockFetchNotFound);
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoIndex(testResult.accessToken, testVideo.id), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.index).toBeUndefined();
  });
});

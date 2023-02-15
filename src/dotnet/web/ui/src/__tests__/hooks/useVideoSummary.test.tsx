import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useVideoSummary } from '../../hooks/useVideoSummary';
import { testResult, testVideo } from '../misc/Constants';
import { mockAllFetch } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useVideoSummary tests', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch');
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/Videos/${testVideo.id}/summary`, response: testVideo, responseType: 'JSON' }]));
  });
  afterEach(() => jest.resetAllMocks());

  test('should returns a valid video payload', async () => {
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoSummary(testResult.accessToken, testVideo.id), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.summary).toMatchObject(testVideo);
  });

  test('should returns undefined if access token is null', async () => {
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoSummary(null, testVideo.id), { wrapper });

    // wait 1 ms in act() to get a result from fetch
    await actAwait(1);

    expect(result.current.summary).toBeUndefined();
  });

  test('should returns undefined if videoId is null', async () => {
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoSummary(testResult.accessToken, undefined), { wrapper });

    // wait 1 ms in act() to get a result from fetch
    await actAwait(1);

    expect(result.current.summary).toBeUndefined();
  });
});

import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useVideoSearchByVideoId } from '../../hooks/useVideoSearchByVideoId';
import { testResult, testSearchOneVideoResult, testVideo } from '../misc/Constants';
import { mockAllFetch, mockFetchNotFound } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useVideoSearchByVideoId tests', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch');
  });
  afterEach(() => jest.resetAllMocks());

  test('should returns a valid video payload', async () => {
    (window.fetch as any).mockImplementation(
      mockAllFetch([{ fetchUrl: `/api/Search/${testVideo.id}`, response: testSearchOneVideoResult, responseType: 'JSON' }]),
    );

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoSearchByVideoId(testResult.accessToken, testVideo.id), { wrapper });

    await actAwait(10);

    expect(result.current.document).toMatchObject(testSearchOneVideoResult);
    expect(result.current.document_description).toContain(testSearchOneVideoResult.metadata_video_description);
  });

  test('should returns a something even if not found', async () => {
    (window.fetch as any).mockImplementation(mockFetchNotFound());

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoSearchByVideoId(testResult.accessToken, testVideo.id), { wrapper });

    await actAwait(10);

    expect(result.current.document).toBeUndefined();
    expect(result.current.document_description).toBeUndefined();
  });
});

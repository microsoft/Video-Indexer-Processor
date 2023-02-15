import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter } from 'react-router-dom';
import { useVideosSearch } from '../../hooks/useVideosSearch';
import { testSearchResult } from '../misc/Constants';
import { mockAllFetch, mockFetchNotFound } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useVideoSearch tests', () => {
  beforeEach(() => {
    jest.spyOn(window, 'fetch');
  });
  afterEach(() => jest.resetAllMocks());

  test('should returns a valid search payload', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/Search`, response: testSearchResult, responseType: 'JSON' }]));
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <MemoryRouter initialEntries={['/search?q=spain&s=50&p=1&sm=any&st=fuzzy']}>
            <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
          </MemoryRouter>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideosSearch(), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.videosSearch.facets).toMatchObject(testSearchResult.facets);
    expect(result.current.videosSearch.results).toMatchObject(testSearchResult.results);
    expect(result.current.videosSearch.count).toBe(testSearchResult.count);
  });

  test('should returns undefined if not found', async () => {
    (window.fetch as any).mockImplementation(mockFetchNotFound);
    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <MemoryRouter initialEntries={['/search?q=randomvaluethatcantbefound&s=50&p=1&sm=any&st=fuzzy']}>
            <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
          </MemoryRouter>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideosSearch(), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.videosSearch.facets).toBeUndefined();
    expect(result.current.videosSearch.results).toBeUndefined();
    expect(result.current.videosSearch.count).toBeUndefined();
  });
});

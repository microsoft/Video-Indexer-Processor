import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useApi } from '../../hooks/useApi';
import { ApiRequestReturnType } from '../../types';
import { testResult, testVideo } from '../misc/Constants';
import { mockAllFetch, mockFetchNotFound } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useApi tests', () => {
  beforeEach(() => jest.spyOn(window, 'fetch'));
  afterEach(() => jest.resetAllMocks());

  test('should returns a text', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/test/text`, response: 'test', responseType: 'TEXT' }]));

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(
      () =>
        useApi({
          accessToken: testResult.accessToken,
          url: `/api/test/text`,
          method: 'GET',
          body: null,
          key: `/api/test/text`,
          enabled: true,
          returnType: ApiRequestReturnType.text,
        }),
      { wrapper },
    );

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.data).toBe('test');
  });

  test('should returns a json object', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/test/json`, response: testVideo, responseType: 'JSON' }]));

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(
      () =>
        useApi({
          accessToken: testResult.accessToken,
          url: `/api/test/json`,
          method: 'GET',
          body: null,
          key: `/api/test/json`,
          enabled: true,
          returnType: ApiRequestReturnType.json,
        }),
      { wrapper },
    );

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.data).toMatchObject(testVideo);
  });

  test('should returns a blob object', async () => {
    const obj = { hello: 'world' };
    const blob = new Blob([JSON.stringify(obj, null, 2)], { type: 'application/json' });

    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/test/blob`, response: blob, responseType: 'BLOB' }]));

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(
      () =>
        useApi({
          accessToken: testResult.accessToken,
          url: `/api/test/blob`,
          method: 'GET',
          body: null,
          key: `/api/test/blob`,
          enabled: true,
          returnType: ApiRequestReturnType.blob,
        }),
      { wrapper },
    );

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.data).toMatchObject(blob);
  });

  test('should returns undefined if !enabled', async () => {
    (window.fetch as any).mockImplementation(mockAllFetch([{ fetchUrl: `/api/test/text`, response: 'test', responseType: 'TEXT' }]));

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(
      () =>
        useApi({
          accessToken: testResult.accessToken,
          url: `/api/test/text`,
          method: 'GET',
          body: null,
          key: `/api/test/text`,
          enabled: false,
          returnType: ApiRequestReturnType.text,
        }),
      { wrapper },
    );

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.data).toBeUndefined();
  });

  test('should returns undefined if not found', async () => {
    (window.fetch as any).mockImplementation(mockFetchNotFound);

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(
      () =>
        useApi({
          accessToken: testResult.accessToken,
          url: `/api/test/json`,
          method: 'GET',
          body: null,
          key: `/api/test/json`,
          enabled: true,
          returnType: ApiRequestReturnType.json,
        }),
      { wrapper },
    );

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    expect(result.current.data).toBeUndefined();
  });
});

import { MsalProvider } from '@azure/msal-react';
import { renderHook } from '@testing-library/react-hooks/dom';
import { QueryClient, QueryClientProvider } from 'react-query';
import { useVideoThumbnail } from '../../hooks/useVideoThumbnail';
import { testResult, testVideo } from '../misc/Constants';
import { mockAllFetch } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('useVideoThumbnail tests', () => {
  beforeEach(() => jest.spyOn(window, 'fetch'));
  afterEach(() => jest.resetAllMocks());

  test('should returns a valid video thumbnail', async () => {
    let imageArray = new Uint8Array([72, 101, 108, 108, 111]);
    const imageBlob = new Blob([imageArray], { type: 'image/jpeg' });

    (window.fetch as any).mockImplementation(
      mockAllFetch([{ fetchUrl: `/api/videos/${testVideo.id}/thumbnails/${testVideo.thumbnailId}`, response: imageBlob, responseType: 'BLOB' }]),
    );

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoThumbnail(testResult.accessToken, testVideo.id, testVideo.thumbnailId), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    let thumbnailBlob = result.current.thumbnail;
    expect(thumbnailBlob).toEqual(imageBlob);
  });

  test('should returns the same video thumbnail uri over time', async () => {
    let imageArray = new Uint8Array([72, 101, 108, 108, 111]);
    const imageBlob = new Blob([imageArray], { type: 'image/jpeg' });

    (window.fetch as any).mockImplementation(
      mockAllFetch([{ fetchUrl: `/api/videos/${testVideo.id}/thumbnails/${testVideo.thumbnailId}`, response: imageBlob, responseType: 'BLOB' }]),
    );

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result, rerender } = renderHook(() => useVideoThumbnail(testResult.accessToken, testVideo.id, testVideo.thumbnailId), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);

    let thumbnail1 = result.current.thumbnail;
    rerender();
    let thumbnail2 = result.current.thumbnail;

    expect(thumbnail1).toBe(thumbnail2);
  });

  test('should returns not found if thumbnailId is undefined', async () => {
    let imageArray = new Uint8Array([72, 101, 108, 108, 111]);
    const imageBlob = new Blob([imageArray], { type: 'image/jpeg' });
    jest.spyOn(URL, 'createObjectURL');

    // Generate a random value on each call
    (URL.createObjectURL as any).mockImplementation((obj: Blob | MediaSource) => `blob:https://${Math.random().toString()}.jpg`);
    (window.fetch as any).mockImplementation(
      mockAllFetch([{ fetchUrl: `/api/videos/${testVideo.id}/thumbnails/${testVideo.thumbnailId}`, response: imageBlob, responseType: 'BLOB' }]),
    );

    const wrapper = ({ children }) => {
      return (
        <MsalProvider instance={getMockPublicClientApplication()}>
          <QueryClientProvider client={new QueryClient()}>{children}</QueryClientProvider>
        </MsalProvider>
      );
    };

    const { result } = renderHook(() => useVideoThumbnail(testResult.accessToken, testVideo.id, undefined), { wrapper });

    // wait 10 ms in act() to get a result from fetch
    await actAwait(10);
    let thumbnailUrl = result.current.thumbnail;

    expect(thumbnailUrl).toBeUndefined();
  });
});

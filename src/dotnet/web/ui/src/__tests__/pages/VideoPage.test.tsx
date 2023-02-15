import { AccountInfo, EventCallbackFunction, EventMessage, EventType, InteractionType, IPublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppInsightsContext, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../../components/Layout';
import VideoPage from '../../pages/VideoPage';
import { SearchProvider } from '../../providers/searchProvider';
import { ThemeProvider } from '../../providers/themeProvider';
import { testAccount, testSearchOneVideoResult, testStreamingUrlVideo, testVideo, TEST_ACCESS_TOKEN } from '../misc/Constants';
import { mockAllFetch, mockFetchExpect } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import copyToClipboard from 'copy-to-clipboard';
import { parseArrayToString } from '../../helpers';

// since we are mocking a module, it should be outside "describe"
jest.mock('copy-to-clipboard', () => jest.fn((t, o) => true));

describe('Video page', () => {
  let handleRedirectSpy: jest.SpyInstance;
  let pca: IPublicClientApplication;
  let mockSummaryVideoFetch: mockFetchExpect;
  let mockStreamingUrlVideoFetch: mockFetchExpect;
  let mockSearchVideoFetch: mockFetchExpect;
  let appInsightsPlugin: ReactPlugin;

  let eventCallbacks: EventCallbackFunction[];
  let accounts: AccountInfo[] = [];
  let activeAccount: AccountInfo | null = null;
  let allFetchMocks: mockFetchExpect[] = [];

  beforeEach(() => {
    pca = getMockPublicClientApplication();
    appInsightsPlugin = new ReactPlugin();

    eventCallbacks = [];
    let eventId = 0;
    jest.spyOn(pca, 'addEventCallback').mockImplementation((callbackFn: any) => {
      eventCallbacks.push(callbackFn);
      eventId += 1;
      return eventId.toString();
    });

    // clear session and localstorage to avoid side effects between tests
    window.localStorage.clear();
    window.sessionStorage.clear();

    // send a message to say "hey we made redirect start then end"
    handleRedirectSpy = jest.spyOn(pca, 'handleRedirectPromise').mockImplementation(() => {
      const eventStart: EventMessage = {
        eventType: EventType.HANDLE_REDIRECT_START,
        interactionType: InteractionType.Redirect,
        payload: null,
        error: null,
        timestamp: 10000,
      };

      eventCallbacks.forEach((callback) => {
        callback(eventStart);
      });

      const eventEnd: EventMessage = {
        eventType: EventType.HANDLE_REDIRECT_END,
        interactionType: InteractionType.Redirect,
        payload: null,
        error: null,
        timestamp: 10000,
      };

      eventCallbacks.forEach((callback) => {
        callback(eventEnd);
      });
      return Promise.resolve(null);
    });

    jest.spyOn(pca, 'getAllAccounts').mockImplementation(() => accounts);
    jest.spyOn(pca, 'getActiveAccount').mockImplementation(() => activeAccount);
    jest.spyOn(pca, 'setActiveAccount').mockImplementation((account) => (activeAccount = account));

    jest.spyOn(appInsightsPlugin, 'trackEvent').mockImplementation(() => {});

    allFetchMocks.push(new mockFetchExpect(`/api/Search/token`, TEST_ACCESS_TOKEN));

    mockSearchVideoFetch = new mockFetchExpect(`/api/Search/video-id`, testSearchOneVideoResult);
    allFetchMocks.push(mockSearchVideoFetch);
    mockSummaryVideoFetch = new mockFetchExpect(`/api/Videos/video-id/summary`, testVideo);
    allFetchMocks.push(mockSummaryVideoFetch);
    mockStreamingUrlVideoFetch = new mockFetchExpect(`/api/Videos/video-id/streamingurl`, testStreamingUrlVideo);
    allFetchMocks.push(mockStreamingUrlVideoFetch);

    allFetchMocks.push(new mockFetchExpect(`/api/Dashboard`, 'http://dashboard'));

    allFetchMocks.push(new mockFetchExpect(`/api/Videos/video-id/subtitlesfile?language=en-us`, 'WEBVTT', 'TEXT'));
    allFetchMocks.push(new mockFetchExpect(`/api/Videos/video-id/subtitlesfile?language=fr-fr`, 'WEBVTT', 'TEXT'));
    allFetchMocks.push(new mockFetchExpect(`/api/Videos/video-id/subtitlesfile?language=ar-SA`, 'WEBVTT', 'TEXT'));

    jest.spyOn(window.HTMLVideoElement.prototype, 'pause').mockImplementation(() => {});

    jest.spyOn(toast, 'success').mockImplementation((message: any, options?: any) => {
      return '';
    });

    jest.spyOn(window, 'fetch');
    (window.fetch as any).mockImplementation(mockAllFetch(allFetchMocks));
  });

  afterEach(() => {
    jest.resetAllMocks();
    accounts = [];
    activeAccount = null;
    allFetchMocks = [];
    mockSummaryVideoFetch = null;
    mockSearchVideoFetch = null;
    mockStreamingUrlVideoFetch = null;
  });

  test('Video page render correctly when user is logged out', async () => {
    render(
      <MsalProvider instance={pca}>
        <SearchProvider>
          <QueryClientProvider client={new QueryClient()}>
            <ThemeProvider value="lightTheme">
              <MemoryRouter initialEntries={['/videos/video-id']}>
                <Layout>
                  <Routes>
                    <Route path="/videos/:videoId" element={<VideoPage />} />
                  </Routes>
                </Layout>
              </MemoryRouter>
            </ThemeProvider>
          </QueryClientProvider>
        </SearchProvider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    expect(screen.getByText(/Please sign-in./)).toBeInTheDocument();
  });

  test('Video page render correctly when user is logged in', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('button', { name: testAccount.name })).toBeInTheDocument();
  });

  test('Video page render with a criteria should call fetch video', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;
    let configCalled: { body: string };

    mockSummaryVideoFetch.onCalled = (url, response, config) => {
      configCalled = config;
    };

    // spy search fetch call
    let mockSearchVideoFetchSpy = jest.spyOn(mockSearchVideoFetch, 'onCalled');
    let mockSummaryFetchSpy = jest.spyOn(mockSummaryVideoFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    // fetch should be called 1 time
    await waitFor(() => expect(mockSummaryFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSearchVideoFetchSpy).toHaveBeenCalledTimes(1));

    expect(configCalled).toBeTruthy();
  });

  test('Video page click on Advanced Copy should open the Advanced Copy modal window', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    // spy search fetch call
    let mockSearchVideoFetchSpy = jest.spyOn(mockSearchVideoFetch, 'onCalled');
    let mockSummaryFetchSpy = jest.spyOn(mockSummaryVideoFetch, 'onCalled');
    let mockStreamingUrlVideoFetchSpy = jest.spyOn(mockStreamingUrlVideoFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    // fetch should be called 1 time
    await waitFor(() => expect(mockSummaryFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSearchVideoFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockStreamingUrlVideoFetchSpy).toHaveBeenCalledTimes(1));

    let advancedCopy = screen.getByRole<HTMLButtonElement>('menuitem', { name: 'AdvancedCopy' });
    expect(advancedCopy).toBeInTheDocument();

    // set input focus
    userEvent.click(advancedCopy);

    expect(screen.getByText('Create an advanced copy containing a clip selection from the video')).toBeInTheDocument();
  });

  test('Video page click on Copy should call copytoclipboard', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    // spy search fetch call
    let mockSearchVideoFetchSpy = jest.spyOn(mockSearchVideoFetch, 'onCalled');
    let mockSummaryFetchSpy = jest.spyOn(mockSummaryVideoFetch, 'onCalled');
    let mockStreamingUrlVideoFetchSpy = jest.spyOn(mockStreamingUrlVideoFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    // fetch should be called 1 time
    await waitFor(() => expect(mockSummaryFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSearchVideoFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockStreamingUrlVideoFetchSpy).toHaveBeenCalledTimes(1));

    let copy = screen.getByRole<HTMLButtonElement>('menuitem', { name: 'Copy' });
    expect(copy).toBeInTheDocument();
    // set input focus
    userEvent.click(copy);

    await waitFor(() => expect(copyToClipboard).toHaveBeenCalledTimes(1));
  });

  test('Video page click on Feedback should launch the Feedback component', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    // spy search fetch call
    let mockSearchVideoFetchSpy = jest.spyOn(mockSearchVideoFetch, 'onCalled');
    let mockSummaryFetchSpy = jest.spyOn(mockSummaryVideoFetch, 'onCalled');
    let mockStreamingUrlVideoFetchSpy = jest.spyOn(mockStreamingUrlVideoFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    // fetch should be called 1 time
    await waitFor(() => expect(mockSummaryFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSearchVideoFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockStreamingUrlVideoFetchSpy).toHaveBeenCalledTimes(1));

    let feedbackButton = screen.getByRole<HTMLButtonElement>('menuitem', { name: 'Feedback' });
    expect(feedbackButton).toBeInTheDocument();
    // set input focus
    userEvent.click(feedbackButton);
    expect(
      screen.getByText(
        'Please provide as much detail as possible regarding the feedback you are reporting. Please do not provide any personal or sensitive information.',
      ),
    ).toBeInTheDocument();
  });

  test('Video page header should be present', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    // spy search fetch call
    let mockSearchVideoFetchSpy = jest.spyOn(mockSearchVideoFetch, 'onCalled');
    let mockSummaryFetchSpy = jest.spyOn(mockSummaryVideoFetch, 'onCalled');
    let mockStreamingUrlVideoFetchSpy = jest.spyOn(mockStreamingUrlVideoFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    // fetch should be called 1 time
    await waitFor(() => expect(mockSummaryFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockSearchVideoFetchSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(mockStreamingUrlVideoFetchSpy).toHaveBeenCalledTimes(1));

    expect(screen.getByText(parseArrayToString(testSearchOneVideoResult.metadata_keywords, ','))).toBeInTheDocument();
    expect(screen.getByText(testSearchOneVideoResult.metadata_video_description)).toBeInTheDocument();
  });

  test('Video page click on each video description item should trigger copy', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/videos/video-id']}>
                  <Layout>
                    <Routes>
                      <Route path="/videos/:videoId" element={<VideoPage />} />
                    </Routes>
                  </Layout>
                </MemoryRouter>
              </ThemeProvider>
            </QueryClientProvider>
          </SearchProvider>
        </AppInsightsContext.Provider>
      </MsalProvider>,
    );
    // wait for call to redirect to be made
    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));

    const copy = screen.getByRole<HTMLButtonElement>('button', { name: 'header Keywords' });
    expect(copy).toBeInTheDocument();
    userEvent.click(copy);
    await waitFor(() => expect(copyToClipboard).toHaveBeenCalledTimes(1));
    (copyToClipboard as any).mockReset();
  });
});

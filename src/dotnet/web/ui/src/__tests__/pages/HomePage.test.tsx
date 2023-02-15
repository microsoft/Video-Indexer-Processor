import { AccountInfo, EventCallbackFunction, EventMessage, EventType, InteractionType, IPublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppInsightsContext, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../../components/Layout';
import HomePage from '../../pages/HomePage';
import SearchPage from '../../pages/SearchPage';
import { SearchProvider } from '../../providers/searchProvider';
import { ThemeProvider } from '../../providers/themeProvider';
import { testAccount, testResult, testSearchResult, TEST_ACCESS_TOKEN } from '../misc/Constants';
import { mockAllFetch, mockFetchExpect } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('Home page', () => {
  let handleRedirectSpy: jest.SpyInstance;
  let pca: IPublicClientApplication;
  let loginRedirectSpy: jest.SpyInstance;
  let logoutRedirectSpy: jest.SpyInstance;
  let appInsightsPlugin: ReactPlugin;

  let eventCallbacks: EventCallbackFunction[];
  let accounts: AccountInfo[] = [];
  let activeAccount: AccountInfo | null = null;

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

    loginRedirectSpy = jest.spyOn(pca, 'loginRedirect').mockImplementation((request) => {
      accounts = [testAccount];
      const eventMessage: EventMessage = {
        eventType: EventType.LOGIN_SUCCESS,
        interactionType: InteractionType.Redirect,
        payload: testResult,
        error: null,
        timestamp: 10000,
      };
      eventCallbacks.forEach((callback) => {
        callback(eventMessage);
      });

      return Promise.resolve();
    });

    logoutRedirectSpy = jest.spyOn(pca, 'logoutRedirect').mockImplementation((request) => {
      accounts = [];
      activeAccount = null;
      const eventMessage: EventMessage = {
        eventType: EventType.LOGOUT_SUCCESS,
        interactionType: InteractionType.Redirect,
        payload: testResult,
        error: null,
        timestamp: 10000,
      };
      eventCallbacks.forEach((callback) => {
        callback(eventMessage);
      });

      return Promise.resolve();
    });
    jest.spyOn(pca, 'getAllAccounts').mockImplementation(() => accounts);
    jest.spyOn(pca, 'getActiveAccount').mockImplementation(() => activeAccount);
    jest.spyOn(pca, 'setActiveAccount').mockImplementation((account) => (activeAccount = account));

    jest.spyOn(window, 'fetch');

    jest.spyOn(appInsightsPlugin, 'trackEvent').mockImplementation(() => {});

    let mock1: mockFetchExpect = { fetchUrl: `/api/Search/token`, response: TEST_ACCESS_TOKEN, responseType: 'JSON' };
    let mock2: mockFetchExpect = { fetchUrl: `/api/Search`, response: testSearchResult, responseType: 'JSON' };
    let mock3: mockFetchExpect = { fetchUrl: `/api/Dashboard`, response: 'http://dashboard', responseType: 'TEXT' };

    let mocks = [mock1, mock2, mock3];
    (window.fetch as any).mockImplementation(mockAllFetch(mocks));
  });

  afterEach(() => {
    jest.resetAllMocks();
    accounts = [];
    activeAccount = null;
  });

  test('Home page render correctly when user is logged out', async () => {
    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <HomePage />
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

    expect(screen.getByText(/Please sign-in/)).toBeInTheDocument();
  });

  test('Home page render correctly when user is logged in', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <HomePage />
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

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: testAccount.name })).toBeInTheDocument();
  });

  test('Home page render correctly when user logs in', async () => {
    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <HomePage />
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

    const signin = screen.getByRole('button', { name: 'Sign In' });
    userEvent.click(signin);

    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(loginRedirectSpy).toHaveBeenCalledTimes(1));

    expect(screen.getByRole('searchbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: testAccount.name })).toBeInTheDocument();
  });

  test('Home page render correctly when user logs out', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <HomePage />
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

    const user = screen.getByRole('button', { name: testAccount.name });
    userEvent.click(user);

    // once clicked on user name, menuitem is appearing
    const signout = screen.getByRole('menuitem', { name: 'Sign Out' });

    // wait for menu item to appears
    await actAwait(100);

    // click on logout
    userEvent.click(signout);

    await waitFor(() => expect(handleRedirectSpy).toHaveBeenCalledTimes(1));
    await waitFor(() => expect(logoutRedirectSpy).toHaveBeenCalledTimes(1));

    await actAwait(100);

    expect(screen.getByText(/Please sign-in/)).toBeInTheDocument();
  });

  test('Home go to Search page when hits enter on search bar', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <Routes>
                      <Route path="/" element={<HomePage />} />
                      <Route path="/search" element={<SearchPage />} />
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

    let inputText = screen.getByRole<HTMLTextAreaElement>('searchbox');

    // set input focus
    userEvent.click(inputText);
    // fill a value and press enter
    userEvent.keyboard('test{Enter}');
    // press enter

    // await search page is loaded
    await actAwait(100);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    let searchInput = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchInput.value).toBe('test');
  });
});

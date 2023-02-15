import { AccountInfo, EventCallbackFunction, EventMessage, EventType, InteractionType, IPublicClientApplication } from '@azure/msal-browser';
import { MsalProvider } from '@azure/msal-react';
import { AppInsightsContext, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { QueryClient, QueryClientProvider } from 'react-query';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import Layout from '../../components/Layout';
import SearchPage from '../../pages/SearchPage';
import { SearchProvider } from '../../providers/searchProvider';
import { ThemeProvider } from '../../providers/themeProvider';
import { SEARCH_CRITERIA_DEFAULTS } from '../../types';
import { testAccount, testResult, testSearchEmptyResult, testSearchResult, TEST_ACCESS_TOKEN } from '../misc/Constants';
import { mockAllFetch, mockFetchExpect } from '../misc/MockFetch';
import { getMockPublicClientApplication } from '../misc/MockPublicClientApplication';
import { actAwait } from '../misc/Utils';

describe('Search page', () => {
  let handleRedirectSpy: jest.SpyInstance;
  let pca: IPublicClientApplication;
  let loginRedirectSpy: jest.SpyInstance;
  let logoutRedirectSpy: jest.SpyInstance;
  let mockSearchFetch: mockFetchExpect;
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

    jest.spyOn(appInsightsPlugin, 'trackEvent').mockImplementation(() => {});

    allFetchMocks.push(new mockFetchExpect(`/api/Dashboard`, "http://dashboard"));
    allFetchMocks.push(new mockFetchExpect(`/api/Search/token`, TEST_ACCESS_TOKEN));
    allFetchMocks.push(new mockFetchExpect(`/api/Search`, testSearchResult));
    mockSearchFetch = allFetchMocks.find((m) => m.fetchUrl === '/api/Search');

    jest.spyOn(window, 'fetch');
    (window.fetch as any).mockImplementation(mockAllFetch(allFetchMocks));
  });

  afterEach(() => {
    jest.resetAllMocks();
    accounts = [];
    activeAccount = null;
    allFetchMocks = [];
    mockSearchFetch = null;
  });

  test('Search page render correctly when user is logged out', async () => {
    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <SearchPage />
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

    expect(screen.getByText(/Please sign-in./)).toBeInTheDocument();
  });

  test('Search page render correctly when user is logged in', async () => {
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
                    <SearchPage />
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

  test('Search page render correctly when user logs in', async () => {
    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter>
                  <Layout>
                    <SearchPage />
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

    expect(screen.getByRole('button', { name: testAccount.name })).toBeInTheDocument();
  });

  test('Search page render correctly when user logs out', async () => {
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
                    <SearchPage />
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

  test('Search page render without any criteria should be empty', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    // spy search fetch call
    let mockSearchFetchSpy = jest.spyOn(mockSearchFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/search?q=']}>
                  <Layout>
                    <Routes>
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

    // if the api is called even if q='' so it's a fail
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(0));

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    let searchInput = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchInput.value).toBe('');

    expect(screen.getByText('Use the search input to perform a search in the index')).toBeInTheDocument();
  });

  test('Search page render with a criteria should call fetch query', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;
    let configCalled: { body: string };

    mockSearchFetch.onCalled = (url, response, config) => {
      configCalled = config;
    };

    // spy search fetch call
    let mockSearchFetchSpy = jest.spyOn(mockSearchFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/search?q=testabc']}>
                  <Layout>
                    <Routes>
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

    // fetch should be called 1 time
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(1));

    expect(configCalled.body).toBeTruthy();
    let jsonBody = JSON.parse(configCalled.body);
    expect(jsonBody.searchText).toBe('testabc');
    expect(jsonBody.size).toBe(SEARCH_CRITERIA_DEFAULTS.SIZE);
    expect(jsonBody.searchMode).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE);
    expect(jsonBody.searchType).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE);
    expect(jsonBody.skip).toBe(0);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    let searchInput = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchInput.value).toBe('testabc');
  });

  test('Search page press enter on search input should call fetch query', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    let configCalled: { body: any };

    mockSearchFetch.onCalled = (url, response, config) => {
      configCalled = config;
    };

    // spy search fetch call
    let mockSearchFetchSpy = jest.spyOn(mockSearchFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/search']}>
                  <Layout>
                    <Routes>
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

    // fetch should not be called yet
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(0));

    let inputText = screen.getByRole<HTMLTextAreaElement>('textbox');

    expect(inputText.value).toBe('');

    // set input focus
    userEvent.click(inputText);
    // fill a value and press enter
    // use a special character (+) and be sure we have it on search page
    userEvent.keyboard('usa+france{Enter}');
    // press enter

    // fetch should be called 1 time
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(1));

    expect(configCalled.body).toBeTruthy();
    let jsonBody = JSON.parse(configCalled.body);
    expect(jsonBody.searchText).toBe('usa+france');
    expect(jsonBody.size).toBe(SEARCH_CRITERIA_DEFAULTS.SIZE);
    expect(jsonBody.searchMode).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE);
    expect(jsonBody.searchType).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE);
    expect(jsonBody.skip).toBe(0);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    let searchInput = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchInput.value).toBe('usa+france');
  });

  test('Search page click search button should call fetch query', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;

    let configCalled: { body: any };

    mockSearchFetch.onCalled = (url, response, config) => {
      configCalled = config;
    };

    // spy search fetch call
    let mockSearchFetchSpy = jest.spyOn(mockSearchFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/search']}>
                  <Layout>
                    <Routes>
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

    // fetch should not be called yet
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(0));

    let inputText = screen.getByRole<HTMLTextAreaElement>('textbox');

    expect(inputText.value).toBe('');

    // set input focus
    userEvent.click(inputText);

    // fill a value
    // use a special character (+) and be sure we have it on search page
    userEvent.keyboard('usa+france');

    // get the search button
    let buttonSearch = screen.getByRole<HTMLButtonElement>('button', { name: 'Search' });

    // click on the button
    userEvent.click(buttonSearch);

    // fetch should be called 1 time
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(1));

    expect(configCalled.body).toBeTruthy();
    let jsonBody = JSON.parse(configCalled.body);
    expect(jsonBody.searchText).toBe('usa+france');
    expect(jsonBody.size).toBe(SEARCH_CRITERIA_DEFAULTS.SIZE);
    expect(jsonBody.searchMode).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE);
    expect(jsonBody.searchType).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE);
    expect(jsonBody.skip).toBe(0);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    let searchInput = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchInput.value).toBe('usa+france');
  });

  test('Search page render with a criteria that is not existing should call fetch query and returns empty results', async () => {
    accounts = [testAccount];
    activeAccount = testAccount;
    let configCalled: { body: string };

    mockSearchFetch.response = testSearchEmptyResult;
    mockSearchFetch.onCalled = (url, response, config) => {
      configCalled = config;
    };

    // spy search fetch call
    let mockSearchFetchSpy = jest.spyOn(mockSearchFetch, 'onCalled');

    render(
      <MsalProvider instance={pca}>
        <AppInsightsContext.Provider value={appInsightsPlugin}>
          <SearchProvider>
            <QueryClientProvider client={new QueryClient()}>
              <ThemeProvider value="lightTheme">
                <MemoryRouter initialEntries={['/search?q=testabc_but_its_not_existing']}>
                  <Layout>
                    <Routes>
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

    // fetch should be called 1 time
    await waitFor(() => expect(mockSearchFetchSpy).toHaveBeenCalledTimes(1));

    expect(configCalled.body).toBeTruthy();
    let jsonBody = JSON.parse(configCalled.body);
    expect(jsonBody.searchText).toBe('testabc_but_its_not_existing');
    expect(jsonBody.size).toBe(SEARCH_CRITERIA_DEFAULTS.SIZE);
    expect(jsonBody.searchMode).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_MODE);
    expect(jsonBody.searchType).toBe(SEARCH_CRITERIA_DEFAULTS.SEARCH_TYPE);
    expect(jsonBody.skip).toBe(0);

    expect(screen.getByRole('textbox')).toBeInTheDocument();
    let searchInput = screen.getByRole<HTMLInputElement>('textbox');
    expect(searchInput.value).toBe('testabc_but_its_not_existing');

    expect(screen.getByText('No results')).toBeInTheDocument();
  });
});

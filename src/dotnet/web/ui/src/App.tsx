import { AppInsightsContext } from '@microsoft/applicationinsights-react-js';
import { QueryClient, QueryClientProvider } from 'react-query';
import { ReactQueryDevtools } from 'react-query/devtools';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import './App.scss';
import { reactPlugin } from './AppInsights';
import Layout from './components/Layout';
import NothingHereComponent from './components/NothingHereComponent';
import HomePage from './pages/HomePage';
import SearchPage from './pages/SearchPage';
import VideoPage from './pages/VideoPage';
import { SearchProvider } from './providers/searchProvider';
import { ThemeProvider } from './providers/themeProvider';

const queryClient = new QueryClient();

const App: React.FunctionComponent = (props): React.ReactElement | any => {
  return (
    <AppInsightsContext.Provider value={reactPlugin}>
      <SearchProvider>
        <QueryClientProvider client={queryClient}>
          <ThemeProvider value="lightTheme">
            <Router>
              <Layout>
                <Routes>
                  <Route path="/" element={<HomePage />} />
                  <Route path="/search" element={<SearchPage />} />
                  <Route path="/videos/:videoId" element={<VideoPage />} />
                  <Route
                    path="*"
                    element={
                      <main style={{ padding: '1rem' }}>
                        <NothingHereComponent />
                      </main>
                    }
                  />
                </Routes>
              </Layout>
            </Router>
          </ThemeProvider>
          <ReactQueryDevtools initialIsOpen={false} />
        </QueryClientProvider>
      </SearchProvider>
    </AppInsightsContext.Provider>
  );
};

export default App;

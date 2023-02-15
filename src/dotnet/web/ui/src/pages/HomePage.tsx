import { InteractionStatus } from '@azure/msal-browser';
import { AuthenticatedTemplate, UnauthenticatedTemplate, useIsAuthenticated, useMsal } from '@azure/msal-react';
import { Image, ISearchBox, IStackTokens, SearchBox, Stack } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { v4 as uuidv4 } from 'uuid';
import Loading from '../components/Loading';
import UnauthenticatedComponent from '../components/UnauthenticatedComponent';
import { useAppInsights } from '../hooks/useAppInsights';
import { useSearch } from '../hooks/useSearch';
import logo200 from '../images/logo-200.png';
import { SearchContextType } from '../types';

export interface IBlankPageProps {}
const stackTokens: Partial<IStackTokens> = { childrenGap: 20, padding: 10 };
const stackTokens2: Partial<IStackTokens> = {
  childrenGap: 20,
  padding: 10,
};

const HomePage: React.FunctionComponent = (props: IBlankPageProps) => {
  const { inProgress } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const navigate = useNavigate();
  const appInsights = useAppInsights();

  const searchBoxRef = useRef<ISearchBox>();
  const [searchContext, setSearchContext] = useSearch();

  useEffect(() => {
    if (isAuthenticated && searchBoxRef && searchBoxRef.current) searchBoxRef.current.focus();
  }, [isAuthenticated]);

  if (!isAuthenticated && inProgress !== InteractionStatus.None) {
    return (
      <>
        <Stack horizontal horizontalAlign="center" verticalAlign="center" style={{ height: 300 }}>
          <Loading message="please wait. authentication in progress..." />
        </Stack>
      </>
    );
  }

  const onSetSearchText = (searchText: string) => {
    if (searchText && searchText.trim() !== '') {
      var uuid = uuidv4().replace(/-/gi, '');

      var newSearchContext: SearchContextType = {
        searchId: uuid,
        searchText: searchText,
        size: searchContext.size,
        page: searchContext.page,
        searchType: searchContext.searchType,
        searchMode: searchContext.searchMode,
      };

      appInsights.trackEvent({
        name: 'onSearch',
        properties: {
          queryId: newSearchContext.searchId,
          query: newSearchContext.searchText,
        },
      });

      setSearchContext(newSearchContext);

      navigate(
        `/search?q=${searchText}&s=${searchContext.size.toString()}&p=1&sm=${searchContext.searchMode.toLowerCase()}&st=${searchContext.searchType.toLowerCase()}`,
        { replace: true },
      );
    }
  };

  return (
    <Stack tokens={stackTokens}>
      <AuthenticatedTemplate>
        <Stack
          tokens={stackTokens2}
          horizontalAlign="center"
          style={{
            background: 'transparent',
          }}
        >
          <Image src={logo200} alt="logo" />
          <div style={{ width: '90%', maxWidth: '800px' }}>
            <SearchBox componentRef={searchBoxRef} placeholder="Search" onSearch={(newValue) => onSetSearchText(newValue)} />
          </div>
        </Stack>
      </AuthenticatedTemplate>

      <UnauthenticatedTemplate>
        <UnauthenticatedComponent />
      </UnauthenticatedTemplate>
    </Stack>
  );
};

export default HomePage;

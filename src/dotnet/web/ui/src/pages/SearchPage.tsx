import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import {
  DefaultButton,
  DetailsList,
  DetailsListLayoutMode,
  MessageBar,
  MessageBarType,
  ProgressIndicator,
  SelectionMode,
  Stack,
  TextField,
  TooltipHost,
} from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import ListSearchCommandBar from '../components/ListSearchCommandBar';
import ListSearchCommandBarPagination from '../components/ListSearchCommandBarPagination';
import ListSearchFacets from '../components/ListSearchFacets';
import ListSearchResultsItems from '../components/ListSearchResultsItems';
import UnauthenticatedComponent from '../components/UnauthenticatedComponent';
import { useApiAccessToken } from '../hooks/useApiAccessToken';
import { useAppInsights } from '../hooks/useAppInsights';
import { useSearch } from '../hooks/useSearch';
import { useSearchIndexParams } from '../hooks/useSearchIndexParams';
import { useVideosSearch } from '../hooks/useVideosSearch';
import { Filter, SearchContextType, SearchType } from '../types';

const SearchPage: React.FunctionComponent = () => {
  const appInsights = useAppInsights();
  const { apiAccessToken } = useApiAccessToken();
  const [searchContext, setSearchContext] = useSearch();
  const [count, setCount] = useState(0);
  const [inputSearchText, setInputSearchText] = useState<string>('');
  const [canDoSearch, setCanDoSearch] = useState(false);
  const [searchIndexParams, setSearchIndexParams] = useSearchIndexParams();
  const [filters, setFilters] = useState<Filter[]>([]);
  const { videosSearch } = useVideosSearch(filters);

  const onSetSearchContext = useCallback(() => {
    setFilters([]);
    setSearchContext((prev) => {
      let uuid: string;

      // used to track onSearch event, occurs only if there is a new text search
      if (prev?.searchText !== searchIndexParams?.searchText) {
        uuid = uuidv4().replace(/-/gi, '');

        appInsights.trackEvent({
          name: 'onSearch',
          properties: {
            queryId: uuid,
            query: searchIndexParams?.searchText,
          },
        });
      } else {
        uuid = prev?.searchId;
      }

      let returnValue: SearchContextType = {
        searchId: uuid,
        searchText: searchIndexParams.searchText,
        size: searchIndexParams.size,
        page: searchIndexParams.page,
        searchType: searchIndexParams.searchType,
        searchMode: searchIndexParams.searchMode,
        time: searchIndexParams.time,
      };

      return returnValue;
    });
  }, [appInsights, searchIndexParams, setSearchContext]);

  /***
   * Event raised when user clic on search button
   */
  const onClick = useCallback(() => {
    setSearchIndexParams({ searchText: inputSearchText, page: 1 });
    onSetSearchContext();
  }, [inputSearchText, onSetSearchContext, setSearchIndexParams]);

  /***
   * Event raised when user hits enter from search input text
   */
  const onTextFieldKeyDown = (e: { key: string }) => {
    if (e.key === 'Enter') {
      setSearchIndexParams({ searchText: inputSearchText, page: 1 });
      onSetSearchContext();
    }
  };

  /**
   * Event raised when a keyboard key is entered in the search input text
   */
  const onValueChange = (newValue: string) => {
    setCanDoSearch(!!newValue);
    setInputSearchText(newValue);
  };

  /**
   * Update state when
   * - any search params is modified
   */
  useEffect(() => {
    // hook called when search params are evolving
    // and will execute only if api access token is loaded
    if (searchIndexParams.searchText) {
      window.scrollTo(0, 0);
      // Set search context correctly
      onSetSearchContext();
      // set input text box to correct value
      setCanDoSearch(!!searchIndexParams.searchText);
      setInputSearchText(searchIndexParams.searchText);
    }
  }, [onSetSearchContext, searchIndexParams]);

  /**
   * Update state when
   * - video is fetched
   * - we have some results,
   * - app insights is ready
   */
  useEffect(() => {
    if (videosSearch.isFetched && videosSearch.results) {
      let results = videosSearch.results.map((result) => {
        return {
          score: result.score,
          videoId: result.document.videoId,
        };
      });

      appInsights.trackEvent({
        name: 'onSearchResults',
        properties: {
          queryId: searchContext.searchId,
          results: results,
          resultsPageCount: results.length,
          resultsTotalCount: videosSearch.count,
          page: searchIndexParams.page,
          pageSize: searchIndexParams.size,
        },
      });
    }

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [appInsights, videosSearch.isFetched, videosSearch.results]);

  // once we have the count, affect it
  useEffect(() => {
    setCount(videosSearch?.count ?? 0);
  }, [videosSearch]);

  return (
    <>
      <AuthenticatedTemplate>
        <Stack style={{ width: '100%' }}>
          <Stack horizontal tokens={{ childrenGap: 10, padding: 5 }} wrap id="gniiii" styles={{ inner: { alignItems: 'center' } }}>
            <TextField
              styles={{ root: { minWidth: '210px', maxWidth: '300px' } }}
              placeholder="Search"
              role="textbox"
              value={inputSearchText}
              onChange={(e, newvalue) => onValueChange(newvalue)}
              onKeyDown={onTextFieldKeyDown}
            />

            <TooltipHost
              content={searchIndexParams.searchType === SearchType.EXACT ? 'Make an exact search' : 'Make a fuzzy search'}
              id="{tooltipId}"
              setAriaDescribedBy={false}
            >
              <DefaultButton
                primary
                disabled={!canDoSearch}
                iconProps={{ iconName: searchIndexParams.searchType === SearchType.EXACT ? 'Search' : 'BranchSearch' }}
                onClick={onClick}
                ariaLabel="Search"
                splitButtonAriaLabel="See 2 options for search Fuzzy or Exact"
              />
            </TooltipHost>
            <ListSearchCommandBar
              count={count}
              isLoading={videosSearch && videosSearch.isLoading}
              showItemsCount={true}
              showPagination={true}
              showMode={true}
              showTimeInterval={true}
              showSizeDropDownList={true}
            />
          </Stack>

          <div style={{ position: 'relative' }}>
            <div style={{ position: 'absolute', top: '0', left: '0', width: '302px' }}>
              <Stack>
                <DetailsList
                  compact={true}
                  selectionMode={SelectionMode.none}
                  setKey="set"
                  items={[]}
                  columns={[
                    {
                      key: 'column1',
                      name: 'Facets',
                      fieldName: 'Facets',
                      minWidth: 100,
                      maxWidth: 200,
                      isResizable: false,
                      styles: { root: { justifyContent: 'center' } },
                    },
                  ]}
                  layoutMode={DetailsListLayoutMode.justified}
                />
                {videosSearch && videosSearch.facets && videosSearch.facets.length > 0 && (
                  <ListSearchFacets facets={videosSearch.facets} apiAccessToken={apiAccessToken} filters={filters} setFilters={setFilters} />
                )}
              </Stack>
            </div>
            <div style={{ position: 'absolute', top: '0', left: '305px', right: '10px' }}>
              <Stack>
                {videosSearch && videosSearch.results && videosSearch.results.length > 0 && (
                  <ListSearchResultsItems items={videosSearch} apiAccessToken={apiAccessToken} />
                )}

                {videosSearch && videosSearch.isLoading && <ProgressIndicator />}
                {videosSearch && !videosSearch.isLoading && !videosSearch.results && (
                  <MessageBar>Use the search input to perform a search in the index</MessageBar>
                )}
                {videosSearch && !videosSearch.isLoading && videosSearch.results && videosSearch.results.length <= 0 && (
                  <MessageBar messageBarType={MessageBarType.severeWarning}>No results</MessageBar>
                )}
                <ListSearchCommandBarPagination count={count} isLoading={videosSearch && videosSearch.isLoading} />
              </Stack>
            </div>
          </div>
        </Stack>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <UnauthenticatedComponent />
      </UnauthenticatedTemplate>
    </>
  );
};

export default SearchPage;

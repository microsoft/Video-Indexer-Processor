import { Dropdown, DropdownMenuItemType, Icon, IDropdownOption, IDropdownProps } from '@fluentui/react';
import * as React from 'react';
import { useCallback, useMemo } from 'react';
import { useSearchIndexParams } from '../hooks/useSearchIndexParams';
import { SearchMode, SearchType } from '../types';

const ListSearchPaginationMode: React.FunctionComponent = (props) => {
  const [searchIndexParams, setSearchIndexParams] = useSearchIndexParams();

  const onRenderOption = (option: IDropdownOption): JSX.Element => {
    return (
      <div>
        {option.data && option.data.icon && <Icon style={{ marginRight: '8px' }} iconName={option.data.icon} aria-hidden="true" title={option.data.icon} />}
        <span>{option.text}</span>
      </div>
    );
  };

  const onRenderTitle = useCallback(
    (options: IDropdownOption[]): JSX.Element => {
      return (
        <div>
          {searchIndexParams && (
            <>
              <Icon
                style={{ marginLeft: '8px', marginRight: '8px' }}
                iconName={searchIndexParams.searchMode === SearchMode.ANY ? 'UniteShape' : 'IntersectShape'}
                aria-hidden="true"
                title={searchIndexParams.searchMode}
              />
              <span>{searchIndexParams.searchMode === SearchMode.ANY ? 'Any Criterias' : 'All Criterias'}</span>
              <Icon
                style={{ marginLeft: '8px', marginRight: '8px' }}
                iconName={searchIndexParams.searchType === SearchType.EXACT ? 'Search' : 'BranchSearch'}
                aria-hidden="true"
                title={searchIndexParams.searchType}
              />
              <span>{searchIndexParams.searchType === SearchType.EXACT ? 'Exact Search' : 'Fuzzy Search'}</span>
            </>
          )}
        </div>
      );
    },
    [searchIndexParams],
  );

  const onRenderPlaceholder = (props: IDropdownProps): JSX.Element => {
    return (
      <div className="dropdownExample-placeholder">
        <Icon style={{ marginRight: '10px' }} iconName={'SearchBookmark'} aria-hidden="true" />
        <span>{props.placeholder}</span>
      </div>
    );
  };

  const onChange = (event: React.FormEvent<HTMLDivElement>, item: IDropdownOption): void => {
    if (item) {
      if (item.key === SearchType.FUZZY || item.key === SearchType.EXACT) {
        setSearchIndexParams({ searchType: item.key as SearchType, page: 1 });
      }
      if (item.key === SearchMode.ALL || item.key === SearchMode.ANY) {
        setSearchIndexParams({ searchMode: item.key as SearchMode, page: 1 });
      }
    }
  };

  const searchOptions: IDropdownOption[] = [
    { key: 'SearchType', text: 'Search Type', itemType: DropdownMenuItemType.Header },
    { key: SearchType.FUZZY, text: 'Fuzzy Search', data: { icon: 'BranchSearch' } },
    { key: SearchType.EXACT, text: 'Exact Search', data: { icon: 'Search' } },
    { key: 'divider_1', text: '-', itemType: DropdownMenuItemType.Divider },
    { key: 'SearchMode', text: 'Search Mode', itemType: DropdownMenuItemType.Header },
    { key: SearchMode.ALL, text: 'All Criterias', data: { icon: 'IntersectShape' } },
    { key: SearchMode.ANY, text: 'Any Criterias', data: { icon: 'UniteShape' } },
  ];

  const selectedKeys = useMemo(() => {
    if (searchIndexParams) {
      let t = [searchIndexParams.searchMode, searchIndexParams.searchType];
      return t;
    }
  }, [searchIndexParams]);

  return (
    <Dropdown
      style={{ width: '250px' }}
      placeholder="Search Options"
      ariaLabel="Search Options"
      multiSelect
      onRenderPlaceholder={onRenderPlaceholder}
      onRenderTitle={onRenderTitle}
      onRenderOption={onRenderOption}
      onChange={onChange}
      styles={{ dropdown: { width: 250 } }}
      options={searchOptions}
      selectedKeys={selectedKeys}
    />
  );
};

export default ListSearchPaginationMode;

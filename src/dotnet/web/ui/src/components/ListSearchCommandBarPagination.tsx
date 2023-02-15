import { CommandBar, ICommandBarItemProps, IContextualMenuItem } from '@fluentui/react';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import { useSearchIndexParams } from '../hooks/useSearchIndexParams';

interface IListSearchCommandBarPaginationProps {
  count?: number;
  isLoading?: boolean;
}

const ListSearchCommandBarPagination: React.FunctionComponent<IListSearchCommandBarPaginationProps> = (props) => {
  const [searchIndexParams, setSearchIndexParams] = useSearchIndexParams();
  const [paginationString, setPaginationString] = useState('0 / 0');

  const onClickPage = useCallback(
    (_ev?: any, item?: IContextualMenuItem) => {
      let maxPage = props.count > 0 ? Math.ceil(props.count / searchIndexParams.size) : 1;
      switch (item.key) {
        case 'First':
          setSearchIndexParams({ page: 1 });
          break;
        case 'Previous':
          setSearchIndexParams({ page: searchIndexParams.page <= 1 ? 1 : searchIndexParams.page - 1 });
          break;
        case 'Next':
          setSearchIndexParams({ page: searchIndexParams.page >= maxPage ? maxPage : searchIndexParams.page + 1 });
          break;
        case 'Last':
          setSearchIndexParams({ page: maxPage });
          break;
        default:
          setSearchIndexParams({ page: 1 });
          break;
      }
    },
    [props.count, searchIndexParams.page, searchIndexParams.size, setSearchIndexParams],
  );

  useEffect(() => {
    if (!props.isLoading) {
      setPaginationString(props.count === 0 ? '0 / 0' : searchIndexParams.page + ' / ' + Math.ceil(props.count / searchIndexParams.size));
    }
  }, [props, searchIndexParams]);

  const paginationItems: ICommandBarItemProps[] = [
    {
      iconOnly: true,
      key: 'First',
      title: 'First',
      text: 'First',
      ariaLabel: 'First',
      ariaDescription: 'First page',
      iconProps: { iconName: 'DoubleChevronLeft12' },
      disabled: searchIndexParams.page <= 1,
      onClick: onClickPage,
    },
    {
      iconOnly: true,
      key: 'Previous',
      title: 'Previous',
      text: 'Previous',
      ariaLabel: 'Previous',
      ariaDescription: 'Previous page',
      iconProps: { iconName: 'ChevronLeft' },
      disabled: searchIndexParams.page <= 1,
      onClick: onClickPage,
    },
    {
      // iconOnly: props.count <= 0,
      // iconProps: props.count <= 0 ? { iconName: 'ConstructionCone' } : {},
      key: 'Current',
      ariaLabel: 'Current page',
      ariaDescription: 'Current page',
      text: paginationString,
      buttonStyles: {
        root: {
          width: '60px',
        },
        rootHovered: {
          cursor: 'default',
          background: 'transparent',
        },
        rootPressed: {
          background: 'transparent',
        },
      },
    },
    {
      iconOnly: true,
      key: 'Next',
      title: 'Next',
      text: 'Next',
      ariaLabel: 'Next',
      ariaDescription: 'Next page',
      iconProps: { iconName: 'ChevronRight' },
      disabled: searchIndexParams.page >= Math.ceil(props.count / searchIndexParams.size),
      onClick: onClickPage,
    },
    {
      iconOnly: true,
      key: 'Last',
      title: 'Last',
      text: 'Last',
      ariaLabel: 'Last',
      ariaDescription: 'Last page',
      iconProps: { iconName: 'DoubleChevronRight12' },
      disabled: searchIndexParams.page >= Math.ceil(props.count / searchIndexParams.size),
      onClick: onClickPage,
    },
  ];

  return <CommandBar items={paginationItems} ariaLabel="pagination" styles={{ root: { padding: 0, width: 240, minWidth: 240 } }} />;
};

export default ListSearchCommandBarPagination;

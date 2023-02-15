import { DetailsListLayoutMode, IColumn, Point, SelectionMode, ShimmeredDetailsList, Stack, Text, TooltipHost } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { UseQueryResult } from 'react-query';
import { formatNumberToTime, parseArrayToString } from '../helpers';
import { SearchResult } from '../types/VideoIndex';
import ListSearchContextMenu from './ListSearchContextMenu';
import ListSearchResultsItem from './ListSearchResultsItem';
import Thumbnail from './Thumbnail';

interface IListSearchResultsItemsProps {
  apiAccessToken: string;
  items: SearchResult & UseQueryResult<any, any>;
}

const ListSearchResultsItems: React.FunctionComponent<IListSearchResultsItemsProps> = (props) => {
  // items in the list
  const [items, setItems] = useState(
    props.items.isFetched
      ? props.items.results.map((item, index) => {
          item.document.rank = index + 1;
          return item.document;
        })
      : [],
  );

  // columns, ordered descending or ascending depending on user's choice
  const [columns, setColumns] = useState<IColumn[]>();

  // current sorted column
  const [sortedColumn, setSortedColumn] = useState<{ columnFieldName: string; isSortedDescending: boolean }>({
    columnFieldName: 'score',
    isSortedDescending: true,
  });

  // coordinates when user right click on the list
  const [coordPoints, setCoordPoints] = useState<Point>();

  // visibility of the context menu
  const [showContextualMenu, setShowContextualMenu] = useState(false);

  // selected item (usually when a user right click on a line)
  const [selectedItemRow, setSelectedItemRow] = useState<any>({});

  // simple copy & sort items algorithm
  const sortItems = (items: any[], fieldName: string, isSortedDescending: boolean) => {
    let sortedItems = items.slice(0).sort((a: any, b: any) => ((isSortedDescending ? a[fieldName] < b[fieldName] : a[fieldName] > b[fieldName]) ? 1 : -1));
    return sortedItems;
  };

  // set sort column as the one clicked by the user
  const onColumnHeaderClick = (ev?: React.MouseEvent<HTMLElement>, column?: IColumn) => {
    setSortedColumn({
      isSortedDescending: !column.isSortedDescending,
      columnFieldName: column.fieldName,
    });
  };

  // when user right click on a line, we get the coords, send them to list search context menu
  const onItemContexMenu = (item?: any, index?: number, ev?: PointerEvent) => {
    setCoordPoints({ x: ev.x, y: ev.y });
    setShowContextualMenu(true);
    setSelectedItemRow(item);
  };

  // on render and when items are fetched, set items
  useEffect(() => {
    // when loading, set items to 0, to show shimmer
    if (props.items.isLoading) setItems([]);
    // Once loaded set the items
    if (props.items.isFetched && props.items.count > 0) {
      let newItems = props.items.results.map((item) => {
        return { score: item.score, ...item.document };
      });

      let sortedItems = sortItems(newItems, sortedColumn.columnFieldName, sortedColumn.isSortedDescending);
      setItems(sortedItems);
    }
    return () => {
      setItems([]);
    };
  }, [props.items.count, props.items.isFetched, props.items.isLoading, props.items.results, sortedColumn.columnFieldName, sortedColumn.isSortedDescending]);

  // update columns when items are changing (because of fetch or re order)
  useEffect(() => {
    let columns: IColumn[] = [
      {
        key: 'thumbnailColumn',
        name: 'thumbnail',
        ariaLabel: 'Thumbnail of the video described on the row',
        iconName: 'VideoSearch',
        isIconOnly: true,
        fieldName: 'score',
        minWidth: items && items.length > 0 ? 160 : 38,
        maxWidth: items && items.length > 0 ? 160 : 38,
        isSorted: sortedColumn.columnFieldName === 'score',
        isSortedDescending: sortedColumn.isSortedDescending,
        isCollapsible: false,
        onRender: (document: any) => (
          <Stack horizontalAlign="start">
            <TooltipHost content={`${Math.round(document.score)}`} style={{ alignContent: 'flex-start' }}>
              <Thumbnail videoId={document.videoId} thumbnailId={document.thumbnailId} accessToken={props.apiAccessToken} height={90} />
            </TooltipHost>
          </Stack>
        ),
      },
      {
        key: 'nameColumn',
        name: 'Name',
        fieldName: 'metadata_matching_video_name',
        minWidth: 300,
        maxWidth: 700,
        isResizable: true,
        isCollapsible: true,
        isSorted: sortedColumn.columnFieldName === 'metadata_matching_video_name',
        isSortedDescending: sortedColumn.isSortedDescending,
        onRender: (document: any) => (
          <Stack>
            <Text variant="medium" style={{ fontWeight: 'bold' }}>
              {document.metadata_matching_video_name}
            </Text>
          </Stack>
        ),
      },
      {
        key: 'keywordsColumn',
        name: 'Keywords',
        fieldName: 'metadata_keywords',
        minWidth: 100,
        maxWidth: 140,
        isCollapsible: true,
        isResizable: true,
        isSorted: sortedColumn.columnFieldName === 'metadata_keywords',
        isSortedDescending: sortedColumn.isSortedDescending,
        onRender: (document: any) => (
          <TooltipHost content={`${parseArrayToString(document.metadata_keywords, ',')}`} style={{ alignContent: 'flex-start', width: 'auto' }}>
            <Text variant="medium">{parseArrayToString(document.metadata_keywords, ',')}</Text>
          </TooltipHost>
        ),
      },
      {
        key: 'datasourceColumn',
        name: 'Datasource',
        fieldName: 'metadata_data_source',
        minWidth: 100,
        maxWidth: 140,
        isCollapsible: true,
        isResizable: true,
        isSorted: sortedColumn.columnFieldName === 'metadata_data_source',
        isSortedDescending: sortedColumn.isSortedDescending,
        onRender: (document: any) => (
          <Stack>
            <Text variant="medium" style={{ fontWeight: 'bold' }}>
              {document.metadata_data_source}
            </Text>
          </Stack>
        ),
      },
      {
        key: 'firstCreationDateColumn',
        name: 'First Creation Date',
        fieldName: 'metadata_first_creation_date',
        minWidth: 140,
        maxWidth: 200,
        isCollapsible: true,
        isResizable: true,
        isSorted: sortedColumn.columnFieldName === 'metadata_first_creation_date',
        isSortedDescending: sortedColumn.isSortedDescending,
        onRender: (document: any) => (
          <Text variant="medium">{document.metadata_first_creation_date ? new Date(document.metadata_first_creation_date).toLocaleString() : ''}</Text>
        ),
      },
      {
        key: 'durationColumn',
        name: 'Duration',
        fieldName: 'duration_in_seconds',
        minWidth: 80,
        isCollapsible: true,
        isResizable: true,
        isSorted: sortedColumn.columnFieldName === 'duration_in_seconds',
        isSortedDescending: sortedColumn.isSortedDescending,
        onRender: (document: any) => <Text>{document.duration_in_seconds ? formatNumberToTime(document.duration_in_seconds) : ''} </Text>,
      },
    ];
    setColumns(columns);

    return () => {
      setColumns([]);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [items]);

  return (
    <>
      <ListSearchContextMenu
        coordPoints={coordPoints}
        selectedItemRow={selectedItemRow}
        showContextualMenu={showContextualMenu}
        setShowContextualMenu={setShowContextualMenu}
      />
      <ShimmeredDetailsList
        compact={true}
        onItemContextMenu={onItemContexMenu}
        onRenderRow={(props) => <ListSearchResultsItem detailsListProps={props} />}
        onColumnHeaderClick={onColumnHeaderClick}
        items={items}
        columns={columns}
        enableShimmer={props.items.isLoading}
        selectionMode={SelectionMode.none}
        setKey="set"
        layoutMode={DetailsListLayoutMode.justified}
        selectionPreservedOnEmptyClick={true}
        shimmerLines={5}
      />
    </>
  );
};

export default ListSearchResultsItems;

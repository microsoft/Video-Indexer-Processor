import { Label, Stack } from '@fluentui/react';
import * as React from 'react';
import CalloutDate from './CalloutDate';
import ListSearchCommandBarPagination from './ListSearchCommandBarPagination';
import ListSearchCommandBarSize from './ListSearchCommandBarSize';
import ListSearchPaginationMode from './ListSearchPaginationMode';

interface IListSearchCommandBarProps {
  count?: number;
  isLoading?: boolean;
  showPagination: boolean;
  showSizeDropDownList: boolean;
  showItemsCount: boolean;
  showMode: boolean;
  showTimeInterval: boolean;
}

const ListSearchCommandBar: React.FunctionComponent<IListSearchCommandBarProps> = (props) => {
  return (
    <>
      {props.showSizeDropDownList && <ListSearchCommandBarSize />}
      {props.showMode && <ListSearchPaginationMode />}
      {props.showTimeInterval && <CalloutDate />}
      {props.showItemsCount && <Label>{props.count > 0 ? `${props.count} items found` : ''}</Label>}
      <Stack horizontal horizontalAlign="end" style={{ flex: '1', marginRight: '10px' }}>
        {props.showPagination && <ListSearchCommandBarPagination count={props.count} isLoading={props.isLoading} />}
      </Stack>
    </>
  );
};

export default ListSearchCommandBar;

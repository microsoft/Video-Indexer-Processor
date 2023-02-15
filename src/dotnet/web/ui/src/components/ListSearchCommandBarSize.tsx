import { Dropdown, DropdownMenuItemType, IDropdownOption } from '@fluentui/react';
import * as React from 'react';
import { useSearchIndexParams } from '../hooks/useSearchIndexParams';

const ListSearchCommandBarSize: React.FunctionComponent = (props) => {
  const [searchIndexParams, setSearchIndexParams] = useSearchIndexParams();

  const onSizeChanged = (event: React.FormEvent<HTMLDivElement>, option?: IDropdownOption, index?: number) => {
    setSearchIndexParams({ page: 1, size: +option.key });
  };

  return (
    <Dropdown
      style={{ width: '210px' }}
      selectedKey={searchIndexParams.size.toString()}
      onChange={onSizeChanged}
      placeholder="Items per page"
      options={[
        { key: 'itemsperpage', text: 'Items per page', itemType: DropdownMenuItemType.Header },
        { key: '5', text: '5 items per page' },
        { key: '10', text: '10 items per page' },
        { key: '20', text: '20 items per page' },
        { key: '50', text: '50 items per page' },
        { key: '100', text: '100 items per page' },
      ]}
      styles={{
        dropdown: { width: 300 },
      }}
    />
  );
};

export default ListSearchCommandBarSize;

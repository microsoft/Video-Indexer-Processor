import { ContextualMenu, IContextualMenuItem, ITheme, Point, useTheme as useFluentTheme } from '@fluentui/react';
import copyToClipboard from 'copy-to-clipboard';
import * as React from 'react';
import { Dispatch, SetStateAction } from 'react';
import toast from 'react-hot-toast';
import { parseArrayToString } from '../helpers';

interface IListSearchContextMenuProps {
  selectedItemRow: any;
  coordPoints: Point;
  showContextualMenu: boolean;
  setShowContextualMenu: Dispatch<SetStateAction<boolean>>;
}

const copy = (str: string, strType: string, fluentUiTheme: ITheme) => {
  copyToClipboard(str);
  toast.success(`Successfully copied ${strType}: ${str}`, {
    style: {
      borderRadius: '0px',
      background: fluentUiTheme.palette.white,
      border: '1px solid ' + fluentUiTheme.palette.themePrimary,
      padding: '16px',
      color: fluentUiTheme.palette.themePrimary,
    },
    iconTheme: {
      primary: fluentUiTheme.palette.themePrimary,
      secondary: '#FFFAEE',
    },
  });
};

const ListSearchContextMenu: React.FunctionComponent<IListSearchContextMenuProps> = ({
  selectedItemRow,
  coordPoints,
  showContextualMenu,
  setShowContextualMenu,
}) => {
  const fluentUiTheme = useFluentTheme();

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'copyKeywords',
      text: 'Copy Keywords',
      iconProps: { iconName: 'CalendarAgenda' },
      onClick: () => copy(parseArrayToString(selectedItemRow?.metadata_keywords, ','), 'Keywords', fluentUiTheme),
    },
  ];

  return (
    <ContextualMenu
      items={menuItems}
      onItemClick={() => setShowContextualMenu(false)}
      target={coordPoints}
      onDismiss={() => setShowContextualMenu(false)}
      hidden={!showContextualMenu}
    />
  );
};

export default ListSearchContextMenu;

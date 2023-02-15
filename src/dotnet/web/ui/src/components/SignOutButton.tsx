import { useMsal } from '@azure/msal-react';
import { ContextualMenu, ContextualMenuItemType, IContextualMenuItem, Link, Persona, PersonaInitialsColor, PersonaSize, Stack } from '@fluentui/react';
import { useCallback, useEffect, useRef, useState } from 'react';

export const SignOutButton = () => {
  const { instance, accounts } = useMsal();
  const [accountName, setAccountName] = useState<string>();
  const linkRef = useRef(null);

  const handleLogout = (ev: React.MouseEvent<HTMLElement>) => {
    instance.logoutRedirect();
  };

  const [showContextualMenu, setShowContextualMenu] = useState(false);
  const onShowContextualMenu = useCallback((ev: React.MouseEvent<HTMLElement>) => {
    ev.preventDefault(); // don't navigate
    setShowContextualMenu(true);
  }, []);
  const onHideContextualMenu = useCallback(() => setShowContextualMenu(false), []);

  useEffect(() => {
    if (accounts && accounts.length > 0) {
      setAccountName(accounts[0].name ?? accounts[0].username);
    }
  }, [accounts]);

  const menuItems: IContextualMenuItem[] = [
    {
      key: 'onLOgout',
      text: 'Sign Out',
      onClick: handleLogout,
    },
    {
      key: 'divider_1',
      itemType: ContextualMenuItemType.Divider,
    },
  ];

  return (
    <div>
      <Stack>
        <Link
          onClick={onShowContextualMenu}
          ref={linkRef}
          styles={{
            root: {
              color: '#FFFFFF',
              marginRight: 10,
              textDecoration: 'none',
              selectors: {
                ':hover': { textDecoration: 'none' },
                ':active': { textDecoration: 'none' },
                ':link': { textDecoration: 'none' },
              },
            },
          }}
        >
          <Stack horizontal verticalAlign={'center'}>
            <Persona
              size={PersonaSize.size32}
              initialsColor={PersonaInitialsColor.pink}
              color="#FFFFFF"
              styles={{
                root: {
                  color: '#FFFFFF',
                  marginRight: 10,
                  textDecoration: 'none',
                  selectors: {
                    ':hover': { textDecoration: 'none' },
                    ':active': { textDecoration: 'none' },
                    ':link': { textDecoration: 'none' },
                  },
                },
                primaryText: {
                  color: '#FFFFFF',
                  marginRight: 10,
                  textDecoration: 'none',
                  selectors: {
                    ':hover': { color: '#FFFFFF', textDecoration: 'none' },
                    ':active': { color: '#FFFFFF', textDecoration: 'none' },
                    ':link': { color: '#FFFFFF', textDecoration: 'none' },
                  },
                },
              }}
              text={accountName}
            />
          </Stack>
        </Link>
        <ContextualMenu target={linkRef} items={menuItems} hidden={!showContextualMenu} onItemClick={onHideContextualMenu} onDismiss={onHideContextualMenu} />
      </Stack>
    </div>
  );
};

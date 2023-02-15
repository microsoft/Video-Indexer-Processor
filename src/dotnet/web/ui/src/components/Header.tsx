import * as React from 'react';
import './Header.scss';

/* istanbul ignore next */
import { useBoolean } from '@fluentui/react-hooks';
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import {
  ChoiceGroup,
  DefaultButton,
  FontWeights,
  IChoiceGroupOption,
  Image,
  IStackStyles,
  IStackTokens,
  Link,
  Panel,
  PrimaryButton,
  Stack,
  Text,
  useTheme as useFluentTheme,
} from '@fluentui/react';
import { useTheme } from '../hooks/useTheme';

import { useNavigate } from 'react-router-dom';
import logo30 from '../images/logo-30.png';
import blackTheme from '../images/blackTheme.png';
import whiteTheme from '../images/whiteTheme.png';
import { SignInSignOutButton } from './SignInSignOutButton';
import { useDashboard } from '../hooks/useDashboard';

const Header: React.FunctionComponent = (): React.ReactElement => {
  const fluentTheme = useFluentTheme();
  const [theme, setTheme] = useTheme();
  const [isOpen, { setTrue: openPanel, setFalse: dismissPanel }] = useBoolean(false);
  const { url } = useDashboard();

  const navigate = useNavigate();

  const navToHome = () => {
    navigate(`/`, { replace: true });
  };

  const onRenderFooterContent = React.useCallback(
    () => (
      <div>
        <PrimaryButton onClick={dismissPanel} styles={{ root: { marginRight: 8 } }}>
          Save
        </PrimaryButton>
        <DefaultButton onClick={dismissPanel}>Cancel</DefaultButton>
      </div>
    ),
    [dismissPanel],
  );

  const itemStyles: React.CSSProperties = {
    alignItems: 'center',
    // background: DefaultPalette.themePrimary,
    color: 'white',
    display: 'flex',
    height: 50,
    justifyContent: 'center',
    width: 56,
    paddingLeft: 3,
  };

  const loginStyles: React.CSSProperties = {
    alignItems: 'center',
    color: 'white',
    display: 'flex',
    justifyContent: 'center',
    width: 'auto',
    paddingLeft: 8,
    paddingRight: 10,
    height: 50,
    textDecoration: 'none',
  };

  const stackStyles: IStackStyles = {
    root: [
      {
        background: theme === 'lightTheme' ? fluentTheme.palette.themePrimary : fluentTheme.palette.neutralLighter,
        marginLeft: 0,
        marginRight: 0,
        height: 'auto',
        width: `100%`,
        position: 'fixed',
        top: 0,
        left: 0,
        zIndex: 1000,
      },
    ],
  };
  const stackTokens: IStackTokens = { childrenGap: 5 };

  const options: IChoiceGroupOption[] = [
    {
      key: 'lightTheme',
      imageSrc: whiteTheme,
      imageAlt: 'White theme',
      selectedImageSrc: whiteTheme,
      imageSize: { width: 56, height: 36 },
      text: 'White',
    },
    {
      key: 'darkTheme',
      imageSrc: blackTheme,
      imageAlt: 'Black Theme',
      selectedImageSrc: blackTheme,
      imageSize: { width: 56, height: 36 },
      text: 'Black',
    },
  ];

  return (
    <>
      <Stack tokens={stackTokens} styles={stackStyles}>
        <Stack horizontal horizontalAlign="space-between">
          <Stack horizontal verticalAlign="center" className="header">
            <Link style={itemStyles} onClick={navToHome}>
              <Image alt="Icon" src={logo30} height="60%" />
            </Link>
          </Stack>

          <Stack horizontal verticalAlign="center" className="header">
            <Link aria-label="Settings" style={itemStyles} onClick={openPanel}>
              <FontAwesomeIcon icon={faCog} />
            </Link>
            <div style={loginStyles}>
              <SignInSignOutButton />
            </div>
          </Stack>
        </Stack>
      </Stack>

      <Panel
        isOpen={isOpen}
        onDismiss={dismissPanel}
        headerText="User Settings"
        closeButtonAriaLabel="Close"
        onRenderFooterContent={onRenderFooterContent}
        // Stretch panel content to fill the available height so the footer is positioned
        // at the bottom of the page
        isFooterAtBottom={true}
      >
        <Stack tokens={{ childrenGap: 20, padding: '10px 0px 0px 0px' }}>
          <Text variant="large" block style={{ fontWeight: FontWeights.bold }}>
            Theme
          </Text>
          <ChoiceGroup label="Choose a theme" defaultSelectedKey="whiteTheme" options={options} onChange={(e, o) => setTheme(o.key)} />
          <Text variant="large" block style={{ fontWeight: FontWeights.bold }}>
            Dashboard
          </Text>
          <Stack horizontal tokens={{ childrenGap: 20, padding: '10px 0px 0px 0px' }} styles={{ root: { paddingLeft: '20px' } }}>
            <Link href={url} target="_blank">
              Azure Dashboard
            </Link>
          </Stack>
        </Stack>
      </Panel>
    </>
  );
};

export default Header;

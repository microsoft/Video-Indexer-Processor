import logo30 from '../images/logo-30.png';

import { Image, Stack, Text } from '@fluentui/react';
import * as React from 'react';

interface IUnauthenticatedComponentProps {}

const UnauthenticatedComponent: React.FunctionComponent<IUnauthenticatedComponentProps> = (props) => {
  return (
    <>
      <Stack tokens={{ childrenGap: 10 }} horizontal horizontalAlign="center" verticalAlign="center" style={{ height: '80vh' }}>
        <Image src={logo30} />
        <Text variant="xLargePlus">Please sign-in.</Text>
      </Stack>
    </>
  );
};

export default UnauthenticatedComponent;

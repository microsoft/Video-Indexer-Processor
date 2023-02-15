import logo30 from '../images/logo-30.png';

import * as React from 'react';
import { Stack, Text, Image } from '@fluentui/react';

interface INothingHereComponentProps {}

const NothingHereComponent: React.FunctionComponent<INothingHereComponentProps> = (props) => {
  return (
    <>
      <Stack tokens={{ childrenGap: 10 }} horizontal horizontalAlign="center" verticalAlign="center" style={{ height: '80vh' }}>
        <Image src={logo30} />
        <Text variant="large">The url you are trying to reach does not exist.</Text>
      </Stack>
    </>
  );
};

export default NothingHereComponent;

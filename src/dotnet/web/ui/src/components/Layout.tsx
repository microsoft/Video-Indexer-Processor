// import { initializeIcons } from '@fluentui/react';
import { initializeIcons } from '@uifabric/icons';
import { Toaster } from 'react-hot-toast';
import Header from './Header';
import '../fonts/css/fabric-icons.css';

import { initializeIcons as additionalInitializeIcons } from '../fonts/src';

additionalInitializeIcons();
initializeIcons();

const Layout: React.FunctionComponent = (props): React.ReactElement => {
  return (
    <>
      <div>
        <Toaster />
      </div>
      <Header />
      <div className="container-body" role="contentinfo">
        {props.children}
      </div>
    </>
  );
};

export default Layout;

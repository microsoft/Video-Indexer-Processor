import { AccountInfo, InteractionStatus, IPublicClientApplication, Logger } from '@azure/msal-browser';
import { FontSizes, Spinner, SpinnerSize } from '@fluentui/react';

// extract IMsalContext and make all properties nullable
type ILoadingProps = {
  message?: string;
  instance?: IPublicClientApplication;
  inProgress?: InteractionStatus;
  accounts?: AccountInfo[];
  logger?: Logger;
};

// Use the optional prop interface to define the default props
const defaultProps: ILoadingProps = {
  message: 'loading',
  instance: null,
  inProgress: InteractionStatus.None,
  accounts: null,
  logger: null,
};

const Loading: React.FunctionComponent<ILoadingProps> = (props: ILoadingProps) => {
  return (
    <>
      <Spinner
        size={SpinnerSize.large}
        styles={{ label: { fontSize: '28px' }, circle: { fontSizes: FontSizes.mega } }}
        label={props.message}
        ariaLive="assertive"
        labelPosition="right"
      ></Spinner>
    </>
  );
};

// Be sure to set the default props
Loading.defaultProps = defaultProps;

export default Loading;

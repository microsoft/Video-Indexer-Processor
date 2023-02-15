import { ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const reactPlugin = new ReactPlugin();
const appInsights = new ApplicationInsights({
  config: {
    instrumentationKey: process.env.REACT_APP_APPINSIGHTS_KEY,
    enableAutoRouteTracking: true,
    extensions: [reactPlugin],
  },
});

appInsights.loadAppInsights();

export { reactPlugin, appInsights };

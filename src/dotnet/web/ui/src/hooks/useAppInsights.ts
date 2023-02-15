import { AppInsightsContext, ReactPlugin } from '@microsoft/applicationinsights-react-js';
import { useContext } from 'react';

export const useAppInsights = () => useContext<ReactPlugin>(AppInsightsContext);

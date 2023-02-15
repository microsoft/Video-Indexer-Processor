import { AccountLocation, IBaseStyleConfig, IInsightsWidgetConfig, InsightsWidget } from '@azure/video-indexer-widgets';
import { useTheme as useFluentTheme } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useRef } from 'react';
import { useTheme } from '../hooks/useTheme';
interface IVideoAnalyzerInsightsProps {
  accessToken?: string;
  videoId?: string;
  accountId?: string;
  issuerLocation?: string;
}

const VideoAnalyzerInsights: React.FunctionComponent<IVideoAnalyzerInsightsProps> = (props) => {
  const insightsRef = useRef<HTMLDivElement>();
  const fluentUiTheme = useFluentTheme();
  const [theme] = useTheme();

  useEffect(() => {
    if (props.videoId && props.accessToken) {
      const insightsStyleConfig: IBaseStyleConfig = {
        primary: fluentUiTheme.palette.themePrimary,
        highlight: fluentUiTheme.palette.themePrimary,
        bgSecondary: fluentUiTheme.palette.neutralLighter,
        playStatus: fluentUiTheme.palette.themePrimary,
        playStatusAlt: fluentUiTheme.palette.themePrimary,
      };

      const config: IInsightsWidgetConfig = {
        accountId: props.accountId,
        videoId: props.videoId,
        location: props.issuerLocation as AccountLocation,
        accessToken: props.accessToken,
        // locale: 'en-us',
        tab: 'insights',
        style: {
          theme: theme === 'lightTheme' ? 'Default' : 'Dark',
          customStyle: insightsStyleConfig,
        },
      };

      const insightsWidget = new InsightsWidget(
        'insights-container',
        {
          height: '100%',
          width: '100%',
        },
        config,
      );

      insightsRef.current.innerHTML = '';
      insightsWidget.render();
    }
  }, [props.videoId, props.accessToken, props.accountId, fluentUiTheme, theme, props.issuerLocation]);

  return (
    <>
      <div id="insights-container" ref={insightsRef} style={{ width: '100%', height: '100%' }}></div>
    </>
  );
};

export default VideoAnalyzerInsights;

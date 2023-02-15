import { AuthenticatedTemplate, UnauthenticatedTemplate } from '@azure/msal-react';
import {
  ActionButton,
  CommandBar,
  FontIcon,
  getFocusStyle,
  ICommandBarItemProps,
  ITheme,
  List,
  mergeStyleSets,
  Separator,
  Stack,
  Text,
  useTheme as useFluentTheme,
} from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import copyToClipboard from 'copy-to-clipboard';
import * as React from 'react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import toast from 'react-hot-toast';
import { useParams } from 'react-router-dom';
import ClipDialog from '../components/ClipDialog';
import { FeedbackDialog } from '../components/FeedbackDialog';
import Loading from '../components/Loading';
import UnauthenticatedComponent from '../components/UnauthenticatedComponent';
import VideoAnalyzerInsights from '../components/VideoAnalyzerInsights';
import VideoPlayer from '../components/VideoPlayer';
import { decodeJwt, parseArrayToString } from '../helpers';
import { useApiAccessToken } from '../hooks/useApiAccessToken';
import { useApiVIAccessToken } from '../hooks/useApiVIAccessToken';
import { useAppInsights } from '../hooks/useAppInsights';
import { useSearch } from '../hooks/useSearch';
import { useVideoSearchByVideoId } from '../hooks/useVideoSearchByVideoId';
import { useVideoStreamingConfig } from '../hooks/useVideoStreamingConfig';
import { useVideoSubtitles } from '../hooks/useVideoSubtitles';
import { useVideoSummary } from '../hooks/useVideoSummary';
import { StreamingUrl } from '../types';
export type notableItem = { name: string; content: string; icon: string };

const VideoPage: React.FunctionComponent = (props) => {
  const { videoIndexerAccessToken } = useApiVIAccessToken(); // will fetch the video indexer token
  const { apiAccessToken } = useApiAccessToken(); // will fetch the video indexer token
  const [searchVideoId, setSearchVideoId] = useState<string>(); // will store the video Id
  const [searchContext] = useSearch();
  const videoSummary = useVideoSummary(apiAccessToken, searchVideoId); // will fetch the video Summary
  const azureSearchVideo = useVideoSearchByVideoId(apiAccessToken, searchVideoId); // will fetch the video Summary
  const appInsights = useAppInsights();
  const streamingConfig = useVideoStreamingConfig(apiAccessToken, searchVideoId); // will fetch the streaming url & jwt

  const subtitlesEn = useVideoSubtitles(searchVideoId, 'en-us', apiAccessToken);
  const subtitlesFr = useVideoSubtitles(searchVideoId, 'fr-fr', apiAccessToken);
  const subtitlesAr = useVideoSubtitles(searchVideoId, 'ar-SA', apiAccessToken);

  const [subtitlesEnUrl, setSubtitlesEnUrl] = useState<StreamingUrl>();
  const [subtitlesFrUrl, setSubtitlesFrUrl] = useState<StreamingUrl>();
  const [subtitlesArUrl, setSubtitlesArUrl] = useState<StreamingUrl>();

  const [decodedToken, setDecodedToken] = useState<any>();

  const params = useParams();

  const [hideDialogFeedback, { toggle: toggleHideDialogFeedback }] = useBoolean(true);
  const [hideDialogClip, { toggle: toggleHideDialogClip }] = useBoolean(true);

  const videoRef = useRef<HTMLVideoElement>();

  const [items, setItems] = useState([]);

  const fluentUiTheme = useFluentTheme();

  useEffect(() => {
    let items: notableItem[] = [];
    if (azureSearchVideo.document != null) {
      items.push({ name: 'Keywords', content: parseArrayToString(azureSearchVideo.document.metadata_keywords, ','), icon: 'CalendarAgenda' });
    }
    setItems(items);
  }, [azureSearchVideo.document]);

  const onClickShowModalClick = useCallback(() => {
    videoRef.current.pause();
    toggleHideDialogClip();
  }, [toggleHideDialogClip]);

  const copy = (str: string, strType: string, fluentUiTheme: ITheme, addStrToToast = true) => {
    copyToClipboard(str);
    toast.success(`Successfully copied ${strType} ${addStrToToast ? ':' + str : ''}`, {
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

  const rightItems: ICommandBarItemProps[] = useMemo(
    () => [
      {
        onClick: () => {
          copy(azureSearchVideo?.document?.metadata_matching_video_name, 'Video Name', fluentUiTheme);

          appInsights.trackEvent({
            name: 'onCopy',
            properties: {
              queryId: searchContext.searchId,
              videoId: azureSearchVideo?.document?.videoId,
            },
          });
        },
        key: 'copy',
        text: 'Copy Video Name',
        ariaLabel: 'Copy',
        iconProps: { iconName: 'Copy' },
        disabled: azureSearchVideo.isLoading || azureSearchVideo.isError,
      },
      {
        key: 'advancedCopy',
        onClick: () => {
          onClickShowModalClick();

          appInsights.trackEvent({
            name: 'onAdvancedCopy',
            properties: {
              queryId: searchContext.searchId,
              videoId: azureSearchVideo?.document?.videoId,
            },
          });
        },
        text: 'Advanced Copy',
        ariaLabel: 'AdvancedCopy',
        iconProps: { iconName: 'Copy' },
        iconOnly: false,
        disabled: false,
      },
      {
        key: 'flag',
        onClick: () => toggleHideDialogFeedback(),
        text: 'Feedback',
        ariaLabel: 'Feedback',
        iconProps: { iconName: 'Flag' },
        iconOnly: false,
        disabled: false,
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [azureSearchVideo],
  );

  useEffect(() => {
    if (subtitlesEn.isFetched) {
      setSubtitlesEnUrl({ url: subtitlesEn.url, lang: 'en-us', label: 'English' });
    }
  }, [subtitlesEn.isFetched, subtitlesEn.url]);

  useEffect(() => {
    if (subtitlesFr.isFetched) {
      setSubtitlesFrUrl({ url: subtitlesFr.url, lang: 'fr-fr', label: 'French' });
    }
  }, [subtitlesFr.isFetched, subtitlesFr.url]);

  useEffect(() => {
    if (subtitlesAr.isFetched) {
      setSubtitlesArUrl({ url: subtitlesAr.url, lang: 'ar-SA', label: 'Arabic' });
    }
  }, [subtitlesAr.isFetched, subtitlesAr.url]);

  useEffect(() => {
    if (apiAccessToken && videoIndexerAccessToken) {
      setSearchVideoId(params.videoId);
    }
  }, [apiAccessToken, params, videoIndexerAccessToken]);

  useEffect(() => {
    if (videoIndexerAccessToken) {
      setDecodedToken(decodeJwt(videoIndexerAccessToken));
    }
  }, [videoIndexerAccessToken]);

  useEffect(() => {}, [fluentUiTheme]);

  const classNames = useMemo(() => {
    let mergeStyles = mergeStyleSets({
      itemCell: [
        getFocusStyle(fluentUiTheme, { inset: -1 }),
        {
          padding: 5,
          boxSizing: 'border-box',
          borderBottom: `1px solid ${fluentUiTheme.semanticColors.bodyDivider}`,
          display: 'flex',
          selectors: {
            '&:hover': { background: fluentUiTheme.palette.neutralLighter },
          },
        },
      ],
      itemContent: {
        marginLeft: 10,
        overflow: 'hidden',
        flexGrow: 1,
        flexBasis: '80%',
      },
      itemName: {
        marginLeft: 10,
        overflow: 'hidden',
        flexGrow: 1,
        flexBasis: '10%',
      },
      itemIcon: {
        overflow: 'hidden',
        flexGrow: 1,
      },
    });
    return mergeStyles;
  }, [fluentUiTheme]);

  const onRenderCell = (item: { name: string; content: string; icon: string }, index: number | undefined): JSX.Element => {
    return (
      <div className={classNames.itemCell} data-is-focusable={true}>
        <FontIcon iconName={item.icon} />
        <div className={classNames.itemName}>
          <div className={classNames.itemName} style={{ fontWeight: 'bold' }}>
            {item.name}
          </div>
        </div>
        <div className={classNames.itemContent}>
          <div>{item.content}</div>
        </div>
        <div className={classNames.itemIcon}>
          <ActionButton
            iconProps={{ iconName: 'Copy' }}
            ariaLabel={`header ${item.name}`}
            onClick={() => copy(item.content, item.name, fluentUiTheme)}
          ></ActionButton>
        </div>
      </div>
    );
  };
  return (
    <>
      <AuthenticatedTemplate>
        <Stack style={{ alignItems: 'stretch', height: 'inherit', marginTop: '10px' }}>
          <FeedbackDialog toggleHideDialogFeedback={toggleHideDialogFeedback} hideDialogFeedback={hideDialogFeedback} />

          {streamingConfig && !streamingConfig.isLoading && streamingConfig.url && subtitlesEn.isFetched && subtitlesFr.isFetched && subtitlesAr.isFetched && (
            <ClipDialog
              toggleHideDialog={toggleHideDialogClip}
              hideDialog={hideDialogClip}
              subtitlesUrls={[subtitlesEnUrl, subtitlesFrUrl, subtitlesArUrl]}
              videoStreamingUrl={streamingConfig.url}
              videoStreamingJwt={streamingConfig.jwt}
              azureSearchVideo={azureSearchVideo}
            />
          )}

          <div style={{ display: 'grid', gap: '10px', gridTemplateColumns: '1fr 1fr', height: '100%', width: '99%' }}>
            <Stack tokens={{ childrenGap: '5px' }} style={{ alignItems: 'stretch', height: 'inherit' }}>
              {(!streamingConfig || streamingConfig.isLoading || subtitlesEn.isLoading || subtitlesFr.isLoading || subtitlesAr.isLoading) && (
                <Stack horizontal horizontalAlign="center" verticalAlign="center">
                  <Loading message="Loading video" />
                </Stack>
              )}

              {streamingConfig &&
                !streamingConfig.isLoading &&
                streamingConfig.isFetched &&
                streamingConfig.url &&
                subtitlesEn.isFetched &&
                subtitlesFr.isFetched &&
                subtitlesAr.isFetched && (
                  <>
                    <VideoPlayer
                      ref={videoRef}
                      subtitlesUrls={[subtitlesEnUrl, subtitlesFrUrl, subtitlesArUrl]}
                      videoStreamingUrl={streamingConfig.url}
                      videoStreamingJwt={streamingConfig.jwt}
                    />
                    <CommandBar
                      style={{ margin: '0px 0px 0px -25px' }}
                      items={[]}
                      farItems={rightItems}
                      ariaLabel="list view layout"
                      farItemsGroupAriaLabel="More actions"
                    />

                    {streamingConfig && !streamingConfig.isLoading && azureSearchVideo.document && (
                      <Text variant="xLarge" block>
                        {azureSearchVideo.document.metadata_matching_video_name}
                      </Text>
                    )}

                    {azureSearchVideo && !azureSearchVideo.isLoading && azureSearchVideo.document && (
                      <>
                        <Separator>
                          <Text variant="large">Header</Text>
                        </Separator>
                        {/* Due to a bug in onRenderCell (see https://github.com/microsoft/fluentui/issues/18216) use the version trick to forece rerender when
                        applying a theme from the page */}
                        <List items={items} onRenderCell={onRenderCell} version={fluentUiTheme.palette.neutralLight as any} />

                        {azureSearchVideo?.document_description && (
                          <>
                            <Separator>
                              <Text variant="large">Description</Text>
                            </Separator>
                            <CommandBar
                              style={{ margin: '0px 0px 0px -25px' }}
                              items={[]}
                              farItems={[
                                {
                                  onClick: () => {
                                    if (azureSearchVideo?.document_description) {
                                      copy(azureSearchVideo.document_description.join('\r\n'), 'Description', fluentUiTheme, false);
                                    }
                                  },
                                  key: 'copy',
                                  text: 'Copy description',
                                  iconProps: { iconName: 'Copy' },
                                  disabled: azureSearchVideo.isLoading || azureSearchVideo.isError,
                                },
                              ]}
                              ariaLabel="list view layout"
                              farItemsGroupAriaLabel="More actions"
                            />
                            {azureSearchVideo?.document_description &&
                              azureSearchVideo.document_description.map((d, i) => (
                                <Text variant="medium" block key={i}>
                                  {d}
                                </Text>
                              ))}
                          </>
                        )}
                      </>
                    )}
                  </>
                )}
            </Stack>
            {videoSummary && videoSummary.isLoading && (
              <Stack horizontal horizontalAlign="center" verticalAlign="start">
                <Loading message="Loading insights" />
              </Stack>
            )}
            {videoSummary && !videoSummary.isLoading && videoSummary.summary && (
              <VideoAnalyzerInsights
                accessToken={videoIndexerAccessToken}
                videoId={videoSummary.summary.id}
                accountId={decodedToken.AccountId}
                issuerLocation={decodedToken.IssuerLocation}
              />
            )}
          </div>
        </Stack>
      </AuthenticatedTemplate>
      <UnauthenticatedTemplate>
        <UnauthenticatedComponent />
      </UnauthenticatedTemplate>
    </>
  );
};

export default VideoPage;

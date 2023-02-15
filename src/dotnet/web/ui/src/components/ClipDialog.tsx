import {
  DefaultButton,
  Dialog,
  DialogFooter,
  DialogType,
  FontWeights,
  IModalProps,
  ITheme,
  PrimaryButton,
  Slider,
  Text,
  TextField,
  useTheme as useFluentTheme,
} from '@fluentui/react';
import { useBoolean, useRefEffect } from '@fluentui/react-hooks';
import copyToClipboard from 'copy-to-clipboard';
import * as React from 'react';
import { useCallback, useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { formatNumberToTime, parseArrayToString } from '../helpers';
import { StreamingUrl } from '../types';
import ClipDialogModal from './ClipDialogModal';
import VideoPlayer from './VideoPlayer';

interface IClipProps {
  toggleHideDialog: () => void;
  hideDialog: boolean;
  videoStreamingUrl: string;
  videoStreamingJwt: string;
  subtitlesUrls?: StreamingUrl[];
  azureSearchVideo?: any;
}

const modelProps: IModalProps = {
  isDarkOverlay: false,
  isBlocking: false,
  styles: {
    main: {
      selectors: {
        '@media (min-width: 0px)': {
          maxWidth: 650,
          width: 650,
        },
      },
    },
  },
};

const dialogContentProps = {
  type: DialogType.largeHeader,
  title: 'Advanced Copy',
  subText: 'Create an advanced copy containing a clip selection from the video',
};

const ClipDialog: React.FunctionComponent<IClipProps> = (props) => {
  const [maxDuration, setMaxDuration] = useState(0);
  const [videoRange, setVideoRange] = useState([0, 0]);
  const [comments, setComments] = useState('');
  const [isModalOpen, { setTrue: showModal, setFalse: hideModal }] = useBoolean(false);
  const [copiedTextArray, setCopiedTextArray] = useState<string[]>([]);
  const fluentUiTheme = useFluentTheme();

  const copy = (str: string, fluentUiTheme: ITheme) => {
    copyToClipboard(str);
    toast.success(`Successfully copied metadatas from video`, {
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

  /// Copy to clipboard
  const copyVideoToClipboard = () => {
    let textArray = [];

    let text = 'Video Name : ' + props.azureSearchVideo.document.metadata_matching_video_name + '\r\n';
    text += 'Keywords: ' + parseArrayToString(props.azureSearchVideo.document.metadata_keywords, ',') + '\r\n';
    text += 'Clip: From: ' + formatNumberToTime(videoRange[0]) + ' To: ' + formatNumberToTime(videoRange[1]) + '\r\n';
    text += 'Comments:\r\n' + comments + '\r\n';

    let commentsHtml = comments.replaceAll('\r\n', '<br />');
    commentsHtml = commentsHtml.replaceAll('\r', '<br />');
    commentsHtml = commentsHtml.replaceAll('\n', '<br />');
    textArray.push('<b>Video Id:</b> ' + props.azureSearchVideo.document.metadata_matching_video_name);
    textArray.push('<b>Keywords:</b> ' + parseArrayToString(props.azureSearchVideo.document.metadata_keywords, ','));
    textArray.push('<b>Clip:</b> <b>From</b>: ' + formatNumberToTime(videoRange[0]) + ' <b>To</b>: ' + formatNumberToTime(videoRange[1]));
    textArray.push('<b>Comments</b>:<br />' + commentsHtml);

    setCopiedTextArray(textArray);
    copy(text, fluentUiTheme);
  };

  /// Copy and Preview
  const copyVideoToClipboardAndPreview = () => {
    copyVideoToClipboard();
    showModal();
  };

  /// Copy and Close
  const copyVideoToClipboardAndClose = () => {
    copyVideoToClipboard();
    props.toggleHideDialog();
  };

  /// useRefEffect is able to call a callback when ref.current is evolving
  /// We can't do that with a simple useEffect()
  const videoRef = useRefEffect<HTMLVideoElement>((video) => {
    const onLoadedmetadata = (ev: Event) => setMaxDuration(video.duration);
    video.addEventListener('loadedmetadata', onLoadedmetadata);

    if (video.duration > 0) setMaxDuration(video.duration);

    return () => {
      setMaxDuration(0);
      video.removeEventListener('loadedmetadata', onLoadedmetadata);
    };
  });

  /// Set the player on the correct time frame when moving slider
  const onChangedSlider = useCallback(
    (event: any, value: number, range?: [number, number]) => {
      let min = range[0];
      let max = range[1];

      if (min !== videoRange[0]) {
        videoRef.current.currentTime = min;
      } else if (max !== videoRange[1]) {
        videoRef.current.currentTime = max;
      }

      setVideoRange([min, max]);
    },
    [videoRange, videoRef],
  );

  /// when max duration change, we reset the video range values
  useEffect(() => {
    setVideoRange([0, maxDuration]);
  }, [maxDuration]);

  return (
    <>
      <Dialog hidden={props.hideDialog} onDismiss={props.toggleHideDialog} dialogContentProps={dialogContentProps} modalProps={modelProps}>
        <ClipDialogModal hideModal={hideModal} copiedTextArray={copiedTextArray} isModalOpen={isModalOpen} />
        <VideoPlayer
          ref={videoRef}
          subtitlesUrls={props.subtitlesUrls}
          videoStreamingUrl={props.videoStreamingUrl}
          videoStreamingJwt={props.videoStreamingJwt}
        />
        <Text variant="medium" block style={{ fontWeight: FontWeights.semibold, marginTop: 20 }}>
          Clip selection
        </Text>
        <Slider
          ranged
          disabled={maxDuration <= 0}
          valueFormat={formatNumberToTime}
          min={0}
          max={maxDuration}
          defaultValue={8000}
          defaultLowerValue={0}
          onChanged={onChangedSlider}
        />
        <Text variant="medium" block style={{ fontWeight: FontWeights.semibold, marginTop: 20 }}>
          Comments
        </Text>
        <TextField multiline rows={10} onChange={(e, newValue) => setComments(newValue)} />

        <DialogFooter>
          <PrimaryButton onClick={copyVideoToClipboardAndPreview} text="Copy And Preview" iconProps={{ iconName: 'Copy' }} />
          <PrimaryButton onClick={copyVideoToClipboard} text="Copy" iconProps={{ iconName: 'Copy' }} />
          <PrimaryButton onClick={copyVideoToClipboardAndClose} text="Copy and Close" iconProps={{ iconName: 'Copy' }} />
          <DefaultButton onClick={props.toggleHideDialog} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </>
  );
};

export default ClipDialog;

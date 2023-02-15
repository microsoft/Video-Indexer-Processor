import Hls, { ErrorData, Events, ManifestParsedData } from 'hls.js';
import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { StreamingUrl } from '../types';

interface IVideoPlayerProps {
  videoStreamingUrl: string;
  videoStreamingJwt: string;
  subtitlesUrls?: StreamingUrl[];
  posterUrl?: string;
}

const VideoPlayer = forwardRef<HTMLVideoElement, IVideoPlayerProps>(({ videoStreamingUrl, videoStreamingJwt, subtitlesUrls }, forwardRef) => {
  const [player, setPlayer] = useState<Hls | null>(null);
  const [subtitles, setSubtitles] = useState<Set<string>>(new Set());
  const localVideoRef = useRef<HTMLVideoElement>();
  const [playerVideoLoaded, setPlayerVideoLoaded] = useState<boolean>(false);

  useImperativeHandle(forwardRef, () => localVideoRef.current, []);

  useEffect(() => {
    if (!!videoStreamingJwt) {
      const hls = new Hls({
        enableWorker: true,
        lowLatencyMode: true,
        backBufferLength: 90,
        xhrSetup: (xhr, url) => {
          // Only add jwt on license requests, not manifest/preflight calls
          if (url.indexOf('keydelivery') !== -1) {
            xhr.setRequestHeader('Authorization', 'Bearer ' + videoStreamingJwt);
          }
        },
      });
      setPlayer(hls);
      return () => {
        hls.destroy();
      };
    }
    // Jwt is changing every time video player is loading even
    // if url is not changing
    // but we don't want to load again same video with different token
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [videoStreamingUrl]);

  useEffect(() => {
    if (!!videoStreamingUrl && player) {
      const video: HTMLVideoElement = localVideoRef.current;

      const onManifestParsedEvent = (event: Events.MANIFEST_PARSED, data: ManifestParsedData) => {
        setPlayerVideoLoaded(true);
      };

      const onMediaAttachedEvent = () => {
        player.loadSource(videoStreamingUrl);
        player.on(Hls.Events.MANIFEST_PARSED, onManifestParsedEvent);
      };

      const onError = (event: Events.ERROR, data: ErrorData) => {
        console.error('Error: ', event, ' Data: ', data);
      };

      const onJumpTo = (event: MessageEvent) => {
        let origin = event.origin;
        // Validate that the event comes from the videoindexer domain.
        if (origin === 'https://www.videoindexer.ai' && event.data.time !== undefined) {
          video.currentTime = event.data.time;
          // Confirm the arrival back to Azure Video Indexer
          if ('postMessage' in window && event.source) {
            event.source.postMessage({ confirm: true, time: event.data.time }, { targetOrigin: origin });
          }
        }
      };

      if (Hls.isSupported() && player && videoStreamingUrl) {
        player.attachMedia(video);
        player.on(Hls.Events.MEDIA_ATTACHED, onMediaAttachedEvent);
        player.on(Hls.Events.ERROR, onError);
        window.addEventListener<any>('message', onJumpTo);
      }

      return () => {
        if (player) {
          player.off(Hls.Events.MEDIA_ATTACHED, onMediaAttachedEvent);
          player.off(Hls.Events.MANIFEST_PARSED, onManifestParsedEvent);
          player.off(Hls.Events.ERROR, onError);
          window.removeEventListener<any>('message', onJumpTo);
        }
      };
    }
  }, [player, videoStreamingUrl]);

  useEffect(() => {
    const video: HTMLVideoElement = localVideoRef.current;

    if (playerVideoLoaded) {
      for (var i = 0; i < video.textTracks.length; i++) {
        video.textTracks[i].mode = 'hidden';
      }
      subtitlesUrls.forEach((subtitlesUrl) => {
        if (subtitlesUrl && subtitlesUrl.lang && !subtitles.has(subtitlesUrl.lang)) {
          setSubtitles((prev) => new Set(prev.add(subtitlesUrl.lang)));

          let track = document.createElement('track');
          track.kind = 'captions';
          track.label = subtitlesUrl.label;
          track.srclang = subtitlesUrl.lang;
          track.src = subtitlesUrl.url;
          video.appendChild(track);
          track.addEventListener('load', function () {
            (this as any).mode = 'showing';
            video.textTracks[0].mode = 'showing'; // thanks Firefox
          });
        }
      });
      if (player && subtitles.size > 0) {
        player.subtitleDisplay = true;
        player.subtitleTrack = 0;
      }
    }
  }, [player, subtitles, subtitlesUrls, playerVideoLoaded]);

  return (
    <video
      ref={localVideoRef}
      controls
      autoPlay
      preload="metadata"
      style={{
        maxWidth: '400',
        minWidth: '100',
        width: '100%',
      }}
    ></video>
  );
});

export default VideoPlayer;

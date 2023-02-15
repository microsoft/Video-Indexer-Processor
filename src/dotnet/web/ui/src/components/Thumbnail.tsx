import { Image } from '@fluentui/react';
import * as React from 'react';
import { useEffect, useState } from 'react';
import { useVideoThumbnail } from '../hooks/useVideoThumbnail';
import notFound from '../images/thumbnail-not-found.png';

interface IThumbnailProps {
  accessToken: string;
  thumbnailId: string;
  videoId: string;
  className?: string;
  width?: number;
  height?: number;
}

const Thumbnail: React.FunctionComponent<IThumbnailProps> = (props) => {
  const vt = useVideoThumbnail(props.accessToken, props.videoId, props.thumbnailId);
  const [videoThumbnailUrl, setVideoThumbnailUrl] = useState<string>(notFound);
  const [isCached, setIsCached] = useState<boolean>(false);

  // remove cached flag to force a re-creation of the thumbnail url from blob
  useEffect(() => {
    setIsCached(false);
    setVideoThumbnailUrl(notFound);
  }, [props.videoId, props.thumbnailId]);

  useEffect(() => {
    try {
      if (!isCached && vt.isFetched) {
        setVideoThumbnailUrl(URL.createObjectURL(vt.thumbnail));
        setIsCached(true);
      }
    } catch (error) {
      setVideoThumbnailUrl(notFound);
    }

    return () => {
      if (isCached && videoThumbnailUrl !== notFound) {
        URL.revokeObjectURL(videoThumbnailUrl);
      }
    };
  }, [isCached, videoThumbnailUrl, vt.isFetched, vt.thumbnail]);

  return <>{vt && <Image shouldFadeIn={false} src={videoThumbnailUrl} width={props.width} height={props.height} className={props.className} />}</>;
};

export default Thumbnail;

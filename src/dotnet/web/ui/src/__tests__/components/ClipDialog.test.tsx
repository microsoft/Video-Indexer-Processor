import { initializeIcons } from '@fluentui/react';
import { useBoolean } from '@fluentui/react-hooks';
import { fireEvent, render, screen } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import userEvent from '@testing-library/user-event';
import toast from 'react-hot-toast';
import ClipDialog from '../../components/ClipDialog';
import { formatNumberToTime, parseArrayToString } from '../../helpers';
import { testSearchResult } from '../misc/Constants';

// Initialize icons in case this example uses them
initializeIcons();

// mock the video player so it can have a testid to be verified
jest.mock('../../components/VideoPlayer', () => {
  let mockVideoPlayer = require('react').forwardRef(({ children, ...rest }, ref) => {
    return <video data-testid="mock-video" ref={ref}></video>;
  });

  return {
    __esModule: true,
    default: mockVideoPlayer,
  };
});

describe('ClipDialog component', () => {
  beforeEach(() => {
    jest.spyOn(window, 'prompt');
    jest.spyOn(toast, 'success');
  });
  afterEach(() => jest.resetAllMocks());

  test('ClipDialog is hidden by default', () => {
    const { container } = render(<ClipDialog toggleHideDialog={() => {}} hideDialog={true} videoStreamingUrl={''} videoStreamingJwt={''} />);

    // If hideDialog=true, expect dialog elements not to be present
    expect(container).toBeEmptyDOMElement();
  });

  test('ClipDialog renders correctly', () => {
    let subtitlesEnUrl = { url: 'en-url', lang: 'en-us', label: 'English' };
    let subtitlesFrUrl = { url: 'fr-url', lang: 'fr-fr', label: 'French' };
    let subtitlesArUrl = { url: 'ar-url', lang: 'ar-SA', label: 'Arabic' };
    let videoStreamingUrl = 'https://.....';
    let videoStreamingJwt = 'ejby.....';
    let azureSearchVideo = testSearchResult[0];

    const { container } = render(
      <ClipDialog
        toggleHideDialog={() => {}}
        hideDialog={false}
        videoStreamingUrl={videoStreamingUrl}
        videoStreamingJwt={videoStreamingJwt}
        subtitlesUrls={[subtitlesEnUrl, subtitlesFrUrl, subtitlesArUrl]}
        azureSearchVideo={azureSearchVideo}
      />,
    );

    expect(container).not.toBeEmptyDOMElement();

    // Expect dialog elements to be present
    expect(screen.getByRole('dialog', { name: 'Advanced Copy' })).toBeInTheDocument();
    expect(screen.getAllByRole('slider')).toHaveLength(2);
    expect(screen.getByRole('textbox')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy And Preview' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Copy and Close' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument();
    expect(screen.getByTestId('mock-video')).toBeInTheDocument();
  });

  test('Cancel Button toggles hidden attribute', () => {
    const { result } = renderHook(({ state }) => useBoolean(state), {
      initialProps: { state: false },
    });

    const { container } = render(
      <ClipDialog toggleHideDialog={result.current[1].toggle} hideDialog={result.current[0]} videoStreamingUrl={''} videoStreamingJwt={''} />,
    );

    expect(container).not.toBeEmptyDOMElement();

    // Expect dialog element to be present
    expect(screen.getByRole('dialog', { name: 'Advanced Copy' })).toBeInTheDocument();

    // The dialog is currently not hidden
    expect(result.current[0]).toBeFalsy();

    // Click button to close dialog
    let cancelButton = screen.getByRole('button', { name: 'Cancel' });
    userEvent.click(cancelButton);

    // dialog is now hidden
    expect(result.current[0]).toBeTruthy();
  });

  test('Copy button copies text', () => {
    let azureSearchVideo = testSearchResult.results[0];

    const { container } = render(
      <ClipDialog toggleHideDialog={() => {}} hideDialog={false} videoStreamingUrl={''} videoStreamingJwt={''} azureSearchVideo={azureSearchVideo} />,
    );

    (window.prompt as any).mockImplementation(() => {});
    (toast.success as any).mockImplementation(() => {});

    // click button to copy text
    expect(container).not.toBeEmptyDOMElement();
    let copyButton = screen.getByRole('button', { name: 'Copy' });
    expect(copyButton).toBeInTheDocument();
    userEvent.click(copyButton);

    // These methods are called when the copy button works as expected
    expect(window.prompt).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  test('Copy And Preview button opens modal dialog', () => {
    let azureSearchVideo = testSearchResult.results[0];

    const { container } = render(
      <ClipDialog toggleHideDialog={() => {}} hideDialog={false} videoStreamingUrl={''} videoStreamingJwt={''} azureSearchVideo={azureSearchVideo} />,
    );

    (window.prompt as any).mockImplementation(() => {});
    (toast.success as any).mockImplementation(() => {});

    expect(container).not.toBeEmptyDOMElement();

    // click button which opens modal dialog
    let copyAndPreviewButton = screen.getByRole('button', { name: 'Copy And Preview' });
    expect(copyAndPreviewButton).toBeInTheDocument();
    userEvent.click(copyAndPreviewButton);

    // verify that the elements of the modal dialog are present
    expect(screen.getByRole('button', { name: 'Close popup modal' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy And Preview' })).not.toBeInTheDocument();
    expect(window.prompt).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  test('Modal Dialog has correct input text', () => {
    let azureSearchVideo = testSearchResult.results[0];
    let duration = 2000;
    jest.spyOn(window.HTMLVideoElement.prototype, 'duration', 'get').mockReturnValue(duration);

    const { container } = render(
      <ClipDialog toggleHideDialog={() => {}} hideDialog={false} videoStreamingUrl={''} videoStreamingJwt={''} azureSearchVideo={azureSearchVideo} />,
    );

    // throws error if not mocked
    (window.prompt as any).mockImplementation(() => {});
    (toast.success as any).mockImplementation(() => {});

    expect(container).not.toBeEmptyDOMElement();

    let comment = 'This is a test';
    let commentsTextBox = screen.getByRole('textbox');
    expect(commentsTextBox).toBeInTheDocument();
    // Write a test comment into the textbox
    userEvent.click(commentsTextBox);
    userEvent.keyboard(comment);

    // Verify copied text
    let copyAndPreviewButton = screen.getByRole('button', { name: 'Copy And Preview' });
    expect(copyAndPreviewButton).toBeInTheDocument();
    userEvent.click(copyAndPreviewButton);

    expect(screen.getByRole('button', { name: 'Close popup modal' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Copy And Preview' })).not.toBeInTheDocument();
    expect(screen.getByText(testSearchResult.results[0].document.metadata_matching_video_name)).toBeInTheDocument();
    expect(screen.getByText(parseArrayToString(testSearchResult.results[0].document.metadata_keywords, ','))).toBeInTheDocument();
    expect(screen.getByText(comment)).toBeInTheDocument();
    expect(screen.getByText('00:00')).toBeInTheDocument();
    expect(screen.getByText(formatNumberToTime(duration))).toBeInTheDocument();
    expect(window.prompt).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });

  test('Changing sliders saves correct duration values', () => {
    let azureSearchVideo = testSearchResult.results[0];
    // Mocks the duration of the video to be 33:20, very important, if you delete this the duration is 00:00 and the test is meaningless!
    jest.spyOn(window.HTMLVideoElement.prototype, 'duration', 'get').mockReturnValue(2000);

    const { container } = render(
      <ClipDialog toggleHideDialog={() => {}} hideDialog={false} videoStreamingUrl={''} videoStreamingJwt={''} azureSearchVideo={azureSearchVideo} />,
    );

    (window.prompt as any).mockImplementation(() => {});
    (toast.success as any).mockImplementation(() => {});

    expect(container).not.toBeEmptyDOMElement();

    let maxSlider = screen.getByRole('slider', { name: 'max undefined' });
    // Move the slider to the left (can only be moved all the way to the left for some reason, values <1 do not work)
    fireEvent.mouseDown(maxSlider);
    fireEvent.mouseMove(maxSlider, { clientX: -1 });

    let copyAndPreviewButton = screen.getByRole('button', { name: 'Copy And Preview' });
    userEvent.click(copyAndPreviewButton);

    // Because the slider was moved all the way to the left, the clip is now from 00:00 to 00:00 (instead of 33:20)
    expect(screen.getAllByText('00:00')).toHaveLength(2);
  });

  test('Copy And Close button copies text and close', () => {
    let azureSearchVideo = testSearchResult.results[0];

    const { container } = render(
      <ClipDialog toggleHideDialog={() => {}} hideDialog={false} videoStreamingUrl={''} videoStreamingJwt={''} azureSearchVideo={azureSearchVideo} />,
    );

    (window.prompt as any).mockImplementation(() => {});
    (toast.success as any).mockImplementation(() => {});

    // click button to copy text
    expect(container).not.toBeEmptyDOMElement();
    let copyButton = screen.getByRole('button', { name: 'Copy and Close' });
    expect(copyButton).toBeInTheDocument();
    userEvent.click(copyButton);

    // These methods are called when the copy button works as expected
    expect(window.prompt).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalled();
  });
});

import { DefaultButton, Dialog, DialogFooter, DialogType, FontWeights, IModalProps, PrimaryButton, Rating, RatingSize, Text, TextField } from '@fluentui/react';

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
  title: 'Feedback',
  subText: 'Please provide as much detail as possible regarding the feedback you are reporting. Please do not provide any personal or sensitive information.',
};

interface IFeedbackDialogOptions {
  toggleHideDialogFeedback?: () => void;
  hideDialogFeedback?: boolean;
}

export const FeedbackDialog: React.FunctionComponent<IFeedbackDialogOptions> = ({ hideDialogFeedback, toggleHideDialogFeedback }) => {
  return (
    <>
      <Dialog hidden={hideDialogFeedback} onDismiss={toggleHideDialogFeedback} dialogContentProps={dialogContentProps} modalProps={modelProps}>
        <Text variant="medium" block style={{ fontWeight: FontWeights.semibold }}>
          Rating
        </Text>
        <Rating max={5} size={RatingSize.Large} allowZeroStars={true} defaultRating={1} ariaLabel="Video Rating" ariaLabelFormat="{0} of {1} stars" />
        <TextField label="Comments" multiline rows={10} />
        <DialogFooter>
          <PrimaryButton onClick={toggleHideDialogFeedback} text="Send" />
          <DefaultButton onClick={toggleHideDialogFeedback} text="Cancel" />
        </DialogFooter>
      </Dialog>
    </>
  );
};

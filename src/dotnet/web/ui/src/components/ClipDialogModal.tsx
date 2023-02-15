import { getTheme, IconButton, Modal } from '@fluentui/react';
import * as React from 'react';
import { getClipDialogStyle, getIconButtonStyles } from './ClipDialogModal.styles';

interface IClipDialogModalProps {
  isModalOpen: boolean;
  hideModal: () => void;
  copiedTextArray: string[];
}

const ClipDialogModal: React.FunctionComponent<IClipDialogModalProps> = (props) => {
  const theme = getTheme();
  const contentStyles = getClipDialogStyle(theme);
  const iconButtonStyles = getIconButtonStyles(theme);
  return (
    <Modal isOpen={props.isModalOpen} onDismiss={props.hideModal} isBlocking={false} containerClassName={contentStyles.container}>
      <div className={contentStyles.header}>
        <span>Clipboard text</span>
        <IconButton styles={iconButtonStyles} iconProps={{ iconName: 'Cancel' }} ariaLabel="Close popup modal" onClick={props.hideModal} />
      </div>
      <div className={contentStyles.body}>
        {props.copiedTextArray && props.copiedTextArray.map((line, index) => <div key={index} dangerouslySetInnerHTML={{ __html: line }}></div>)}
      </div>
    </Modal>
  );
};

export default ClipDialogModal;

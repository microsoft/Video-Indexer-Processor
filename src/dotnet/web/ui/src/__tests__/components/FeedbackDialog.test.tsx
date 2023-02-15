import { render, screen } from '@testing-library/react';
import { initializeIcons } from '@fluentui/react';
import { FeedbackDialog } from '../../components/FeedbackDialog';

// Initialize icons in case this example uses them
initializeIcons();

describe('FeedbackDialog component', () => {
  test('Dialog is hidden by default', () => {
    const { container } = render(<FeedbackDialog />);
    expect(container).toBeEmptyDOMElement();
  });

  test('Component renders correctly', () => {
    const { container } = render(<FeedbackDialog hideDialogFeedback={false} />);
    expect(container).not.toBeEmptyDOMElement();
    expect(screen.getByText(/Feedback/)).toBeInTheDocument();
  });
});

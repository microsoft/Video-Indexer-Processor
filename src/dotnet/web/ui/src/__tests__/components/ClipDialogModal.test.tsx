import { render, screen } from '@testing-library/react';
import { initializeIcons } from '@fluentui/react';
import ClipDialogModal from '../../components/ClipDialogModal';

// Initialize icons in case this example uses them
initializeIcons();

describe('ClipDialogModal component', () => {
  test('ClipDialogModal is hidden by default', () => {
    let copiedTextArray = ['line 1', 'line 2'];

    const { container } = render(<ClipDialogModal copiedTextArray={copiedTextArray} isModalOpen={false} hideModal={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });

  test('ClipDialogModal render correctly', async () => {
    let copiedTextArray = ['line 1', 'line 2'];

    render(<ClipDialogModal copiedTextArray={copiedTextArray} isModalOpen={true} hideModal={() => {}} />);
    let collapsibleLabel1Text = await screen.findAllByText(/line/);

    expect(collapsibleLabel1Text).toHaveLength(2);
  });
});

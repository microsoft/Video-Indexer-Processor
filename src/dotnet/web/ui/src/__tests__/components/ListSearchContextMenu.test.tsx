import { fireEvent, render, screen } from '@testing-library/react';
import ListSearchContextMenu from '../../components/ListSearchContextMenu';
import { initializeIcons } from '@fluentui/react';
import { testSearchResult } from '../misc/Constants';
import toast, { Toast } from 'react-hot-toast';

// Initialize icons in case this example uses them
initializeIcons();

const testVideo = testSearchResult.results[0].document;
const cases = [['Keywords', testVideo.metadata_keywords]];

describe('List search context menu component', () => {
  beforeEach(() => {
    jest.spyOn(window, 'prompt');
    jest.spyOn(toast, 'success');
  });
  afterEach(() => jest.resetAllMocks());

  test('Component renders correctly', () => {
    render(<ListSearchContextMenu selectedItemRow={undefined} coordPoints={undefined} showContextualMenu={true} setShowContextualMenu={undefined} />);
    expect(screen.getByRole('menuitem', { name: 'Copy Keywords' })).toBeInTheDocument();
  });

  test.each(cases)('Copy %p copies correct value', (itemName, expectedValue) => {
    render(<ListSearchContextMenu selectedItemRow={testVideo} coordPoints={undefined} showContextualMenu={true} setShowContextualMenu={() => {}} />);

    (window.prompt as any).mockImplementation(() => {});
    (toast.success as any).mockImplementation(
      (message: string, options?: Partial<Pick<Toast, 'style' | 'id' | 'icon' | 'duration' | 'ariaProps' | 'className' | 'position' | 'iconTheme'>>) => {},
    );

    let copy = screen.getByRole('menuitem', { name: `Copy ${itemName}` });
    fireEvent.click(copy);
    expect(window.prompt).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(`Successfully copied ${itemName}: ${expectedValue}`, expect.anything());
  });
});

import { render, screen } from '@testing-library/react';
import Loading from '../../components/Loading';
import { initializeIcons } from '@fluentui/react';

// Initialize icons in case this example uses them
initializeIcons();

describe('Loading component', () => {
  test('Component renders correctly', () => {
    let testMessage = 'test message';
    render(<Loading message={testMessage} />);

    expect(screen.getByText(testMessage)).toBeInTheDocument();
  });

  test('No message uses default props', () => {
    render(<Loading />);

    let expectedText = 'loading';

    expect(screen.getByText(expectedText)).toBeInTheDocument();
  });
});

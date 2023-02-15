import { render, screen } from '@testing-library/react';
import NothingHereComponent from '../../components/NothingHereComponent';
import { initializeIcons } from '@fluentui/react';

// Initialize icons in case this example uses them
initializeIcons();

describe('Nothing here component', () => {
  test('Component renders correctly', () => {
    render(<NothingHereComponent />);

    expect(screen.getByText('The url you are trying to reach does not exist.')).toBeInTheDocument();
    expect(screen.getByRole('img')).toBeInTheDocument();
    expect(screen.getByRole('img')).toHaveAttribute('src', 'logo-30.png');
  });
});

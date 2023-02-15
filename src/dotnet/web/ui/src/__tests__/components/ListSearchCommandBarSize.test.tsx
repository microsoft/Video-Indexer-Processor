import { initializeIcons } from '@fluentui/react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ListSearchCommandBarSize from '../../components/ListSearchCommandBarSize';
import { actAwait } from '../misc/Utils';

// Initialize icons in case this example uses them

initializeIcons();

describe('ListSearchCommandBarSize component', () => {
  test('Component renders correctly', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarSize />
      </MemoryRouter>,
    );

    let countText = screen.getByText('50 items per page');

    expect(countText).toBeInTheDocument();
  });

  test('Component clic on 10 selects 10', async () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarSize />
      </MemoryRouter>,
    );

    let combobox = screen.getByRole('combobox');
    userEvent.click(combobox);

    let secondButton = screen.getByText('100 items per page');

    await actAwait(100);

    userEvent.click(secondButton, undefined, { skipPointerEventsCheck: true });

    combobox = screen.getByRole('combobox');

    expect(combobox).toHaveTextContent('100 items per page');
  });
});

import { initializeIcons } from '@fluentui/react';
import { initializeIcons as additionalInitializeIcons } from '../../fonts/src';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ListSearchPaginationMode from '../../components/ListSearchPaginationMode';
import userEvent from '@testing-library/user-event';

// Initialize icons in case this example uses them
initializeIcons();
additionalInitializeIcons();

describe('ListSearchPaginationMode component', () => {
  test('Component renders correctly', () => {
    render(
      <MemoryRouter>
        <ListSearchPaginationMode />
      </MemoryRouter>,
    );

    let text = screen.getByText(/Exact Search/);
    expect(text).toBeInTheDocument();

    text = screen.getByText(/Any Criterias/);
    expect(text).toBeInTheDocument();
  });

  test('Component renders correctly when clicks on All', () => {
    render(
      <MemoryRouter>
        <ListSearchPaginationMode />
      </MemoryRouter>,
    );

    let combobox = screen.getByRole('combobox');
    userEvent.click(combobox);

    let secondButton = screen.getByText('All Criterias');

    userEvent.click(secondButton, undefined, { skipPointerEventsCheck: true });

    combobox = screen.getByRole('combobox');

    expect(combobox).toHaveTextContent(/All Criterias/);
  });

  test('Component renders correctly when clicks on Fuzzy', () => {
    render(
      <MemoryRouter>
        <ListSearchPaginationMode />
      </MemoryRouter>,
    );

    let combobox = screen.getByRole('combobox');
    userEvent.click(combobox);

    let secondButton = screen.getByText(/Fuzzy/);

    userEvent.click(secondButton, undefined, { skipPointerEventsCheck: true });

    combobox = screen.getByRole('combobox');

    expect(combobox).toHaveTextContent(/Fuzzy/);
  });
});

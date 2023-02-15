import { initializeIcons } from '@fluentui/react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import ListSearchCommandBarPagination from '../../components/ListSearchCommandBarPagination';

// Initialize icons in case this example uses them

initializeIcons();

describe('ListSearchCommandBarPagination component', () => {
  test('Component renders correctly', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarPagination count={12} isLoading={false} />
      </MemoryRouter>,
    );

    let countText = screen.getByText('1 / 1');

    expect(countText).toBeInTheDocument();
  });

  test('Component renders correctly if count is 0', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarPagination count={0} isLoading={false} />
      </MemoryRouter>,
    );

    let countText = screen.getByText('0 / 0');

    expect(countText).toBeInTheDocument();
  });

  test('Component renders correctly if click on Next', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarPagination count={120} isLoading={false} />
      </MemoryRouter>,
    );

    let nextButton = screen.getByRole('menuitem', { description: 'Next page', hidden: true });
    expect(nextButton).toBeInTheDocument();
    userEvent.click(nextButton);

    let countText = screen.getByText('2 / 3');

    expect(countText).toBeInTheDocument();
  });

  test('Component renders correctly if click on Last', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarPagination count={120} isLoading={false} />
      </MemoryRouter>,
    );

    let nextButton = screen.getByRole('menuitem', { description: 'Last page', hidden: true });
    expect(nextButton).toBeInTheDocument();
    userEvent.click(nextButton);

    let countText = screen.getByText('3 / 3');

    expect(countText).toBeInTheDocument();
  });

  test('Component renders correctly if click on First', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarPagination count={120} isLoading={false} />
      </MemoryRouter>,
    );

    let nextButton = screen.getByRole('menuitem', { description: 'Last page', hidden: true });
    expect(nextButton).toBeInTheDocument();
    userEvent.click(nextButton);

    let countText = screen.getByText('3 / 3');
    expect(countText).toBeInTheDocument();

    let firstButton = screen.getByRole('menuitem', { description: 'First page', hidden: true });
    expect(firstButton).toBeInTheDocument();
    userEvent.click(firstButton);

    countText = screen.getByText('1 / 3');
    expect(countText).toBeInTheDocument();
  });

  test('Component renders correctly if click on Previous page', () => {
    render(
      <MemoryRouter>
        <ListSearchCommandBarPagination count={120} isLoading={false} />
      </MemoryRouter>,
    );

    let nextButton = screen.getByRole('menuitem', { description: 'Last page', hidden: true });
    expect(nextButton).toBeInTheDocument();
    userEvent.click(nextButton);

    let countText = screen.getByText('3 / 3');
    expect(countText).toBeInTheDocument();

    let firstButton = screen.getByRole('menuitem', { description: 'Previous page', hidden: true });
    expect(firstButton).toBeInTheDocument();
    userEvent.click(firstButton);

    countText = screen.getByText('2 / 3');
    expect(countText).toBeInTheDocument();
  });

  test('Component renders correctly on load on specific page', () => {
    render(
      <MemoryRouter initialEntries={['/search?q=spain&s=50&p=2&sm=any&st=fuzzy']}>
        <ListSearchCommandBarPagination count={120} isLoading={false} />
      </MemoryRouter>,
    );
    let countText = screen.getByText('2 / 3');
    expect(countText).toBeInTheDocument();
  });
});

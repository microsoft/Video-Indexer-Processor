import { render, screen } from '@testing-library/react';
import { initializeIcons } from '@fluentui/react';
import Header from '../../components/Header';
import { MemoryRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import { mockAllFetch, mockFetchExpect } from '../misc/MockFetch';
import { QueryClient, QueryClientProvider } from 'react-query';

// Initialize icons in case this example uses them
initializeIcons();

let allFetchMocks: mockFetchExpect[] = [];

beforeEach(() => {
  allFetchMocks.push(new mockFetchExpect(`/api/Dashboard`, 'http://dashboard'));
  jest.spyOn(window, 'fetch');

  (window.fetch as any).mockImplementation(mockAllFetch(allFetchMocks));
});

describe('Header component', () => {
  test('Header render correctly', () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  test('Icon exists', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const image = screen.getByAltText('Icon') as HTMLImageElement;
    expect(image).toHaveAttribute('src', 'logo-30.png');
  });

  test('Signin button exists', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const signin = screen.getByRole('button', { name: 'Sign In' });
    expect(signin).toBeInTheDocument();
  });

  test('Link to open settings panel exists', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    expect(settingsButton).toBeInTheDocument();
  });

  test('A User can open settings', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Header />
        </MemoryRouter>
      </QueryClientProvider>,
    );

    // queryByRole to allow null value
    const settingsPanelBefore = screen.queryByRole('dialog', { name: 'User Settings' });
    expect(settingsPanelBefore).not.toBeInTheDocument();

    const settingsButton = screen.getByRole('button', { name: 'Settings' });
    userEvent.click(settingsButton);

    // Check now that the panel is open and part of the document
    const settingsPanel = screen.getByRole('dialog', { name: 'User Settings' });
    expect(settingsPanel).toBeInTheDocument();
  });
});

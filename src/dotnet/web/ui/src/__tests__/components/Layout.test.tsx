import { render, screen } from '@testing-library/react';
import { initializeIcons } from '@fluentui/react';
import Layout from '../../components/Layout';
import { MemoryRouter } from 'react-router-dom';
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

describe('Layout component', () => {
  test('Layout render correctly', () => {
    const { container } = render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(container).not.toBeEmptyDOMElement();
  });

  test('Container is part of the Layout', () => {
    render(
      <QueryClientProvider client={new QueryClient()}>
        <MemoryRouter>
          <Layout />
        </MemoryRouter>
      </QueryClientProvider>,
    );
    expect(screen.getByRole('contentinfo')).toBeInTheDocument();
  });
});

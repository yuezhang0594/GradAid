import React, { ReactElement } from 'react';
import { render as rtlRender, RenderOptions } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { ConvexProvider } from 'convex/react';
import { vi } from 'vitest';

// Mock Convex client
const mockConvexClient = {
  // Mock the necessary methods and properties
  withAuth: () => mockConvexClient,
};

// Mock the ConvexReactClient before importing it
vi.mock('convex/react', () => {
  return {
    ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ConvexReactClient: vi.fn().mockImplementation(() => mockConvexClient),
    useQuery: vi.fn(),
    useMutation: vi.fn(),
    useAction: vi.fn(),
  };
});

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: vi.fn(() => vi.fn()),
    useLocation: vi.fn(() => ({ pathname: '/', search: '', hash: '', state: null })),
    useParams: vi.fn(() => ({})),
    useSearchParams: vi.fn(() => [new URLSearchParams(), vi.fn()]),
  };
});

// Custom render function that includes providers
interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
  route?: string;
  initialEntries?: string[];
}

export function renderWithProviders(
  ui: ReactElement,
  {
    route = '/',
    initialEntries = ['/'],
    ...renderOptions
  }: CustomRenderOptions = {}
) {
  function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <ConvexProvider client={mockConvexClient as any}>
        <MemoryRouter initialEntries={initialEntries}>
          <Routes>
            <Route path={route} element={children} />
          </Routes>
        </MemoryRouter>
      </ConvexProvider>
    );
  }
  
  return rtlRender(ui, { wrapper: Wrapper, ...renderOptions });
}

// Re-export everything from testing-library
export * from '@testing-library/react';
export { renderWithProviders as render };

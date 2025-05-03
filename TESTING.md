# GradAid Testing Guide

This document provides guidelines and examples for testing the GradAid application.

## Testing Setup

We use the following testing tools:

- **Vitest**: Test runner compatible with Vite
- **React Testing Library**: For testing React components
- **convex-test**: For testing Convex server functions
- **jsdom**: For simulating a browser environment
- **@testing-library/user-event**: For simulating user interactions

## Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode (for development)
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

## Testing Structure

### Directory Structure

Tests should be placed in `__tests__` directories adjacent to the code they're testing:

```
src/
├── components/
│   ├── Button.tsx
│   └── __tests__/
│       └── Button.test.tsx
├── hooks/
│   ├── useDocumentEditor.ts
│   └── __tests__/
│       └── useDocumentEditor.test.ts
└── routes/
    ├── dashboard/
    │   ├── Dashboard.tsx
    │   └── __tests__/
    │       └── Dashboard.test.tsx
    └── applications/
        ├── DocumentEditor.tsx
        └── __tests__/
            └── DocumentEditor.test.tsx
```

### Naming Conventions

- Test files should be named `*.test.ts` or `*.test.tsx`
- Test suites should be named after the component or function they're testing
- Test cases should clearly describe what they're testing

## Testing Components

### Basic Component Test

```tsx
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with the correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', async () => {
    const handleClick = vi.fn();
    const { user } = render(<Button onClick={handleClick}>Click me</Button>);
    
    await user.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Testing Components with Convex

For components that use Convex queries or mutations, you'll need to mock the Convex API:

```tsx
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Dashboard } from '../Dashboard';

// Mock Convex API
vi.mock('convex/react', async () => {
  const actual = await vi.importActual('convex/react');
  return {
    ...actual,
    useQuery: vi.fn(),
    useMutation: vi.fn(() => vi.fn()),
  };
});

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();
    
    // Mock query responses
    const { useQuery } = require('convex/react');
    useQuery.mockImplementation((queryFn) => {
      if (queryFn?.toString().includes('getApplicationStats')) {
        return [
          { title: 'Applications', value: '5', description: '2 submitted, 3 in progress' },
          // ...more mock data
        ];
      }
      return null;
    });
  });

  it('renders application stats correctly', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Applications')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
    });
  });
});
```

## Testing Hooks

Use `renderHook` from React Testing Library to test custom hooks:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useCounter } from '../useCounter';

describe('useCounter Hook', () => {
  it('should initialize with the provided value', () => {
    const { result } = renderHook(() => useCounter(5));
    expect(result.current.count).toBe(5);
  });

  it('should increment the counter', () => {
    const { result } = renderHook(() => useCounter(0));
    
    act(() => {
      result.current.increment();
    });
    
    expect(result.current.count).toBe(1);
  });
});
```

## Testing with React Router

For components that use React Router, mock the router hooks:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentEditor } from '../DocumentEditor';

// Mock React Router
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => vi.fn(),
    useLocation: () => ({ 
      pathname: '/documents/stanford/sop', 
      state: { 
        applicationId: 'app1',
        universityName: 'Stanford University'
      } 
    }),
    useSearchParams: () => [new URLSearchParams('documentId=doc1'), vi.fn()],
  };
});

describe('DocumentEditor Component', () => {
  it('renders with correct university info from location state', () => {
    render(<DocumentEditor />);
    expect(screen.getByText(/Stanford University/)).toBeInTheDocument();
  });
});
```

## Mocking Custom Hooks

When testing components that use custom hooks, mock the hook:

```tsx
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DocumentEditor } from '../DocumentEditor';

// Mock the custom hook
vi.mock('../../../hooks/useDocumentEditor', () => ({
  __esModule: true,
  useDocumentEditor: () => ({
    document: {
      title: 'Statement of Purpose',
      content: 'This is a test document',
    },
    isLoading: false,
    saveDocument: vi.fn(),
    generateDocument: vi.fn(),
  }),
}));

describe('DocumentEditor Component', () => {
  it('renders the document title', () => {
    render(<DocumentEditor />);
    expect(screen.getByText('Statement of Purpose')).toBeInTheDocument();
  });
});
```

## Best Practices

1. **Test behavior, not implementation**: Focus on what the component does, not how it does it.
2. **Use semantic queries**: Prefer `getByRole`, `getByLabelText`, and `getByText` over `getByTestId`.
3. **Mock external dependencies**: Always mock API calls, router, and other external dependencies.
4. **Keep tests isolated**: Each test should be independent of others.
5. **Test edge cases**: Test loading states, error states, and boundary conditions.
6. **Use act() for state updates**: Wrap state updates in `act()` to ensure they're processed before assertions.
7. **Test accessibility**: Use `jest-axe` to test for accessibility issues.

## Testing Specific GradAid Components

### Dashboard

- Test that application stats are displayed correctly
- Test that recent documents are rendered
- Test that the application timeline shows the correct information
- Test navigation when clicking on cards

### DocumentEditor

- Test that document content is displayed in the textarea
- Test that saving a document calls the appropriate mutation
- Test that generating a document calls the appropriate action
- Test loading states and error handling

### Application Forms

- Test form validation
- Test form submission
- Test error handling and feedback

## Conclusion

Following these guidelines will help ensure that the GradAid application is well-tested and robust. Remember to write tests as you develop new features to maintain high code quality.

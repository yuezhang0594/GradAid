import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ClickableCard, CardAction } from '../clickablecard';

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock Card component to simplify testing
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div data-testid="card" className={className} onClick={onClick}>{children}</div>
  )
}));

// Mock tooltip components to simplify testing
vi.mock('@/components/ui/tooltip', () => ({
  Tooltip: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip">{children}</div>,
  TooltipContent: ({ children }: { children: React.ReactNode }) => <div data-testid="tooltip-content">{children}</div>,
  TooltipProvider: ({ children }: { children: React.ReactNode }) => <div>{children}</div>,
  TooltipTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="tooltip-trigger">{children}</div>
  )
}));

describe('ClickableCard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const defaultAction: CardAction = {
    label: 'View details',
    href: '/applications',
    tooltip: 'View application details'
  };

  it('renders children content correctly', () => {
    render(
      <ClickableCard action={defaultAction}>
        <div>Test Content</div>
      </ClickableCard>
    );
    
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders tooltip with correct content', () => {
    render(
      <ClickableCard action={defaultAction}>
        <div>Test Content</div>
      </ClickableCard>
    );
    
    expect(screen.getByTestId('tooltip')).toBeInTheDocument();
    expect(screen.getByTestId('tooltip-content')).toBeInTheDocument();
    expect(screen.getByText('View application details')).toBeInTheDocument();
  });

  it('navigates to the correct route when clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ClickableCard action={defaultAction}>
        <div>Test Content</div>
      </ClickableCard>
    );
    
    const card = screen.getByTestId('card');
    await user.click(card);
    
    expect(mockNavigate).toHaveBeenCalledWith('/applications');
  });

  it('calls the onClick handler when provided', async () => {
    const user = userEvent.setup();
    const mockOnClick = vi.fn();
    
    const actionWithOnClick: CardAction = {
      ...defaultAction,
      onClick: mockOnClick
    };
    
    render(
      <ClickableCard action={actionWithOnClick}>
        <div>Test Content</div>
      </ClickableCard>
    );
    
    const card = screen.getByTestId('card');
    await user.click(card);
    
    expect(mockOnClick).toHaveBeenCalled();
    expect(mockNavigate).not.toHaveBeenCalled(); // Should not navigate when onClick is provided
  });

  it('applies custom className when provided', () => {
    render(
      <ClickableCard action={defaultAction} className="custom-class">
        <div>Test Content</div>
      </ClickableCard>
    );
    
    const card = screen.getByTestId('card');
    expect(card.className).toContain('custom-class');
  });
});

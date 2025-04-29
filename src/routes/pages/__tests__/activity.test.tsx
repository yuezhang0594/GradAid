import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ActivityPage from '../activity';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: (query: any) => {
    if (query === 'userActivity/getRecentActivity') {
      return mockRecentActivities;
    }
    if (query === 'userActivity/getActivityStats') {
      return mockActivityStats;
    }
    return undefined;
  },
  useMutation: vi.fn(),
}));

// Mock data
let mockRecentActivities: any = undefined;
let mockActivityStats: any = undefined;

// Mock Convex API
vi.mock('#/_generated/api', () => ({
  api: {
    userActivity: {
      queries: {
        getRecentActivity: 'userActivity/getRecentActivity',
        getActivityStats: 'userActivity/getActivityStats',
      },
    },
  },
}));

// Mock UI components
vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title, description }: { children: React.ReactNode, title: string, description?: string }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/empty-state', () => ({
  EmptyState: ({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    actionHref 
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    actionLabel?: string, 
    actionHref?: string 
  }) => (
    <div data-testid="empty-state">
      <div data-testid="empty-state-icon">{Icon && <Icon />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && <a href={actionHref}>{actionLabel}</a>}
    </div>
  ),
}));

vi.mock('@/components/ui/card', () => ({
  Card: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card">{children}</div>
  ),
  CardContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-content">{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardDescription: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="card-description">{children}</div>
  ),
}));

vi.mock('@/components/ui/button', () => ({
  Button: ({ children, onClick, variant, className, disabled }: { 
    children: React.ReactNode, 
    onClick?: () => void, 
    variant?: string,
    className?: string,
    disabled?: boolean
  }) => (
    <button 
      data-testid="button" 
      onClick={onClick} 
      data-variant={variant}
      className={className}
      disabled={disabled}
    >
      {children}
    </button>
  ),
}));

vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant }: { children: React.ReactNode, variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
}));

vi.mock('@/components/ui/dropdown-menu', () => ({
  DropdownMenu: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu">{children}</div>
  ),
  DropdownMenuTrigger: ({ children, asChild }: { children: React.ReactNode, asChild?: boolean }) => (
    <div data-testid="dropdown-menu-trigger" data-as-child={asChild ? 'true' : 'false'}>{children}</div>
  ),
  DropdownMenuContent: ({ children, align, className }: { children: React.ReactNode, align?: string, className?: string }) => (
    <div data-testid="dropdown-menu-content" data-align={align} className={className}>{children}</div>
  ),
  DropdownMenuLabel: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="dropdown-menu-label">{children}</div>
  ),
  DropdownMenuSeparator: () => <hr data-testid="dropdown-menu-separator" />,
  DropdownMenuCheckboxItem: ({ 
    children, 
    checked, 
    onCheckedChange 
  }: { 
    children: React.ReactNode, 
    checked?: boolean, 
    onCheckedChange?: (checked: boolean) => void 
  }) => (
    <div 
      data-testid="dropdown-menu-checkbox-item" 
      data-checked={checked ? 'true' : 'false'}
      onClick={() => onCheckedChange && onCheckedChange(!checked)}
    >
      {children}
    </div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  Activity: () => <div data-testid="activity-icon">Activity Icon</div>,
  FileText: () => <div data-testid="file-text-icon">FileText Icon</div>,
  SparklesIcon: () => <div data-testid="sparkles-icon">Sparkles Icon</div>,
  Clock: () => <div data-testid="clock-icon">Clock Icon</div>,
  Filter: () => <div data-testid="filter-icon">Filter Icon</div>,
  ChevronsUpDown: () => <div data-testid="chevrons-up-down-icon">ChevronsUpDown Icon</div>,
  ClipboardXIcon: () => <div data-testid="clipboard-x-icon">ClipboardX Icon</div>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '2 days ago'),
}));

describe('ActivityPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockRecentActivities = undefined;
    mockActivityStats = undefined;
  });

  it('renders loading state when data is being fetched', () => {
    // Mock data is already undefined by default
    render(<ActivityPage />);
    
    expect(screen.getByText('Loading activity...')).toBeInTheDocument();
  });

  it('renders empty state when no activities are available', () => {
    // Mock empty activities array
    mockRecentActivities = [];
    mockActivityStats = { today: 0, thisWeek: 0, thisMonth: 0 };

    render(<ActivityPage />);
    
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No Applications Found')).toBeInTheDocument();
  });

  it('renders activity feed with stats and activities', async () => {
    // Mock activity data
    mockRecentActivities = [
      {
        _id: 'act1',
        type: 'document_edit',
        description: 'Edited SOP document',
        timestamp: new Date().toISOString(),
        metadata: {
          documentId: 'doc1',
        },
      },
      {
        _id: 'act2',
        type: 'application_update',
        description: 'Updated application status',
        timestamp: new Date().toISOString(),
        metadata: {
          applicationId: 'app1',
          oldStatus: 'draft',
          newStatus: 'submitted',
        },
      },
    ];

    mockActivityStats = {
      today: 5,
      thisWeek: 12,
      thisMonth: 30,
    };

    render(<ActivityPage />);
    
    // Check page title and description
    expect(screen.getByText('Recent Activity')).toBeInTheDocument();
    expect(screen.getByText('Track your recent actions and progress')).toBeInTheDocument();
    
    // Check stats cards
    expect(screen.getByText('5')).toBeInTheDocument(); // Today's count
    expect(screen.getByText('12')).toBeInTheDocument(); // This week's count
    expect(screen.getByText('30')).toBeInTheDocument(); // This month's count
    
    // Check activity feed
    expect(screen.getByText('Activity Feed')).toBeInTheDocument();
    expect(screen.getByText('Your recent actions and updates')).toBeInTheDocument();
    
    // Check individual activities
    expect(screen.getAllByText('Document Edit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Application Update').length).toBeGreaterThan(0);
    expect(screen.getByText('Edited SOP document')).toBeInTheDocument();
    expect(screen.getByText('Updated application status')).toBeInTheDocument();
    
    // Check badges
    expect(screen.getAllByText('2 days ago').length).toBe(2);
    expect(screen.getAllByText('Document Update').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Application Update').length).toBeGreaterThan(0);
    expect(screen.getByText('Status: draft → submitted')).toBeInTheDocument();
  });

  it('allows filtering activities by type', async () => {
    const user = userEvent.setup();
    
    // Mock activity data
    mockRecentActivities = [
      {
        _id: 'act1',
        type: 'document_edit',
        description: 'Edited SOP document',
        timestamp: new Date().toISOString(),
        metadata: {
          documentId: 'doc1',
        },
      },
      {
        _id: 'act2',
        type: 'application_update',
        description: 'Updated application status',
        timestamp: new Date().toISOString(),
        metadata: {
          applicationId: 'app1',
        },
      },
    ];

    mockActivityStats = {
      today: 5,
      thisWeek: 12,
      thisMonth: 30,
    };

    render(<ActivityPage />);
    
    // Open filter dropdown
    const filterButton = screen.getByText('Filter');
    await user.click(filterButton);
    
    // Check filter options
    expect(screen.getByText('Filter by Activity Type')).toBeInTheDocument();
    expect(screen.getAllByText('Document Edit').length).toBeGreaterThan(0);
    expect(screen.getAllByText('Application Update').length).toBeGreaterThan(0);
    
    // Select a filter
    const documentEditFilter = screen.getAllByTestId('dropdown-menu-checkbox-item')[0];
    await user.click(documentEditFilter);
    
    // Check that the filter is applied (this would update the state in the real component)
    expect(documentEditFilter).toHaveAttribute('data-checked', 'true');
  });
});

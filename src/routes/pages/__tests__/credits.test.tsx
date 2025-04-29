import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import CreditsPage from '../credits';

// Mock Convex hooks
vi.mock('convex/react', () => ({
  useQuery: (query: string) => {
    if (query === 'aiCredits/getAiCredits') {
      return mockCredits;
    }
    if (query === 'aiCredits/getAiCreditsRemaining') {
      return mockRemaining;
    }
    if (query === 'aiCredits/getAiCreditUsage') {
      return mockUsageByType;
    }
    return undefined;
  },
}));

// Mock data
let mockCredits: any = undefined;
let mockRemaining: any = undefined;
let mockUsageByType: any[] = [];

// Mock Convex API
vi.mock('#/_generated/api', () => ({
  api: {
    aiCredits: {
      queries: {
        getAiCredits: 'aiCredits/getAiCredits',
        getAiCreditsRemaining: 'aiCredits/getAiCreditsRemaining',
        getAiCreditUsage: 'aiCredits/getAiCreditUsage',
      },
    },
  },
}));

// Mock UI components
vi.mock('@/components/ui', () => ({
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
  Badge: ({ children, variant }: { children: React.ReactNode, variant?: string }) => (
    <span data-testid="badge" data-variant={variant}>{children}</span>
  ),
  Progress: ({ value, className }: { value: number, className?: string }) => (
    <div data-testid="progress" data-value={value} className={className}></div>
  ),
  EmptyState: ({ 
    icon: Icon, 
    title, 
    description, 
    actionLabel, 
    actionHref,
    className 
  }: { 
    icon: any, 
    title: string, 
    description: string, 
    actionLabel?: string, 
    actionHref?: string,
    className?: string
  }) => (
    <div data-testid="empty-state" className={className}>
      <div data-testid="empty-state-icon">{Icon && <Icon />}</div>
      <h3>{title}</h3>
      <p>{description}</p>
      {actionLabel && <a href={actionHref}>{actionLabel}</a>}
    </div>
  ),
  PageWrapper: ({ children, title, description }: { children: React.ReactNode, title: string, description?: string }) => (
    <div data-testid="page-wrapper" data-title={title} data-description={description}>
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  ),
}));

// Mock Lucide icons
vi.mock('lucide-react', () => ({
  SparklesIcon: () => <div data-testid="sparkles-icon">Sparkles Icon</div>,
  BarChart3: () => <div data-testid="bar-chart-icon">BarChart3 Icon</div>,
  Clock: () => <div data-testid="clock-icon">Clock Icon</div>,
  CreditCard: () => <div data-testid="credit-card-icon">CreditCard Icon</div>,
  MonitorXIcon: () => <div data-testid="monitor-x-icon">MonitorX Icon</div>,
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  format: vi.fn(() => '2025-05-01'),
}));

describe('CreditsPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockCredits = undefined;
    mockRemaining = undefined;
    mockUsageByType = [];
  });

  it('renders loading state when data is being fetched', () => {
    // Mock data is already undefined by default
    render(<CreditsPage />);
    
    expect(screen.getByText('Loading credits...')).toBeInTheDocument();
  });

  it('renders page with credit information when data is available', () => {
    // Mock credit data
    mockCredits = {
      totalCredits: 100,
      usedCredits: 25,
      resetDate: new Date('2025-05-01').toISOString(),
    };

    mockRemaining = 75;

    mockUsageByType = [
      { type: 'sop_request', used: 10, percentage: 40 },
      { type: 'lor_request', used: 8, percentage: 32 },
      { type: 'sop_update', used: 7, percentage: 28 },
    ];

    render(<CreditsPage />);
    
    // Check page title and description
    expect(screen.getByText('AI Credits')).toBeInTheDocument();
    expect(screen.getByText('Monitor your AI credit usage and see detailed statistics')).toBeInTheDocument();
    
    // Check credit stats
    expect(screen.getByText('75')).toBeInTheDocument(); // Remaining credits
    expect(screen.getByText('of 100 total credits')).toBeInTheDocument();
    expect(screen.getByText('25')).toBeInTheDocument(); // Used credits
    expect(screen.getByText('25% of total credits')).toBeInTheDocument();
    expect(screen.getByText('2025-05-01')).toBeInTheDocument(); // Reset date
    expect(screen.getByText('Monthly credit refresh')).toBeInTheDocument();
    expect(screen.getByText('Basic Plan')).toBeInTheDocument();
    expect(screen.getByText('100 credits/month')).toBeInTheDocument();
    
    // Check usage breakdown
    expect(screen.getByText('Usage by Type')).toBeInTheDocument();
    expect(screen.getByText('Breakdown of AI credit usage by activity')).toBeInTheDocument();
    
    // Check individual usage items
    expect(screen.getByText('Generate Statement of Purpose')).toBeInTheDocument();
    expect(screen.getByText('Generate Letter of Recommendation')).toBeInTheDocument();
    expect(screen.getByText('Update Statement of Purpose')).toBeInTheDocument();
    
    // Check usage percentages
    expect(screen.getByText('40%')).toBeInTheDocument();
    expect(screen.getByText('32%')).toBeInTheDocument();
    expect(screen.getByText('28%')).toBeInTheDocument();
    
    // Check credit badges
    expect(screen.getByText('10 credits')).toBeInTheDocument();
    expect(screen.getByText('8 credits')).toBeInTheDocument();
    expect(screen.getByText('7 credits')).toBeInTheDocument();
  });

  it('renders empty state when no usage data is available', () => {
    // Mock credit data with no usage
    mockCredits = {
      totalCredits: 100,
      usedCredits: 0,
      resetDate: new Date('2025-05-01').toISOString(),
    };

    mockRemaining = 100;
    mockUsageByType = [];

    render(<CreditsPage />);
    
    // Check that the empty state is rendered
    expect(screen.getByTestId('empty-state')).toBeInTheDocument();
    expect(screen.getByText('No AI Credit Usage Found')).toBeInTheDocument();
    expect(screen.getByText(/You haven't used any AI credits yet/)).toBeInTheDocument();
    expect(screen.getByText('Open Documents')).toBeInTheDocument();
  });
});

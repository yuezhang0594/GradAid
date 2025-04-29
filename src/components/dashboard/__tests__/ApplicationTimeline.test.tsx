import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ApplicationTimeline } from '../ApplicationTimeline';
import { Id } from "#/_generated/dataModel";

// Mock react-router-dom's useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', () => ({
  useNavigate: () => mockNavigate
}));

// Mock Card component
vi.mock('@/components/ui/card', () => ({
  Card: ({ children, className, onClick }: { children: React.ReactNode, className?: string, onClick?: () => void }) => (
    <div data-testid="timeline-card" className={className} onClick={onClick}>{children}</div>
  ),
  CardHeader: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-header" className={className}>{children}</div>
  ),
  CardTitle: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-title" className={className}>{children}</div>
  ),
  CardDescription: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-description" className={className}>{children}</div>
  ),
  CardContent: ({ children, className }: { children: React.ReactNode, className?: string }) => (
    <div data-testid="card-content" className={className}>{children}</div>
  ),
}));

// Mock Badge component
vi.mock('@/components/ui/badge', () => ({
  Badge: ({ children, variant, className }: { children: React.ReactNode, variant?: string, className?: string }) => (
    <span data-testid="badge" data-variant={variant} className={className}>{children}</span>
  )
}));

// Mock Button component
vi.mock('@/components/ui/button', () => ({
  Button: ({ children, variant, onClick, className }: { children: React.ReactNode, variant?: string, onClick?: () => void, className?: string }) => (
    <button data-testid="button" data-variant={variant} className={className} onClick={onClick}>{children}</button>
  )
}));

// Mock icons
vi.mock('lucide-react', () => ({
  Calendar: () => <span data-testid="calendar-icon">Calendar</span>,
  ChevronUpIcon: () => <span data-testid="chevron-up-icon">ChevronUp</span>,
  ChevronDownIcon: () => <span data-testid="chevron-down-icon">ChevronDown</span>,
  ExternalLink: () => <span data-testid="external-link-icon">ExternalLink</span>,
  TargetIcon: () => <span data-testid="target-icon">Target</span>,
}));

describe('ApplicationTimeline Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const mockApplications = [
    {
      id: 'app1' as unknown as Id<"applications">,
      university: 'Stanford University',
      program: 'Computer Science',
      degree: 'MS',
    },
    {
      id: 'app2' as unknown as Id<"applications">,
      university: 'MIT',
      program: 'Artificial Intelligence',
      degree: 'MS',
    }
  ];

  const mockTimelineEvents = [
    {
      date: new Date('2025-05-15').toISOString(),
      university: 'Stanford University',
      program: 'MS in Computer Science',
      priority: 'high' as const,
      requirements: [
        {
          type: 'Documents',
          status: 'in_progress' as const
        }
      ],
      notes: '2/3 documents completed'
    },
    {
      date: new Date('2025-06-01').toISOString(),
      university: 'MIT',
      program: 'MS in Artificial Intelligence',
      priority: 'medium' as const,
      requirements: [
        {
          type: 'Documents',
          status: 'in_progress' as const
        }
      ],
      notes: '1/3 documents completed'
    }
  ];

  it('renders timeline events correctly', () => {
    render(
      <ApplicationTimeline 
        applications={mockApplications}
        timelineEvents={mockTimelineEvents}
      />
    );
    
    // Check if both universities are rendered
    expect(screen.getByText('Stanford University')).toBeInTheDocument();
    expect(screen.getByText('MIT')).toBeInTheDocument();
    
    // Check if programs are rendered
    expect(screen.getByText('MS in Computer Science')).toBeInTheDocument();
    expect(screen.getByText('MS in Artificial Intelligence')).toBeInTheDocument();
    
    // Check if notes are rendered
    expect(screen.getByText('2/3 documents completed')).toBeInTheDocument();
    expect(screen.getByText('1/3 documents completed')).toBeInTheDocument();
    
    // Check if requirements are rendered
    const badges = screen.getAllByTestId('badge');
    expect(badges.length).toBeGreaterThanOrEqual(2); // At least 2 badges (1 for each timeline event)
    
    // Check for dates
    expect(screen.getByText(new Date('2025-05-15').toLocaleDateString())).toBeInTheDocument();
    expect(screen.getByText(new Date('2025-06-01').toLocaleDateString())).toBeInTheDocument();
  });

  it('navigates to application details when a timeline card is clicked', async () => {
    const user = userEvent.setup();
    
    render(
      <ApplicationTimeline 
        applications={mockApplications}
        timelineEvents={mockTimelineEvents}
      />
    );
    
    // Get the first timeline card and click it
    const timelineCards = screen.getAllByTestId('timeline-card');
    await user.click(timelineCards[0]);
    
    // Check if navigate was called with the correct parameters
    expect(mockNavigate).toHaveBeenCalledWith(
      '/applications/Stanford University',
      expect.objectContaining({
        state: expect.objectContaining({
          applicationId: 'app1',
          universityName: 'Stanford University'
        })
      })
    );
  });

  it('shows "Show More" button when there are more than the initial number of events', () => {
    // Create more timeline events than the initial number to show
    const manyEvents = Array(6).fill(null).map((_, index) => ({
      date: new Date(`2025-0${index+1}-15`).toISOString(),
      university: `University ${index+1}`,
      program: `MS in Program ${index+1}`,
      priority: index % 2 === 0 ? 'high' as const : 'medium' as const,
      requirements: [
        {
          type: 'Documents',
          status: 'in_progress' as const
        }
      ],
      notes: `${index}/3 documents completed`
    }));
    
    render(
      <ApplicationTimeline 
        applications={mockApplications}
        timelineEvents={manyEvents}
      />
    );
    
    // Check if the "Show More" button is rendered
    expect(screen.getByText(/Show More/)).toBeInTheDocument();
  });

  it('toggles between showing all events and initial events when "Show More/Less" is clicked', async () => {
    const user = userEvent.setup();
    
    // Create more timeline events than the initial number to show
    const manyEvents = Array(6).fill(null).map((_, index) => ({
      date: new Date(`2025-0${index+1}-15`).toISOString(),
      university: `University ${index+1}`,
      program: `MS in Program ${index+1}`,
      priority: index % 2 === 0 ? 'high' as const : 'medium' as const,
      requirements: [
        {
          type: 'Documents',
          status: 'in_progress' as const
        }
      ],
      notes: `${index}/3 documents completed`
    }));
    
    render(
      <ApplicationTimeline 
        applications={mockApplications}
        timelineEvents={manyEvents}
      />
    );
    
    // Initially, we should see only the first few events
    const initialCards = screen.getAllByTestId('timeline-card');
    const initialCount = initialCards.length;
    
    // Click "Show More"
    const showMoreButton = screen.getByText(/Show More/);
    await user.click(showMoreButton);
    
    // Now we should see all events
    const allCards = screen.getAllByTestId('timeline-card');
    expect(allCards.length).toBeGreaterThan(initialCount);
    
    // Click "Show Less"
    const showLessButton = screen.getByText(/Show Less/);
    await user.click(showLessButton);
    
    // Now we should see only the initial number of events again
    const finalCards = screen.getAllByTestId('timeline-card');
    expect(finalCards.length).toBe(initialCount);
  });

  it('renders empty state when no timeline events are provided', () => {
    render(
      <ApplicationTimeline 
        applications={[]}
        timelineEvents={[]}
      />
    );
    
    expect(screen.getByText('No timeline events found.')).toBeInTheDocument();
  });
});

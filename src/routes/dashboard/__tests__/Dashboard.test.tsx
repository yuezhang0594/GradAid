import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor, fireEvent } from '@testing-library/react';
import { render } from '../../../test/utils';
import Dashboard from '../Dashboard';

// Create a mock data factory to reuse across tests
const createDashboardDataMock = (overrides = {}) => ({
  stats: {
    applications: { 
      total: 5, 
      submitted: 2, 
      inProgress: 3, 
      nextDeadline: new Date('2025-05-15').toISOString() 
    },
    documents: { 
      totalDocuments: 8, 
      averageProgress: 75, 
      completedDocuments: 3 
    },
    aiCredits: { 
      totalCredits: 500, 
      usedCredits: 250,
      resetDate: new Date('2025-04-01').toISOString()
    },
    recentActivity: Array(12).fill({})
  },
  applicationStats: [
    {
      title: "Active Applications",
      value: "5",
      description: "2 submitted, 3 in progress",
      action: {
        label: "View all applications",
        href: "/applications",
        tooltip: "View summary of all your applications",
      },
    },
    {
      title: "AI Credits Used",
      value: "250/500",
      description: "Reset on 04/01/2025",
      action: {
        label: "View usage",
        href: "/credits",
        tooltip: "Monitor your AI credit usage",
      },
    },
    {
      title: "Next Deadline",
      value: "Stanford University",
      description: "Due 05/15/2025",
      action: {
        label: "View timeline",
        href: "/timeline",
        tooltip: "Check upcoming deadlines",
      },
    },
    {
      title: "Recent Activity",
      value: "12",
      description: "Last 7 days",
      action: {
        label: "View activity",
        href: "/activity",
        tooltip: "See your recent actions",
      },
    },
  ],
  documentStats: [
    {
      title: "SOP",
      progress: 75,
      status: "draft",
      university: "Stanford University",
      program: "MS Computer Science",
      type: "sop",
      documentId: "doc1",
      applicationId: "app1",
      lastEdited: new Date().toISOString(),
      action: {
        label: "Edit Document",
        href: "/applications/Stanford University/documents/sop",
        tooltip: "Continue editing document",
      },
    },
    {
      title: "Research Statement",
      progress: 45,
      status: "draft",
      university: "MIT",
      program: "MS Artificial Intelligence",
      type: "researchStatement",
      documentId: "doc2",
      applicationId: "app2",
      lastEdited: new Date().toISOString(),
      action: {
        label: "Edit Document",
        href: "/applications/MIT/documents/researchstatement",
        tooltip: "Continue editing document",
      },
    },
    {
      title: "CV",
      progress: 100,
      status: "completed",
      university: "UC Berkeley",
      program: "MS Computer Science",
      type: "cv",
      documentId: "doc3",
      applicationId: "app3",
      lastEdited: new Date().toISOString(),
      action: {
        label: "Edit Document",
        href: "/applications/UC Berkeley/documents/cv",
        tooltip: "Continue editing document",
      },
    },
  ],
  applicationTimeline: [
    {
      date: new Date('2025-05-15').toISOString(),
      university: "Stanford University",
      program: "MS in Computer Science",
      priority: "high",
      requirements: [
        {
          type: "Documents",
          status: "in_progress"
        }
      ],
      notes: "2/3 requirements complete"
    },
    {
      date: new Date('2025-06-01').toISOString(),
      university: "MIT",
      program: "MS in Artificial Intelligence",
      priority: "medium",
      requirements: [
        {
          type: "Documents",
          status: "in_progress"
        }
      ],
      notes: "1/3 requirements complete"
    },
    {
      date: new Date('2025-06-15').toISOString(),
      university: "UC Berkeley",
      program: "MS in Computer Science",
      priority: "medium",
      requirements: [
        {
          type: "Documents",
          status: "pending"
        }
      ],
      notes: "0/3 requirements complete"
    },
  ],
  ...overrides
});

// Mock function for useDashboardData
const mockUseDashboardData = vi.fn().mockReturnValue(createDashboardDataMock());

// Mock the useDashboardData hook
vi.mock('../../../hooks/useDashboardData', () => ({
  useDashboardData: () => mockUseDashboardData()
}));

// Mock Convex queries - still needed for direct API calls in the Dashboard component
vi.mock('convex/react', () => {
  return {
    ConvexProvider: ({ children }: { children: React.ReactNode }) => <>{children}</>,
    ConvexReactClient: vi.fn(),
    useQuery: vi.fn(() => [
      {
        _id: 'app1',
        _creationTime: Date.now(),
        university: 'Stanford University',
        program: 'Computer Science',
        degree: 'MS',
        deadline: new Date('2025-05-15').toISOString(),
        status: 'submitted',
        priority: 'high',
        userId: 'user1',
        progress: 75,
        documentsComplete: 2,
        totalDocuments: 3
      },
      {
        _id: 'app2',
        _creationTime: Date.now(),
        university: 'MIT',
        program: 'Artificial Intelligence',
        degree: 'MS',
        deadline: new Date('2025-06-01').toISOString(),
        status: 'submitted',
        priority: 'medium',
        userId: 'user1',
        progress: 45,
        documentsComplete: 1,
        totalDocuments: 3
      },
      {
        _id: 'app3',
        _creationTime: Date.now(),
        university: 'UC Berkeley',
        program: 'Computer Science',
        degree: 'MS',
        deadline: new Date('2025-06-15').toISOString(),
        status: 'in_progress',
        priority: 'medium',
        userId: 'user1',
        progress: 0,
        documentsComplete: 0,
        totalDocuments: 3
      }
    ]),
    useMutation: vi.fn(() => vi.fn()),
    useAction: vi.fn(() => vi.fn()),
  };
});


// Update the React Router mock to capture navigation
vi.mock('react-router-dom', () => ({
  useLocation: vi.fn(() => ({ pathname: '/dashboard' })),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset the mock to default value before each test
    mockUseDashboardData.mockReturnValue(createDashboardDataMock());
  });

  it('renders application stats correctly', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Active Applications')).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument();
      expect(screen.getByText('2 submitted, 3 in progress')).toBeInTheDocument();
    });
  });

  it('renders document section', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Documents')).toBeInTheDocument();
      expect(screen.getByText('SOP')).toBeInTheDocument();
      expect(screen.getByText('Research Statement')).toBeInTheDocument();
      expect(screen.getByText('CV')).toBeInTheDocument();
    });
  });

  it('renders application timeline section', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('Application Timeline')).toBeInTheDocument();
      // Stanford University appears multiple times in the component
      const stanfordElements = screen.getAllByText('Stanford University');
      expect(stanfordElements.length).toBeGreaterThan(0);
      
      // Use getAllByText for text that appears multiple times
      const msComputerScienceElements = screen.getAllByText('MS in Computer Science');
      expect(msComputerScienceElements.length).toBeGreaterThan(0);
      
      // MIT appears multiple times
      const mitElements = screen.getAllByText('MIT');
      expect(mitElements.length).toBeGreaterThan(0);
      
      // This text should be unique
      expect(screen.getByText('MS in Artificial Intelligence')).toBeInTheDocument();
    });
  });

  // Test for "Show More/Less" button for documents
  it('toggles document visibility when Show More/Less is clicked', async () => {
    // Create a mock that returns more documents than initialDocumentsToShow
    mockUseDashboardData.mockReturnValue(createDashboardDataMock({
      documentStats: Array(6).fill(0).map((_, i) => ({
        title: `Document ${i+1}`,
        progress: 75,
        status: "draft",
        university: `University ${i+1}`,
        program: `Program ${i+1}`,
        type: "sop",
        documentId: `doc${i+1}`,
        applicationId: `app${i+1}`,
        lastEdited: new Date().toISOString(),
        action: { 
          label: "Edit", 
          href: `/path/to/doc${i+1}`,
          tooltip: "Edit document"
        },
      }))
    }));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      // Initially only shows 4 documents (initialDocumentsToShow)
      expect(screen.getAllByText(/Document \d+/).length).toBe(4);
      
      // Click "Show More"
      const showMoreButton = screen.getByText(/Show More/);
      fireEvent.click(showMoreButton);
      
      // Should show all 6 documents
      expect(screen.getAllByText(/Document \d+/).length).toBe(6);
      
      // Click "Show Less"
      const showLessButton = screen.getByText('Show Less');
      fireEvent.click(showLessButton);
      
      // Back to showing 4 documents
      expect(screen.getAllByText(/Document \d+/).length).toBe(4);
    });
  });
  
  // Test for empty timeline message
  it('displays empty timeline message when no timeline events exist', async () => {
    mockUseDashboardData.mockReturnValue(createDashboardDataMock({
      applicationTimeline: []
    }));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      expect(screen.getByText('No timeline events found.')).toBeInTheDocument();
    });
  });

  // Test for timeline requirement badges display
  it('renders timeline requirement badges correctly', async () => {
    render(<Dashboard />);
    
    await waitFor(() => {
      // Look for header text first to ensure it's rendered
      expect(screen.getByText('Application Timeline')).toBeInTheDocument();
    });
    
    // Try different strategies to find the section
    const timelineHeading = screen.getByText('Application Timeline');
    // Try to find a parent section or div that contains the timeline
    const timelineSection = timelineHeading.closest('section') || 
                            timelineHeading.closest('div[class*="timeline"]') ||
                            timelineHeading.parentElement?.parentElement;
    
    // Verify we found a container for the timeline
    expect(timelineSection).not.toBeNull();
    
    // Check that we have the expected timeline items - search from root if needed
    expect(screen.getAllByText('Stanford University').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MIT').length).toBeGreaterThan(0);
    expect(screen.getAllByText('UC Berkeley').length).toBeGreaterThan(0);
    
    // Check for document requirement badges
    expect(screen.getAllByText('Documents').length).toBeGreaterThan(0);
    
    // Verify notes about document completion
    expect(screen.getByText('2/3 requirements complete')).toBeInTheDocument();
    expect(screen.getByText('1/3 requirements complete')).toBeInTheDocument();
    expect(screen.getByText('0/3 requirements complete')).toBeInTheDocument();
    
    // Find the badges directly without relying on specific nesting structure
    const documentBadges = screen.getAllByText('Documents');
    expect(documentBadges.length).toBeGreaterThanOrEqual(3);
  });
  
  // Test for "Show More/Less" button for timeline
  it('toggles timeline visibility when Show More/Less is clicked', async () => {
    // Create a mock that returns more timeline items than initialTimelinesToShow (4)
    mockUseDashboardData.mockReturnValue(createDashboardDataMock({
      applicationTimeline: Array(6).fill(0).map((_, i) => ({
        date: new Date(`2025-0${i+1}-15`).toISOString(),
        university: `University ${i+1}`,
        program: `MS in Program ${i+1}`,
        priority: i < 2 ? "high" : "medium",
        requirements: [
          {
            type: "Documents",
            status: "in_progress"
          }
        ],
        notes: `${i}/3 requirements complete`
      }))
    }));
    
    render(<Dashboard />);
    
    await waitFor(() => {
      // Initially only shows 4 timeline items (initialTimelinesToShow)
      expect(screen.getAllByText(/University \d+/).length).toBe(4);
      
      // Click "Show More"
      const showMoreButton = screen.getByText(/Show More \(\d+ more\)/);
      fireEvent.click(showMoreButton);
      
      // Should show all 6 timeline items
      expect(screen.getAllByText(/University \d+/).length).toBe(6);
      
      // Click "Show Less"
      const showLessButton = screen.getByText('Show Less');
      fireEvent.click(showLessButton);
      
      // Back to showing 4 timeline items
      expect(screen.getAllByText(/University \d+/).length).toBe(4);
    });
  });
});

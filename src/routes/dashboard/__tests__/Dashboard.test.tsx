import { describe, it, expect, vi, beforeEach } from 'vitest';
import { screen, waitFor } from '@testing-library/react';
import { render } from '../../../test/utils';
import Dashboard from '../Dashboard';

// Mock the useDashboardData hook
vi.mock('@/hooks/useDashboardData', () => ({
  useDashboardData: () => ({
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
        notes: "2/3 documents completed"
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
        notes: "1/3 documents completed"
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
        notes: "0/3 documents completed"
      },
    ]
  })
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

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => vi.fn()),
  useLocation: vi.fn(() => ({ pathname: '/dashboard' })),
  Link: ({ children, to }: { children: React.ReactNode; to: string }) => (
    <a href={to}>{children}</a>
  ),
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
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
});

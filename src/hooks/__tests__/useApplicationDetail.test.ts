import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useApplicationDetail } from '../useApplicationDetail';
import { Id } from "#/_generated/dataModel";
import { formatDistanceToNow } from "date-fns";

// Mock the Convex queries
vi.mock('convex/react', () => ({
  useQuery: vi.fn((query, args) => {
    if (query.name === 'applications.queries.getApplicationDetails') {
      if (args.applicationId === 'app1') {
        return {
          _id: 'app1' as unknown as Id<"applications">,
          _creationTime: Date.now(),
          university: 'Stanford University',
          program: 'Computer Science',
          degree: 'MS',
          deadline: new Date('2025-05-15').toISOString(),
          status: 'submitted',
          priority: 'high',
          progress: 75,
          documentsComplete: 2,
          totalDocuments: 3,
          userId: 'user1',
          documents: [
            {
              _id: 'doc1' as unknown as Id<"applicationDocuments">,
              _creationTime: Date.now(),
              title: 'Statement of Purpose',
              content: 'This is a test document content',
              lastEdited: new Date().toISOString(),
              status: 'draft',
              type: 'sop',
              applicationId: 'app1' as unknown as Id<"applications">,
              userId: 'user1',
              progress: 75,
              aiSuggestionsCount: 2,
            },
            {
              _id: 'doc2' as unknown as Id<"applicationDocuments">,
              _creationTime: Date.now(),
              title: 'CV',
              content: 'This is a CV content',
              lastEdited: new Date().toISOString(),
              status: 'complete',
              type: 'cv',
              applicationId: 'app1' as unknown as Id<"applications">,
              userId: 'user1',
              progress: 100,
              aiSuggestionsCount: 0,
            },
            {
              _id: 'doc3' as unknown as Id<"applicationDocuments">,
              _creationTime: Date.now(),
              title: 'Research Statement',
              content: 'This is a research statement content',
              lastEdited: new Date().toISOString(),
              status: 'not_started',
              type: 'researchStatement',
              applicationId: 'app1' as unknown as Id<"applications">,
              userId: 'user1',
              progress: 0,
              aiSuggestionsCount: 0,
            }
          ]
        };
      } else if (args.applicationId === 'nonexistent') {
        return null;
      }
    }
    return undefined;
  })
}));

// Mock the API
vi.mock('#/_generated/api', () => ({
  api: {
    applications: {
      queries: {
        getApplicationDetails: { name: 'applications.queries.getApplicationDetails' }
      }
    }
  }
}));

// Mock date-fns
vi.mock('date-fns', () => ({
  formatDistanceToNow: vi.fn(() => '47 days')
}));

describe('useApplicationDetail Hook', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('returns application details when applicationId is valid', () => {
    const { result } = renderHook(() => 
      useApplicationDetail('app1' as unknown as Id<"applications">)
    );
    
    // Check if application data is returned
    expect(result.current.application).not.toBeNull();
    expect(result.current.application?.university).toBe('Stanford University');
    expect(result.current.application?.program).toBe('Computer Science');
    expect(result.current.application?.degree).toBe('MS');
    expect(result.current.application?.status).toBe('submitted');
    expect(result.current.application?.priority).toBe('high');
    
    // Check if application stats are formatted correctly
    expect(result.current.applicationStats).toHaveLength(3);
    
    // Check Status stat
    const statusStat = result.current.applicationStats[0];
    expect(statusStat.title).toBe('Status');
    expect(statusStat.value).toBe('submitted');
    expect(statusStat.description).toBe('Priority: high');
    expect(statusStat.action.href).toBe('/applications/Stanford University/status');
    
    // Check Documents stat
    const docsStat = result.current.applicationStats[1];
    expect(docsStat.title).toBe('Documents');
    expect(docsStat.value).toBe('3 Required');
    expect(docsStat.description).toBe('1 Completed');
    expect(docsStat.action.href).toBe('/applications/Stanford University/documents');
    
    // Check Deadline stat
    const deadlineStat = result.current.applicationStats[2];
    expect(deadlineStat.title).toBe('Deadline');
    expect(deadlineStat.value).toBe(new Date('2025-05-15').toLocaleDateString());
    expect(deadlineStat.description).toBe('47 days remaining');
    expect(deadlineStat.action.href).toBe('/timeline');
    
    // Check if document stats are formatted correctly
    expect(result.current.documentStats).toHaveLength(3);
    
    // Check SOP document
    const sopDoc = result.current.documentStats[0];
    expect(sopDoc.title).toBe('Statement of Purpose');
    expect(sopDoc.progress).toBe(75);
    expect(sopDoc.status).toBe('draft');
    expect(sopDoc.type).toBe('sop');
    expect(sopDoc.university).toBe('Stanford University');
    expect(sopDoc.action.href).toBe('/applications/Stanford University/documents/sop');
    
    // Check CV document
    const cvDoc = result.current.documentStats[1];
    expect(cvDoc.title).toBe('CV');
    expect(cvDoc.progress).toBe(100);
    expect(cvDoc.status).toBe('complete');
    expect(cvDoc.type).toBe('cv');
    
    // Check Research Statement document
    const researchDoc = result.current.documentStats[2];
    expect(researchDoc.title).toBe('Research Statement');
    expect(researchDoc.progress).toBe(0);
    expect(researchDoc.status).toBe('not_started');
    expect(researchDoc.type).toBe('researchStatement');
    
    // Check loading state
    expect(result.current.isLoading).toBe(false);
  });

  it('returns null application and empty arrays when applicationId does not exist', () => {
    const { result } = renderHook(() => 
      useApplicationDetail('nonexistent' as unknown as Id<"applications">)
    );
    
    expect(result.current.application).toBeNull();
    expect(result.current.applicationStats).toHaveLength(0);
    expect(result.current.documentStats).toHaveLength(0);
    expect(result.current.isLoading).toBe(false);
  });

  it('returns loading state when application data is undefined', () => {
    // This will trigger the undefined case in our mock
    const { result } = renderHook(() => 
      useApplicationDetail('loading' as unknown as Id<"applications">)
    );
    
    expect(result.current.application).toBeNull();
    expect(result.current.applicationStats).toHaveLength(0);
    expect(result.current.documentStats).toHaveLength(0);
    expect(result.current.isLoading).toBe(true);
  });
});

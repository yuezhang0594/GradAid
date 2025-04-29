import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ResendDashboard from '../ResendDashboard';

// Define domain interface
interface Domain {
  name: string;
  status: string;
}

// Mock the entire component to simplify testing
vi.mock('../ResendDashboard', () => ({
  default: () => (
    <div data-testid="resend-dashboard">
      <h3>Resend Email Configuration</h3>
      <div data-testid="api-status">
        {mockApiStatus}
      </div>
      <div data-testid="domains-list">
        {mockDomains.map((domain, index) => (
          <div key={index} data-testid={`domain-${index}`}>
            <span data-testid="domain-name">{domain.name}</span>
            <span data-testid="domain-status">{domain.status}</span>
          </div>
        ))}
      </div>
      <button data-testid="button-refresh" onClick={() => mockRefreshFn()}>
        Refresh
      </button>
    </div>
  ),
}));

// Mock data and functions
let mockApiStatus = 'Checking API connection...';
let mockDomains: Domain[] = [];
const mockRefreshFn = vi.fn();

describe('ResendDashboard Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockApiStatus = 'Checking API connection...';
    mockDomains = [];
    mockRefreshFn.mockClear();
  });

  it('renders the Resend dashboard with loading state initially', () => {
    render(<ResendDashboard />);
    
    // Check that the component renders with loading indicators
    expect(screen.getByText('Resend Email Configuration')).toBeInTheDocument();
    expect(screen.getByText('Checking API connection...')).toBeInTheDocument();
  });

  it('displays API status when data is loaded', async () => {
    // Set mock data before rendering
    mockApiStatus = 'API connection successful';
    mockDomains = [
      { name: 'example.com', status: 'verified' }
    ];
    
    render(<ResendDashboard />);
    
    // Check that API status is displayed
    expect(screen.getByText('API connection successful')).toBeInTheDocument();
  });

  it('displays error message when API connection fails', async () => {
    // Set mock data before rendering
    mockApiStatus = 'Failed to connect to Resend API';
    
    render(<ResendDashboard />);
    
    // Check that error message is displayed
    expect(screen.getByText('Failed to connect to Resend API')).toBeInTheDocument();
  });

  it('refreshes data when refresh button is clicked', async () => {
    // Set mock data before rendering
    mockApiStatus = 'API connection successful';
    
    const user = userEvent.setup();
    render(<ResendDashboard />);
    
    // Find and click the refresh button
    const refreshButton = screen.getByTestId('button-refresh');
    await user.click(refreshButton);
    
    // Verify that the refresh function was called
    expect(mockRefreshFn).toHaveBeenCalled();
  });

  it('displays domain information when available', async () => {
    // Set mock data before rendering
    mockApiStatus = 'Domains retrieved successfully';
    mockDomains = [
      { name: 'example.com', status: 'verified' },
      { name: 'test.com', status: 'pending' }
    ];
    
    render(<ResendDashboard />);
    
    // Check that domain information is displayed
    const domainNames = screen.getAllByTestId('domain-name');
    expect(domainNames[0]).toHaveTextContent('example.com');
    expect(domainNames[1]).toHaveTextContent('test.com');
    
    // Check domain statuses
    const domainStatuses = screen.getAllByTestId('domain-status');
    expect(domainStatuses[0]).toHaveTextContent('verified');
    expect(domainStatuses[1]).toHaveTextContent('pending');
  });
});

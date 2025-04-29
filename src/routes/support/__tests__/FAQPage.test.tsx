import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import FAQPage from '../FAQPage';

// Mock React Router
vi.mock('react-router-dom', () => ({
  useNavigate: vi.fn(() => mockNavigate),
}));

const mockNavigate = vi.fn();

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

vi.mock('@/components/ui/accordion', () => ({
  Accordion: ({ children, type, collapsible, className }: { children: React.ReactNode, type: string, collapsible: boolean, className: string }) => (
    <div data-testid="accordion" data-type={type} data-collapsible={collapsible} className={className}>
      {children}
    </div>
  ),
  AccordionItem: ({ children, value }: { children: React.ReactNode, value: string }) => (
    <div data-testid={`accordion-item-${value}`}>
      {children}
    </div>
  ),
  AccordionTrigger: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-trigger" role="button">
      {children}
    </div>
  ),
  AccordionContent: ({ children }: { children: React.ReactNode }) => (
    <div data-testid="accordion-content">
      {children}
    </div>
  ),
}));

vi.mock('@/components/ui/separator', () => ({
  Separator: () => <hr data-testid="separator" />,
}));

// Mock constants
vi.mock('#/validators', () => ({
  DEFAULT_AI_CREDITS: 10,
  RESET_TIME_IN_DAYS: 30,
}));

describe('FAQPage Component', () => {
  beforeEach(() => {
    vi.resetAllMocks();
    mockNavigate.mockClear();
  });

  it('renders the FAQ page with correct title and description', () => {
    render(<FAQPage />);
    
    // Check page title and description
    expect(screen.getByText('Frequently Asked Questions')).toBeInTheDocument();
    expect(screen.getByText(/Find answers to common questions/)).toBeInTheDocument();
  });

  it('renders accordion sections with category headings', () => {
    render(<FAQPage />);
    
    // Check category headings
    expect(screen.getByText('General')).toBeInTheDocument();
    expect(screen.getByText('Documents & Generation')).toBeInTheDocument();
    expect(screen.getByText('University Applications')).toBeInTheDocument();
    expect(screen.getByText('Account & Privacy')).toBeInTheDocument();
  });

  it('renders FAQ items with questions and answers', () => {
    render(<FAQPage />);
    
    // Check some specific FAQ questions
    expect(screen.getByText('What is GradAid?')).toBeInTheDocument();
    expect(screen.getByText('Who is GradAid for?')).toBeInTheDocument();
    expect(screen.getByText('How can GradAid help with my graduate school applications?')).toBeInTheDocument();
    
    // Check for accordion items by their values
    expect(screen.getByTestId('accordion-item-what-is-gradaid')).toBeInTheDocument();
    expect(screen.getByTestId('accordion-item-who-is-gradaid-for')).toBeInTheDocument();
    expect(screen.getByTestId('accordion-item-how-gradaid-helps')).toBeInTheDocument();
  });

  it('navigates to correct routes when navigation links are clicked', async () => {
    const user = userEvent.setup();
    render(<FAQPage />);
    
    // Find all elements with "start an application" text (case insensitive)
    const applyLinks = screen.getAllByText('start an application', { exact: false });
    expect(applyLinks.length).toBeGreaterThan(0);
    
    // Click on the first link that's a span element
    const applyLink = applyLinks.find(el => el.tagName.toLowerCase() === 'span');
    if (applyLink) {
      await user.click(applyLink);
      
      // Check that navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/apply');
    }
    
    // Reset mock
    mockNavigate.mockClear();
    
    // Find and click on "Documents" link
    const documentsLinks = screen.getAllByText('Documents', { exact: false });
    const documentsLink = documentsLinks.find(el => el.tagName.toLowerCase() === 'span');
    if (documentsLink) {
      await user.click(documentsLink);
      
      // Check that navigate was called with the correct path
      expect(mockNavigate).toHaveBeenCalledWith('/documents');
    }
  });

  it('displays AI credit information with correct values', () => {
    render(<FAQPage />);
    
    // Find the AI credits FAQ item
    const aiCreditsItem = screen.getByTestId('accordion-item-ai-credits');
    expect(aiCreditsItem).toBeInTheDocument();
    
    // Check that it contains the correct values from the constants
    const content = aiCreditsItem.textContent;
    expect(content).toContain('10'); // DEFAULT_AI_CREDITS value
    expect(content).toContain('30'); // RESET_TIME_IN_DAYS value
  });
});

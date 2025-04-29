import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfilePage from '../page';

// Mock the components used by ProfilePage
vi.mock('@/components/profile/profile-form', () => ({
  ProfileForm: () => <div data-testid="profile-form">Mocked Profile Form</div>
}));

vi.mock('@/components/ui/page-wrapper', () => ({
  PageWrapper: ({ children, title, description }: { 
    children: React.ReactNode, 
    title: string,
    description?: string 
  }) => (
    <div 
      data-testid="page-wrapper" 
      data-title={title}
      data-description={description}
    >
      <h1>{title}</h1>
      {description && <p>{description}</p>}
      {children}
    </div>
  )
}));

describe('ProfilePage Component', () => {
  it('renders the PageWrapper with correct title and description', () => {
    render(<ProfilePage />);
    
    const pageWrapper = screen.getByTestId('page-wrapper');
    expect(pageWrapper).toBeInTheDocument();
    expect(pageWrapper).toHaveAttribute('data-title', 'Personal Profile');
    expect(pageWrapper).toHaveAttribute(
      'data-description', 
      'Update your personal information and academic history'
    );
  });

  it('renders the title text', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Personal Profile')).toBeInTheDocument();
  });

  it('renders the description text', () => {
    render(<ProfilePage />);
    
    expect(screen.getByText('Update your personal information and academic history')).toBeInTheDocument();
  });

  it('renders the ProfileForm component', () => {
    render(<ProfilePage />);
    
    const profileForm = screen.getByTestId('profile-form');
    expect(profileForm).toBeInTheDocument();
    expect(screen.getByText('Mocked Profile Form')).toBeInTheDocument();
  });
});

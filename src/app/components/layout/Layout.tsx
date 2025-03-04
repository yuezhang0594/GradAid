import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import Sidebar from './Sidebar';
import { useUser } from '@clerk/clerk-react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { user } = useUser();
  const location = useLocation();
  
  // Check if current route is auth route (login, register, etc.)
  const isAuthRoute = location.pathname.startsWith('/auth');
  
  // Check if current route is landing page
  const isLandingPage = location.pathname === '/';
  
  // Don't show sidebar on auth routes or landing page
  const showSidebar = user && !isAuthRoute && !isLandingPage;

  return (
    <div className="flex flex-col min-h-screen">
      <Header />
      
      <div className="flex flex-1">
        {/* Conditional sidebar rendering */}
        {showSidebar && (
          <Sidebar className="hidden md:block h-[calc(100vh-64px)] sticky top-16" />
        )}
        
        {/* Main content */}
        <main className={`flex-1 ${showSidebar ? 'md:ml-0' : ''}`}>
          <div className="container mx-auto px-4 py-6">
            {children}
          </div>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Layout;

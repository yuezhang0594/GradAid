import React, { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import Header from './Header';
import Footer from './Footer';
import { AppSidebar } from '../app-sidebar';
import { Authenticated } from 'convex/react';

interface LayoutProps {
  children: ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();

  // Check if current route is auth route (login, register, etc.)
  const isAuthRoute = location.pathname.startsWith('/auth');

  // Check if current route is landing page
  const isLandingPage = location.pathname === '/';

  return (
    <div className="flex flex-col min-h-screen">
      <Header />

      <div className="flex flex-1">
        {/* Conditional sidebar rendering with Authenticated component */}
        <Authenticated>
          {!isAuthRoute && !isLandingPage && (
            <AppSidebar className="hidden md:block sticky top-16" />
          )}
        </Authenticated>

        {/* Main content */}
        <main className="flex-1">
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

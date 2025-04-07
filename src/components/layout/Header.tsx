import React from 'react';
import { UserButton, useUser } from '@clerk/clerk-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useLocation, useNavigate } from 'react-router-dom';
// TODO: Make header stick to top of screen
export default function Header() {
  const { user } = useUser();
  const location = useLocation();
  const navigate = useNavigate();

  const getBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(Boolean);
    const breadcrumbs: { label: string; path: string }[] = [];

    // Build up breadcrumb paths
    pathSegments.forEach((segment, index) => {
      const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
      let label = segment.charAt(0).toUpperCase() + segment.slice(1);

      // Skip dashboard in the loop since we'll add it separately
      if (segment === 'dashboard') return;

      // Special cases for formatting
      switch (segment) {
        case 'applications':
          label = 'Applications';
          break;
        case 'documents':
          label = 'Documents';
          break;
        case 'sop':
          label = 'Statement of Purpose';
          break;
        case 'lor':
          label = 'Letters of Recommendation';
          break;
        case 'cv':
          label = 'CV';
          break;
      }

      // Format university names (they contain hyphens)
      if (index === 2 && path.includes('/applications/')) {
        label = segment
          .split('-')
          .map(word => word.charAt(0).toUpperCase() + word.slice(1))
          .join(' ');
      }

      breadcrumbs.push({ label, path });
    });

    return breadcrumbs;
  };

  const breadcrumbs = getBreadcrumbs();
  const isDashboard = location.pathname === '/dashboard' || location.pathname === '/';

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Breadcrumb Section */}
          <div className="flex items-center gap-2">
            <SidebarTrigger className="-ml-1" />
            <div className="mx-2 h-6 w-px bg-border" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem>
                  {isDashboard ? (
                    <BreadcrumbPage>Dashboard</BreadcrumbPage>
                  ) : (
                    <BreadcrumbLink 
                      onClick={() => navigate('/dashboard')}
                      className="cursor-pointer"
                    >
                      Dashboard
                    </BreadcrumbLink>
                  )}
                </BreadcrumbItem>
                {breadcrumbs.map((item, index) => (
                  <React.Fragment key={item.path}>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      {index === breadcrumbs.length - 1 ? (
                        <BreadcrumbPage>{decodeURIComponent(item.label)}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink 
                          onClick={() => navigate(item.path)}
                          className="cursor-pointer"
                        >
                          {decodeURIComponent(item.label)}
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                  </React.Fragment>
                ))}
              </BreadcrumbList>
            </Breadcrumb>
          </div>

          {/* User Profile Section */}
          <div className='flex items-center gap-2'>
            <div className="hidden md:block mr-2 text-sm font-medium">
              {user?.fullName}
            </div>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
}
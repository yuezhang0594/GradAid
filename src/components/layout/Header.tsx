import { UserButton, useUser } from '@clerk/clerk-react';
import { Breadcrumb, BreadcrumbList, BreadcrumbItem, BreadcrumbLink, BreadcrumbSeparator, BreadcrumbPage } from '../ui/breadcrumb';
import { SidebarTrigger } from '@/components/ui/sidebar';


export default function Header() {
  const { user } = useUser();
  return (
    <header className="flex h-16 shrink-0 items-center gap-2 w-full">
      <div className="w-full px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between w-full">
          {/* Breadcrumb Section */}
          {/* TODO: make it dynamically update based on page */}
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <div className="mx-2 h-6 w-px bg-border" />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink href="/dashboard">
                    Dashboard
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Applications</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
          {/* User Profile Section */}
          <div className='flex items-center gap-2'>
            <div className="hidden md:block mr-2 text-sm font-medium">
              Hello, {user!.firstName}
            </div>
            <UserButton />
          </div>
        </div>
      </div>
    </header>
  );
};
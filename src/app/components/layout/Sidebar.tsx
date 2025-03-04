import React, { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  FileText, 
  GraduationCap, 
  ClipboardList, 
  Settings, 
  HelpCircle, 
  ChevronRight,
  ChevronLeft
} from 'lucide-react';

interface SidebarProps {
  className?: string;
}

const Sidebar: React.FC<SidebarProps> = ({ className }) => {
  const location = useLocation();
  const [collapsed, setCollapsed] = useState(false);

  const navItems = [
    { 
      path: '/dashboard', 
      label: 'Dashboard', 
      icon: <LayoutDashboard size={20} /> 
    },
    { 
      path: '/documents', 
      label: 'Documents', 
      icon: <FileText size={20} /> 
    },
    { 
      path: '/universities', 
      label: 'Universities', 
      icon: <GraduationCap size={20} /> 
    },
    { 
      path: '/applications', 
      label: 'Applications', 
      icon: <ClipboardList size={20} /> 
    },
    { 
      path: '/settings', 
      label: 'Settings', 
      icon: <Settings size={20} /> 
    },
    { 
      path: '/help', 
      label: 'Help & Support', 
      icon: <HelpCircle size={20} /> 
    }
  ];

  const isActive = (path: string) => {
    // Handle nested routes - consider them active for the parent menu
    return location.pathname.startsWith(path);
  };

  return (
    <aside 
      className={`bg-white border-r border-border transition-all duration-300 ${
        collapsed ? 'w-16' : 'w-64'
      } ${className || ''}`}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar content */}
        <div className="flex-1 py-6 flex flex-col">
          <nav className="space-y-1 px-2">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) => `
                  flex items-center px-3 py-2 rounded-md transition-colors
                  ${isActive ? 'bg-primary-light/10 text-primary' : 'text-text-secondary hover:bg-surface hover:text-primary'}
                  ${collapsed ? 'justify-center' : ''}
                `}
              >
                <div className="flex items-center">
                  {item.icon}
                  {!collapsed && <span className="ml-3">{item.label}</span>}
                </div>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Collapse toggle button */}
        <div className="p-4">
          <button
            onClick={() => setCollapsed(!collapsed)}
            className="flex items-center justify-center w-full py-2 text-text-secondary hover:text-primary transition-colors rounded-md hover:bg-surface"
            aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {collapsed ? <ChevronRight size={20} /> : <>
              <ChevronLeft size={20} />
              <span className="ml-2">Collapse</span>
            </>}
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;

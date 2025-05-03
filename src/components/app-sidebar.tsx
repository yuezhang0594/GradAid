import * as React from "react"
import { GradAidLogo } from "@/assets/GradAidLogo";
import { useNavigate, useLocation } from "react-router-dom";
import {
  UserPenIcon,
  MessageCircleQuestionIcon,
  InfoIcon,
  FileTextIcon,
  ClipboardListIcon,
  HeartIcon,
  SearchIcon,
  MessageSquareHeart,
  FileUserIcon,
  FilePenIcon,
  ClipboardPlusIcon
} from 'lucide-react';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar
} from "@/components/ui/sidebar"

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Update Profile",
          url: "/profile",
          icon: UserPenIcon,
        },
        // {
        //   title: "Upload Documents",
        //   url: "/documents",
        //   icon: FileUpIcon,
        // },
      ],
    },
    {
      title: "Building Your Application",
      url: "#",
      items: [
        {
          title: "Program Search",
          url: "/search",
          icon: SearchIcon,
        },
        {
          title: "Saved Programs",
          url: "/saved",
          icon: HeartIcon,
        },
        {
          title: "Apply",
          url: "/apply",
          icon: ClipboardPlusIcon,
        },
      ],
    },
    {
      title: "Tracking Your Progress",
      url: "#",
      items: [
        {
          title: "Applications",
          url: "/applications",
          icon: ClipboardListIcon,
        },
        {
          title: "Documents",
          url: "/documents",
          icon: FileTextIcon,
        },
      ],
    },
    {
      title: "Support",
      url: "#",
      items: [
        {
          title: "FAQ",
          url: "/faq",
          icon: InfoIcon,
        },
        {
          title: "Contact Us",
          url: "/contact",
          icon: MessageCircleQuestionIcon,
        },
        {
          title: "Feedback",
          url: "/feedback",
          icon: MessageSquareHeart,
        },
      ],
    },
    {
      title: "Legal",
      url: "#",
      items: [
        {
          title: "Terms of Service",
          url: "/tos",
          icon: FilePenIcon,
        },
        {
          title: "Privacy Policy",
          url: "/privacy",
          icon: FileUserIcon,
        },
      ],
    },
  ],
}


/**
 * A responsive application sidebar component that displays navigation options
 * grouped by categories such as "Getting Started", "Building Your Application", etc.
 * 
 * Features:
 * - Responsive design that adapts to mobile and desktop views
 * - Automatic highlighting of the current active route
 * - Collapsible navigation groups
 * - Brand header with logo
 * 
 * The component uses React Router for navigation and closes automatically on 
 * mobile devices after navigation.
 * 
 * @component
 * @param {React.ComponentProps<typeof Sidebar>} props - Props are extended from the base Sidebar component
 * @returns {JSX.Element} A fully-styled application sidebar with navigation options
 * 
 * @example
 * // Basic usage
 * <AppSidebar className="h-screen" />
 */
export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  const { toggleSidebar, isMobile } = useSidebar()

  const handleNavigation = (url: string) => {
    navigate(url)
    if (isMobile) {
      toggleSidebar()
    }
  }
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* Logo */}
        <div
          className="flex flex-col items-center justify-center cursor-pointer pt-2"
          onClick={() => handleNavigation("/dashboard")}
        >
          <div className="flex items-center">
            <GradAidLogo className="h-8 w-auto" />
            <span className="ml-2 text-2xl font-bold text-primary">
              GradAid
            </span>
          </div>
          <span className="text-xs text-muted-foreground mt-0">by Admissions Alchemists</span>
        </div>
      </SidebarHeader>
      <SidebarContent>
        {/* We create a SidebarGroup for each parent. */}
        {data.navMain.map((item) => (
          <SidebarGroup key={item.title}>
            <SidebarGroupLabel>{item.title}</SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {item.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton
                      isActive={currentPath === item.url}
                      onClick={() => handleNavigation(item.url)}
                    >
                      <item.icon size={20} />
                      {item.title}
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarRail />
    </Sidebar>
  )
}

import * as React from "react"
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { GradAidLogo } from "@/assets/GradAidLogo";
import { useNavigate, useLocation } from "react-router-dom";
import { SearchForm } from "@/components/search-form"

import {
  UserPenIcon,
  FilePlus2Icon,
  MessageCircleQuestionIcon,
  InfoIcon,
  SettingsIcon,
  FileTextIcon,
  ClipboardListIcon,
  HeartIcon,
  SearchIcon,
  FileUpIcon,
  Link
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
          icon: FilePlus2Icon,
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
          title: "Settings",
          url: "/settings",
          icon: SettingsIcon,
        },
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
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  const navigate = useNavigate();
  const location = useLocation();
  const currentPath = location.pathname;
  
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* Logo */}
        <div 
          className="flex items-center justify-center cursor-pointer" 
          onClick={() => navigate("/dashboard")}
        >
          <GradAidLogo className="h-8 w-auto" />
          <span className="ml-2 text-2xl font-bold text-primary">
            GradAid
          </span>
        </div>
        {/* <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        /> */}
        {/* <SearchForm /> */}
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
                    <SidebarMenuButton asChild isActive={currentPath === item.url}>
                      <a href={item.url}><item.icon size={20} />{item.title}</a>
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

import * as React from "react"

import { SearchForm } from "@/components/search-form"
// import { VersionSwitcher } from "@/components/version-switcher"
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
import { GradAidLogo } from "@/assets/GradAidLogo";

const data = {
  versions: ["1.0.1", "1.1.0-alpha", "2.0.0-beta1"],
  navMain: [
    {
      title: "Getting Started",
      url: "#",
      items: [
        {
          title: "Create Profile",
          url: "#",
          icon: UserPenIcon,
        },
        {
          title: "Upload Documents",
          url: "#",
          icon: FileUpIcon,
        },
      ],
    },
    {
      title: "Building Your Application",
      url: "#",
      items: [
        {
          title: "Program Search",
          url: "#",
          icon: SearchIcon,
        },
        {
          title: "Saved Programs",
          url: "#",
          icon: HeartIcon,
        },
        {
          title: "Apply",
          url: "#",
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
          url: "#",
          icon: ClipboardListIcon,
          isActive: true,
        },
        {
          title: "Documents",
          url: "#",
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
          url: "#",
          icon: SettingsIcon,
        },
        {
          title: "FAQ",
          url: "#",
          icon: InfoIcon,
        },
        {
          title: "Contact Us",
          url: "#",
          icon: MessageCircleQuestionIcon,
        },
      ],
    },
  ],
}

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
  return (
    <Sidebar {...props}>
      <SidebarHeader>
        {/* Logo */}
            <div className="flex items-center justify-center gap-2">
            <GradAidLogo className="h-8 w-auto" />
            <span className="text-2xl font-bold text-primary">GradAid</span>
            </div>
        {/* <VersionSwitcher
          versions={data.versions}
          defaultVersion={data.versions[0]}
        /> */}
        <SearchForm />
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
                    <SidebarMenuButton asChild isActive={item.isActive} >
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

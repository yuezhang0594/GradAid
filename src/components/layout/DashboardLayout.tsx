import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
      <SidebarProvider>
        <AppSidebar />
        <SidebarInset>
          <Header />
          <div className="flex flex-col min-h-[calc(100vh-4rem)]">
            <Outlet />
          </div>
        </SidebarInset>
      </SidebarProvider>
  );
}

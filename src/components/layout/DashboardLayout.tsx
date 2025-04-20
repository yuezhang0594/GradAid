import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import Header from "./Header";
import { Outlet } from "react-router-dom";
import { ChatBot } from "@/components/chatbot";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <div className="flex flex-col min-h-[calc(100vh-4rem)]">
          <Outlet />
          {/* <div className="mt-6 mx-4 sm:mx-6 lg:mx-8 mb-4">
            <ChatBot />
          </div> */}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { Header } from "@/components/layout";
import { AppSidebar } from "@/components/app-sidebar";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { ChatBot } from "@/components/chatbot";
import { Outlet } from "react-router-dom";

export function DashboardLayout() {
  return (
    <SidebarProvider>
      <AppSidebar />
      <SidebarInset>
        <Header />
        <main className="flex-1 flex-col overflow-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
          <ChatBot />
        </main>
      </SidebarInset>
    </SidebarProvider>
  );
}

import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "./components/AppSidebar";
import { LanguageProvider, useLanguage } from "./contexts/LanguageContext";
import { Button } from "@/components/ui/button";
import { Languages } from "lucide-react";
import Dashboard from "./pages/Dashboard";
import Contacts from "./pages/Contacts";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

function AppContent() {
  const { language, toggleLanguage } = useLanguage();

  return (
    <BrowserRouter>
      <SidebarProvider>
        <div className="flex min-h-screen w-full">
          <main className="flex-1 flex flex-col order-1">
            <header className="sticky top-0 z-10 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
              <div className="flex h-14 items-center gap-2 px-4" dir="ltr">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleLanguage}
                  className="gap-2 shrink-0"
                  aria-label="Toggle language"
                >
                  <Languages className="h-4 w-4" />
                  <span className="text-sm font-medium">{language === 'ar' ? 'English' : 'عربي'}</span>
                </Button>
                <SidebarTrigger className="shrink-0" />
              </div>
            </header>
            <div className="flex-1 overflow-auto">
              <Routes>
                <Route path="/" element={<Dashboard />} />
                <Route path="/contacts" element={<Contacts />} />
                <Route path="/messages" element={<Messages />} />
                <Route path="*" element={<NotFound />} />
              </Routes>
            </div>
          </main>
          <AppSidebar />
        </div>
      </SidebarProvider>
    </BrowserRouter>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <LanguageProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <AppContent />
      </TooltipProvider>
    </LanguageProvider>
  </QueryClientProvider>
);

export default App;

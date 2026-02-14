
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AgentNetworkProvider } from "@/contexts/AgentNetworkContext";
import Index from "./pages/Index";
import AgentTruths from "./pages/AgentTruths";
import Settings from "./pages/Settings";
import NotFound from "./pages/NotFound";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60000,
      refetchOnWindowFocus: false,
    },
  },
});

const App = () => {
  // Set basename for GitHub Pages deployment
  const basename = import.meta.env.PROD ? '/adaptive-agent-nexus' : '';

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AgentNetworkProvider>
          <Toaster />
          <Sonner />
          <BrowserRouter basename={basename}>
            <Routes>
              <Route path="/" element={<Index />} />
              <Route path="/truths" element={<AgentTruths />} />
              <Route path="/settings" element={<Settings />} />
              {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
              <Route path="*" element={<NotFound />} />
            </Routes>
          </BrowserRouter>
        </AgentNetworkProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App;

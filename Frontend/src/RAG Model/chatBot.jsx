import React from "react";

// Chatbot imported providers
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TTSProvider } from "./contexts/TTSContext";
import { FileManagerProvider } from "./contexts/FileManagerContext";

// Chatbot main page (Index)
import Index from "./pages/Index";

// import './chatbot.css';


const queryClient = new QueryClient();

function ChatBot() {
  return (
        <div className="chatbot-scope">
            <QueryClientProvider client={queryClient}>
                <FileManagerProvider>
                <TTSProvider>
                    <TooltipProvider>
                    <Toaster />
                    <Sonner />

                    {/* ChatBot UI - No auth required */}
                    <Index />
                    </TooltipProvider>
                </TTSProvider>
                </FileManagerProvider>
            </QueryClientProvider>
        </div>
    );
}

export default ChatBot;

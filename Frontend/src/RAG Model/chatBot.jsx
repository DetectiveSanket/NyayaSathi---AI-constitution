import React from "react";
import { useDispatch } from "react-redux";
import { useNavigate } from "react-router-dom";

import { logoutUser } from "../features/auth/authThunks";
import { localLogout } from "../store/authSlice";

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
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const logoutHandle = async () => {
    try {
      await dispatch(logoutUser()).unwrap();
    } catch {
      dispatch(localLogout());
    } finally {
      navigate("/login", { replace: true });
    }
  };

  return (
    <div className="chatbot-scope">
      <QueryClientProvider client={queryClient}>
        <FileManagerProvider>
          <TTSProvider>
            <TooltipProvider>
              <Toaster />
              <Sonner />

              <div>
                {/* <div className="flex justify-between items-center mb-4">
                  <h1 className="text-2xl font-bold">NyayaSathi Chat Assistant</h1>

                  <button
                    className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600 transition-colors"
                    onClick={logoutHandle}
                  >
                    Logout
                  </button>
                </div> */}

                {/* ChatBot UI */}
                <Index />
              </div>
            </TooltipProvider>
          </TTSProvider>
        </FileManagerProvider>
      </QueryClientProvider>
    </div>
  );
}

export default ChatBot;

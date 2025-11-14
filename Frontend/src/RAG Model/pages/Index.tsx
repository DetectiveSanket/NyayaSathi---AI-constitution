import { useState, useRef, useEffect } from "react";
import { useResponsive } from "../hooks/useResponsive";
import ChatHeader from "../components/ChatHeader";
import ChatSidebar from "../components/ChatSidebar";
import MessageBubble from "../components/MessageBubble";
import ChatComposer from "../components/ChatComposer";
import MobileChatLayout from "../components/MobileChatLayout";
import { Badge } from "../components/ui/badge";
import { ScrollArea } from "../components/ui/scroll-area";
import { useToast } from "../hooks/use-toast";
import { Input } from "../components/ui/input";
import { Search, X, Eye, EyeOff } from "lucide-react";
import { Button } from "../components/ui/button";
import jsPDF from "jspdf";

interface Message {
  id: string;
  type: "user" | "assistant" | "system";
  content: string;
  timestamp: string;
  citations?: Array<{
    id: string;
    title: string;
    section: string;
    url?: string;
  }>;
  isStreaming?: boolean;
}

const Index = () => {
  const { isMobile } = useResponsive();
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { toast } = useToast();
  
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [searchFromSidebar, setSearchFromSidebar] = useState("");

  const [messages, setMessages] = useState<Message[]>([
      {
        id: "1",
        type: "system",
        content: "Document loaded: IndianPenalCode_Sections.pdf",
        timestamp: "12:30 PM"
      },
      {
        id: "2",
        type: "user",
        content: "What sections apply if someone is verbally threatened?",
        timestamp: "12:31 PM"
      },
      {
        id: "3",
        type: "assistant",
        content: "जीवनात पुढे जाण्यासाठी प्रेरणा आणि मोटिवेशन अत्यंत महत्त्वाचे आहेत. विशेषतः जेव्हा आपण कठीण प्रसंगांचा सामना करतो, तेव्हा काही प्रेरणादायक सुविचार आणि स्टेटस आपल्याला नवी ऊर्जा देऊ शकतात. या लेखात, आम्ही मराठीत काही सर्वोत्तम प्रेरणादायक सुविचार आणि मोटिवेशनल स्टेटस संग्रह घेऊन आलो आहोत, जे फक्त आपल्याला प्रेरित करणार नाहीत, तर आपल्या मित्र आणि कुटुंबातील लोकांबरोबर शेअर करण्यासही उपयुक्त असतील. ",
        timestamp: "12:31 PM",
        citations: [
          { id: "c1", title: "Indian Penal Code", section: "Section 503", url: "#" },
          { id: "c2", title: "Indian Penal Code", section: "Section 506", url: "#" }
        ]
      },

      {
        id: "3",
        type: "assistant",
        content: "Verbal threats are addressed under Section 503 and Section 506 of the Indian Penal Code. Section 503 deals with criminal intimidation, which involves threatening someone with injury to their person, reputation, or property. Section 506 prescribes the punishment for criminal intimidation, which can include imprisonment and fines depending on the severity of the threat.",
        timestamp: "12:31 PM",
        citations: [
          { id: "c1", title: "Indian Penal Code", section: "Section 503", url: "#" },
          { id: "c2", title: "Indian Penal Code", section: "Section 506", url: "#" }
        ]
      },

      {
        id: "4",
        type: "user",
        content: "Can you provide more details on Section 503?",
        timestamp: "12:31 PM"
      },

  ]);

  const [isLoading, setIsLoading] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (content: string) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    setMessages(prev => [...prev, newMessage]);
    setIsLoading(true);

    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        type: "assistant",
        content: "I understand your question. Based on the legal documents, here are the relevant sections...",
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        citations: [{ id: "c3", title: "Indian Penal Code", section: "Section 504", url: "#" }]
      };
      setMessages(prev => [...prev, aiResponse]);
      setIsLoading(false);
    }, 1000);
  };

  const handleExportChat = (format: 'txt' | 'pdf') => {
    const chatContent = messages.map(msg => {
      const typeLabel = msg.type === 'user' ? 'You' : msg.type === 'assistant' ? 'AI Assistant' : 'System';
      return `[${msg.timestamp}] ${typeLabel}:\n${msg.content}\n`;
    }).join('\n---\n\n');

    if (format === 'txt') {
      const blob = new Blob([chatContent], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `chat-history-${new Date().toISOString().split('T')[0]}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: "Export complete",
        description: "Chat history exported as TXT file",
      });
    } else if (format === 'pdf') {
      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 15;
      const maxWidth = pageWidth - (margin * 2);
      let yPosition = 20;

      // Title
      doc.setFontSize(18);
      doc.setFont('helvetica', 'bold');
      doc.text('Chat History Export', margin, yPosition);
      yPosition += 10;
      
      // Date
      doc.setFontSize(10);
      doc.setFont('helvetica', 'normal');
      doc.text(`Generated on: ${new Date().toLocaleString()}`, margin, yPosition);
      yPosition += 15;

      // Messages
      messages.forEach((msg, index) => {
        const typeLabel = msg.type === 'user' ? 'You' : msg.type === 'assistant' ? 'AI Assistant' : 'System';
        
        // Check if we need a new page
        if (yPosition > 270) {
          doc.addPage();
          yPosition = 20;
        }

        // Message header
        doc.setFontSize(11);
        doc.setFont('helvetica', 'bold');
        doc.text(`${typeLabel} [${msg.timestamp}]`, margin, yPosition);
        yPosition += 7;

        // Message content
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        const lines = doc.splitTextToSize(msg.content, maxWidth);
        
        lines.forEach((line: string) => {
          if (yPosition > 270) {
            doc.addPage();
            yPosition = 20;
          }
          doc.text(line, margin, yPosition);
          yPosition += 6;
        });

        // Citations if any
        if (msg.citations && msg.citations.length > 0) {
          yPosition += 3;
          doc.setFontSize(9);
          doc.setFont('helvetica', 'italic');
          msg.citations.forEach(citation => {
            if (yPosition > 270) {
              doc.addPage();
              yPosition = 20;
            }
            doc.text(`📎 ${citation.title} - ${citation.section}`, margin + 5, yPosition);
            yPosition += 5;
          });
        }

        yPosition += 8;

        // Separator line
        if (index < messages.length - 1) {
          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, pageWidth - margin, yPosition);
          yPosition += 8;
        }
      });

      doc.save(`chat-history-${new Date().toISOString().split('T')[0]}.pdf`);
      
      toast({
        title: "Export complete",
        description: "Chat history exported as PDF file",
      });
    }
  };

  const filteredMessages = (searchQuery.trim() || searchFromSidebar.trim())
    ? messages.filter(msg => 
        msg.content.toLowerCase().includes((searchQuery || searchFromSidebar).toLowerCase())
      )
    : messages;

  // Function to handle search from sidebar
  const handleSidebarSearch = (query: string) => {
    setSearchFromSidebar(query);
    setSearchQuery(query);
    if (query.trim()) {
      setIsSearchVisible(true);
    }
  };

  // Clear all search
  const clearSearch = () => {
    setSearchQuery("");
    setSearchFromSidebar("");
  };

  if (isMobile) {
    return <MobileChatLayout messages={messages} isLoading={isLoading} onSendMessage={handleSendMessage} />;
  }

  return (
    <div className="min-h-screen bg-background text-foreground font-inter">
      <ChatHeader onExportChat={handleExportChat} />
      <div className="flex h-[calc(100vh-4rem)]">
        <ChatSidebar 
          isCollapsed={sidebarCollapsed} 
          onToggleCollapse={() => setSidebarCollapsed(!sidebarCollapsed)}
        />
        <div className="flex-1 flex flex-col relative">
          <div className="px-6 py-5 border-b border-border/50 bg-gradient-surface backdrop-blur-sm">
            <div className="max-w-4xl mx-auto w-full">
              <div className="flex items-center justify-between mb-3">
                <h1 className="text-xl font-semibold text-foreground">Legal Document Analysis</h1>
                <div className="flex items-center gap-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setIsSearchVisible(!isSearchVisible)}
                    className="flex items-center gap-2 bg-surface-elevated/60 hover:bg-surface-elevated border-border/50"
                  >
                    {isSearchVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    {isSearchVisible ? "Hide Search" : "Show Search"}
                  </Button>
                  <Badge variant="secondary" className="bg-surface-elevated/80 text-secondary border-border/30 font-medium">Active Session</Badge>
                </div>
              </div>
              {/* Search Bar */}
              {isSearchVisible && (
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search messages..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 pr-10 bg-surface-elevated/60 border-border/50 focus:border-primary/50 h-9"
                  />
                  {searchQuery && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={clearSearch}
                      className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-surface-chat"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )}
            </div>
          </div>
          <div className="flex-1 overflow-hidden pb-32">
            <ScrollArea className="h-full">
              <div className="py-4 space-y-4 min-h-full flex flex-col justify-end">
                <div className="max-w-4xl mx-auto w-full space-y-6 pb-4 px-6">
                  {(searchQuery.trim() || searchFromSidebar.trim()) && (
                    <div className="flex items-center justify-between bg-surface-elevated/60 border border-border/50 rounded-lg p-3">
                      <div className="flex items-center gap-2">
                        <Search className="w-4 h-4 text-primary" />
                        <span className="text-sm text-foreground">
                          Searching for: <strong>"{searchQuery || searchFromSidebar}"</strong>
                        </span>
                        <span className="text-xs text-muted-foreground">
                          ({filteredMessages.length} result{filteredMessages.length !== 1 ? 's' : ''})
                        </span>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={clearSearch}
                        className="h-7 px-2 hover:bg-surface-chat"
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                  {filteredMessages.length === 0 && (searchQuery.trim() || searchFromSidebar.trim()) ? (
                    <div className="flex flex-col items-center justify-center py-12 text-center">
                      <Search className="w-12 h-12 text-muted-foreground/50 mb-3" />
                      <p className="text-muted-foreground">No messages found matching "{searchQuery || searchFromSidebar}"</p>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSearch}
                        className="mt-3"
                      >
                        Clear Search
                      </Button>
                    </div>
                  ) : (
                    filteredMessages.map((message) => (
                      <div key={message.id} className="group"><MessageBubble message={message} /></div>
                    ))
                  )}
                  {isLoading && (
                    <div className="flex justify-start">
                      <div className="flex space-x-3 max-w-[85%]">
                        <div className="w-7 h-7 rounded-full bg-gradient-primary flex items-center justify-center text-xs font-medium text-primary-foreground">AI</div>
                          <div className="bg-surface-elevated border border-border px-4 py-3 rounded-2xl">
                            <div className="flex items-center space-x-2">
                              <div className="flex space-x-1">
                                <div className="w-2 h-2 bg-secondary-muted rounded-full animate-bounce animate-bounce-delay-0" />
                                <div className="w-2 h-2 bg-secondary-muted rounded-full animate-bounce animate-bounce-delay-150" />
                                <div className="w-2 h-2 bg-secondary-muted rounded-full animate-bounce animate-bounce-delay-300" />
                              </div>
                              <span className="text-sm text-muted-foreground ml-2">Thinking...</span>
                            </div>
                          </div>
                      </div>
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </div>
            </ScrollArea>
          </div>
          <div className="absolute bottom-0 left-0 right-0 bg-background border-t border-border">
            <div className="max-w-4xl mx-auto w-full">
              <ChatComposer onSendMessage={handleSendMessage} isLoading={isLoading} />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;

import { useState } from "react";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { Avatar, AvatarFallback, AvatarImage } from "../components/ui/avatar";
import { Popover, PopoverContent, PopoverTrigger } from "../components/ui/popover";
import { 
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "../components/ui/tooltip";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../components/ui/dropdown-menu";
import { 
  Plus, 
  Library, 
  Search, 
  MoreVertical, 
  User, 
  Moon, 
  Sun, 
  LogOut,
  FileText,
  Clock,
  Edit3,
  Archive,
  Trash2,
  ChevronLeft,
  ChevronRight,
  Play,
  Share,
  Settings,
  X
} from "lucide-react";
import { DocumentLibraryModal } from "./DocumentLibraryModal";
import { EditProfileModal } from "./EditProfileModal";
import { SettingsModal } from "./SettingsModal";

interface ChatItem {
  id: string;
  title: string;
  timestamp: string;
  preview: string;
}

const ChatSidebar = ({ isCollapsed = false, onToggleCollapse, onSearch }: { 
  isCollapsed?: boolean; 
  onToggleCollapse?: () => void;
  onSearch?: (query: string) => void;
}) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  // Handle search with debounce effect
  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    if (onSearch) {
      onSearch(value);
    }
  };

  const recentChats: ChatItem[] = [
    {
      id: "1",
      title: "Verbal Threat Sections",
      timestamp: "2 hours ago",
      preview: "What sections apply if someone is verbally threatened?"
    },
    {
      id: "2", 
      title: "Property Dispute Laws",
      timestamp: "Yesterday",
      preview: "Can you explain the legal remedies for property disputes?"
    },
    {
      id: "3",
      title: "Contract Breach Analysis",
      timestamp: "3 days ago", 
      preview: "What are the consequences of breaching a service contract?"
    },
    {
      id: "4",
      title: "Employment Rights",
      timestamp: "1 week ago",
      preview: "What are my rights if terminated without notice?"
    }
  ];

  // Filter chats based on local search query
  const filteredChats = searchQuery.trim()
    ? recentChats.filter(chat =>
        chat.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        chat.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : recentChats;

  if (isCollapsed) {
    return (
      <TooltipProvider>
        <div className="w-14 bg-surface border-r border-border flex flex-col items-center py-4 space-y-4 relative">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                onClick={onToggleCollapse}
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 hover:bg-surface-elevated absolute top-2 right-[-16px] z-10 bg-surface border border-border rounded-full"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Expand sidebar</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button size="sm" className="w-10 h-10 bg-gradient-primary hover:opacity-90 focus-ring">
                <Plus className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>New chat</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 hover:bg-surface-elevated"
                onClick={() => setIsLibraryOpen(true)}
              >
                <Library className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Library</p>
            </TooltipContent>
          </Tooltip>
          
          <Tooltip>
            <TooltipTrigger asChild>
              <Button 
                variant="ghost" 
                size="sm" 
                className="w-10 h-10 hover:bg-surface-elevated"
                onClick={() => onSearch && onSearch("")}
              >
                <Search className="w-4 h-4" />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="right">
              <p>Search Messages</p>
            </TooltipContent>
          </Tooltip>
        </div>
      </TooltipProvider>
    );
  }

  return (
    <TooltipProvider>
      <div className="w-80 bg-surface border-r border-border flex flex-col h-full relative">
        {/* Collapse Button */}
        <Tooltip>
          <TooltipTrigger asChild>
            <Button 
              onClick={onToggleCollapse}
              variant="ghost" 
              size="sm" 
              className="w-8 h-8 hover:bg-surface-elevated absolute top-4 right-[-16px] z-10 bg-surface border border-border rounded-full"
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="right">
            <p>Collapse sidebar</p>
          </TooltipContent>
        </Tooltip>
      
      {/* New Chat Button */}
      <div className="p-4 border-b border-rounded-lg">
        <Button 
          className="w-full bg-blue-500 hover:opacity-90 focus-ring shadow-md hover-lift "
          size="lg"
        >
          <Plus className="w-4 h-4 mr-2" />
          New Chat
        </Button>
      </div>

      {/* Library Section */}
      <div className="px-4 py-3 border-b border-border">
        <Button 
          variant="ghost" 
          className="w-full justify-start hover:bg-surface-elevated sidebar-item-glow"
          onClick={() => setIsLibraryOpen(true)}
        >
          <Library className="w-4 h-4 mr-3" />
          <span>Library</span>
          <Badge variant="secondary" className="ml-auto bg-accent text-accent-foreground">
            12
          </Badge>
        </Button>
      </div>

      {/* Search */}
      <div className="px-4 py-3 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-zinc-500" />
          <Input
            placeholder="Search messages..."
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            className="pl-10 bg-surface-elevated border-border focus:border-primary focus-ring"
          />
          {searchQuery && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleSearchChange("")}
              className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7 p-0 hover:bg-surface-chat"
            >
              <X className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Recent Chats */}
      <div className="flex-1 overflow-y-auto scrollbar-custom">
        <div className="p-4">
          <h3 className="text-sm font-medium text-zinc-400 mb-3">
            Recent Chats {searchQuery && `(${filteredChats.length} found)`}
          </h3>
          <div className="space-y-2">
            {filteredChats.length === 0 ? (
              <div className="text-center py-8">
                <Search className="w-8 h-8 text-muted-foreground/50 mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">No chats found</p>
              </div>
            ) : (
              filteredChats.map((chat) => (
                <div
                key={chat.id}
                className="group p-3 rounded-radius-sm hover:bg-surface-elevated cursor-pointer border border-transparent hover:border-border transition-all sidebar-item-glow hover:rounded-[16px]"
              >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2 mb-1">
                        <FileText className="w-3 h-3 text-blue-500 flex-shrink-0" />
                        <h4 className="text-sm font-medium text-foreground truncate">
                          {chat.title}
                        </h4>
                      </div>

                      <p className="text-xs text-zinc-600 line-clamp-2 mb-2">
                        {chat.preview}
                      </p>

                      <div className="flex items-center text-xs text-zinc-500">
                        <Clock className="w-3 h-3 mr-1" />
                        {chat.timestamp}
                      </div>
                    </div>
                    
                    {/* 3-dot menu */}
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="opacity-0 group-hover:opacity-100 transition-opacity w-8 h-8 p-0 hover:bg-surface-chat rounded-md"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent 
                        className="w-48 bg-surface-elevated border-border/50 shadow-lg" 
                        side="right"
                        align="start"
                      >
                        <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer">
                          <Play className="w-4 h-4 mr-2" />
                          Resume Chat
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer">
                          <Edit3 className="w-4 h-4 mr-2" />
                          Rename
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer">
                          <Share className="w-4 h-4 mr-2" />
                          Share
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer">
                          <Archive className="w-4 h-4 mr-2" />
                          Archive
                        </DropdownMenuItem>
                        <DropdownMenuItem className="hover:bg-surface-chat rounded-md transition-colors cursor-pointer text-destructive hover:text-destructive">
                          <Trash2 className="w-4 h-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* User Profile */}
      <div className="p-4 border-t border-border">
        <Popover open={isProfileOpen} onOpenChange={setIsProfileOpen}>
          <PopoverTrigger asChild>
            <Button 
              variant="ghost" 
              className="w-full justify-start hover:bg-surface-elevated focus-ring"
            >
              <Avatar className="w-8 h-8 mr-3">
                <AvatarImage src="" alt="User" />
                <AvatarFallback className="bg-blue-500 text-primary-foreground">
                  U
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 text-left">
                <div className="text-sm font-medium">Legal User</div>
                <div className="text-xs text-zinc-600">user@example.com</div>
              </div>
            </Button>
          </PopoverTrigger>
          <PopoverContent 
            className="w-64 p-0 bg-surface-elevated border-border" 
            side="top"
            align="start"
          >
            <div className="p-2">
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsEditProfileOpen(true);
                }}
              >
                <User className="w-4 h-4 mr-3" />
                Edit Profile
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat"
                onClick={() => {
                  setIsProfileOpen(false);
                  setIsSettingsOpen(true);
                }}
              >
                <Settings className="w-4 h-4 mr-3" />
                Settings
              </Button>
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat"
              >
                <Sun className="w-4 h-4 mr-3" />
                Light Theme
              </Button>
              <div className="my-1 h-px bg-border" />
              <Button 
                variant="ghost" 
                className="w-full justify-start hover:bg-surface-chat text-destructive"
              >
                <LogOut className="w-4 h-4 mr-3" />
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {/* Modals */}
      <DocumentLibraryModal isOpen={isLibraryOpen} onClose={() => setIsLibraryOpen(false)} />
      <EditProfileModal isOpen={isEditProfileOpen} onClose={() => setIsEditProfileOpen(false)} />
      <SettingsModal isOpen={isSettingsOpen} onClose={() => setIsSettingsOpen(false)} />
      </div>
    </TooltipProvider>
  );
};

export default ChatSidebar;
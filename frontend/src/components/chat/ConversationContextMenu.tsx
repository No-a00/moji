import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  MoreHorizontal, 
  CheckCircle2, 
  MessageCircle, 
  BellOff, 
  Bell, 
  User, 
  Ban, 
  Archive,
  Pin,
  PinOff
} from "lucide-react";
import { useChatStore } from "@/stores/useChatStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { useState } from "react";
import UserProfileModal from "./UserProfileModal";

interface ConversationContextMenuProps {
  convoId: string;
  otherUserId?: string;
}

export const ConversationContextMenu = ({ convoId, otherUserId }: ConversationContextMenuProps) => {
  const { 
    conversations, 
    markAsUnread, 
    setActiveConversation, 
    toggleMute, 
    toggleArchive,
    pinConversation
  } = useChatStore();
  const { user: currentUser, blockUser } = useAuthStore();
  
  const [profileOpen, setProfileOpen] = useState(false);

  const convo = conversations.find(c => c._id === convoId);
  if (!convo || !currentUser) return null;

  const isMuted = convo.mutedBy?.includes(currentUser._id);
  const isPinned = convo.pinnedBy?.includes(currentUser._id);
  const isBlocked = otherUserId ? currentUser.blockedUsers?.includes(otherUserId) : false;

  const handleMarkUnread = () => {
    markAsUnread(convoId);
  };

  const handleOpenChat = () => {
    setActiveConversation(convoId);
  };

  const handleToggleMute = () => {
    toggleMute(convoId);
  };

  const handleViewProfile = () => {
    if (otherUserId) {
      setProfileOpen(true);
    }
  };

  const handleToggleBlock = () => {
    if (otherUserId) {
      blockUser(otherUserId);
    }
  };

  const handleToggleArchive = () => {
    toggleArchive(convoId);
  };

  const handleTogglePin = () => {
    pinConversation(convoId);
  };

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <button className="p-1 rounded-full hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-primary/50">
            <MoreHorizontal className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
          </button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56 shadow-xl border-zinc-200 dark:border-zinc-800">
          <DropdownMenuItem onClick={handleMarkUnread} className="gap-3 cursor-pointer py-2">
            <CheckCircle2 className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">Đánh dấu là chưa đọc</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleOpenChat} className="gap-3 cursor-pointer py-2">
            <MessageCircle className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">Mở phần nhắn tin</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleMute} className="gap-3 cursor-pointer py-2">
            {isMuted ? (
              <>
                <Bell className="w-4 h-4 text-zinc-500" />
                <span className="font-medium">Bật thông báo</span>
              </>
            ) : (
              <>
                <BellOff className="w-4 h-4 text-zinc-500" />
                <span className="font-medium">Tắt thông báo</span>
              </>
            )}
          </DropdownMenuItem>
          
          {otherUserId && (
            <>
              <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
              <DropdownMenuItem onClick={handleViewProfile} className="gap-3 cursor-pointer py-2">
                <User className="w-4 h-4 text-zinc-500" />
                <span className="font-medium">Xem trang cá nhân</span>
              </DropdownMenuItem>
            </>
          )}

          <DropdownMenuSeparator className="bg-zinc-200 dark:bg-zinc-800" />
          
          <DropdownMenuItem onClick={handleTogglePin} className="gap-3 cursor-pointer py-2">
            {isPinned ? (
              <>
                <PinOff className="w-4 h-4 text-zinc-500" />
                <span className="font-medium">Bỏ ghim đoạn chat</span>
              </>
            ) : (
              <>
                <Pin className="w-4 h-4 text-zinc-500" />
                <span className="font-medium">Ghim đoạn chat</span>
              </>
            )}
          </DropdownMenuItem>
          
          <DropdownMenuItem onClick={handleToggleBlock} className="gap-3 cursor-pointer py-2 focus:bg-destructive/10 focus:text-destructive">
            <Ban className="w-4 h-4 text-destructive" />
            <span className="font-medium text-destructive">{isBlocked ? "Bỏ chặn" : "Chặn"}</span>
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleToggleArchive} className="gap-3 cursor-pointer py-2">
            <Archive className="w-4 h-4 text-zinc-500" />
            <span className="font-medium">Lưu trữ đoạn chat</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      {otherUserId && (
        <UserProfileModal 
          isOpen={profileOpen} 
          onClose={() => setProfileOpen(false)} 
          userId={otherUserId} 
        />
      )}
    </>
  );
};

export default ConversationContextMenu;

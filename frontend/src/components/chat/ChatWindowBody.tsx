import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useEffect, useRef } from "react";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import UserAvatar from "./UserAvatar";
import { Loader2 } from "lucide-react";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessage,
    messageLoading,
    markAsSeen,
  } = useChatStore();

  const typingUsersRecord = useSocketStore((state) => state.typingUsers);
  const typingUsers = activeConversationId ? (typingUsersRecord[activeConversationId] || []) : [];

  const messages = allMessage[activeConversationId!]?.items??[];
  const selectedConvo = conversations.find((c)=>c._id===activeConversationId)
  const scrollRef = useRef<HTMLDivElement>(null);

  // Gọi markAsSeen khi đổi cuộc trò chuyện
  useEffect(() => {
    if (activeConversationId) {
      markAsSeen(activeConversationId);
    }
  }, [activeConversationId, markAsSeen]);

  // Hàm cuộn xuống cuối danh sách tin nhắn
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  // Tự động cuộn khi có tin nhắn mới hoặc khi đối phương đang gõ chữ
  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  if(!selectedConvo){
      return <ChatWelcomeScreen/>
  }

  if (messageLoading && messages.length === 0) {
    return (
      <div className="flex h-full items-center justify-center text-muted-foreground flex-col gap-2">
        <Loader2 className="size-8 animate-spin text-primary" />
        <p className="text-sm">Đang tải tin nhắn...</p>
      </div>
    );
  }
  
  return (
    <div className="p-4 h-full flex flex-col overflow-hidden bg-transparent">
      <div 
        ref={scrollRef} 
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar space-y-4 pr-1 scroll-smooth"
      >
        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground ">
            Chưa có tin nhắn trong cuộc trò chuyện này.
          </div>
        ) : (
          messages.map((message,index)=>(
            <MessageItem
              key={message._id??index}
              message={message}
              index={index}
              messages={messages}
              selectedconvo={selectedConvo}
              lastMessageStatus="delivered"
            />
          ))
        )}

        {/* Hiển thị hoạt họa đang soạn tin nhắn */}
        {typingUsers.map((userId) => {
          const participant = selectedConvo.participants.find((p) => p._id === userId);
          if (!participant) return null;
          return (
            <div key={userId} className="flex items-center gap-2 p-2 text-xs text-muted-foreground italic self-start bg-muted/20 rounded-lg max-w-xs message-bounce">
              <UserAvatar
                type="chat"
                name={participant.displayName}
                avatarUrl={participant.avatarUrl ?? undefined}
                className="size-5"
              />
              <span>{participant.displayName} đang soạn tin</span>
              <div className="flex gap-0.5 items-center mt-1.5">
                <span className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatWindowBody;

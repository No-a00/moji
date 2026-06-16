import { useChatStore } from "@/stores/useChatStore";
import { useSocketStore } from "@/stores/useSocketStore";
import { useEffect, useRef, useState, useLayoutEffect } from "react";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import MessageItem from "./MessageItem";
import UserAvatar from "./UserAvatar";
import { Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/useAuthStore";

const ChatWindowBody = () => {
  const {
    activeConversationId,
    conversations,
    messages: allMessage,
    messageLoading,
    markAsSeen,
    fetchMessages,
    targetScrollMessageId,
  } = useChatStore();

  const { user } = useAuthStore();
  const typingUsersRecord = useSocketStore((state) => state.typingUsers);
  const typingUsers = activeConversationId ? (typingUsersRecord[activeConversationId] || []) : [];

  const currentConvoData = allMessage[activeConversationId!];
  const messages = currentConvoData?.items ?? [];
  const hasMore = currentConvoData?.hasMore ?? false;
  
  const selectedConvo = conversations.find((c) => c._id === activeConversationId);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [prevScrollHeight, setPrevScrollHeight] = useState<number | null>(null);

  // 1. Gọi markAsSeen khi đổi cuộc trò chuyện
  useEffect(() => {
    if (activeConversationId) {
      markAsSeen(activeConversationId);
    }
  }, [activeConversationId, markAsSeen]);

  // 2. Logic Scroll To Bottom thông minh
  // Chỉ tự động cuộn xuống cuối nếu: 
  // - Lần đầu load tin nhắn
  // - Có tin nhắn mới và mình đang ở gần cuối
  // - Tin nhắn mới là do mình gửi
  const scrollToBottom = () => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  };

  const prevMessagesLengthRef = useRef(messages.length);
  const prevLastMessageIdRef = useRef(messages[messages.length - 1]?._id);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;

    // Nếu có targetScrollMessageId thì không tự động cuộn xuống bottom
    if (targetScrollMessageId) return;

    const isFirstLoad = prevMessagesLengthRef.current === 0 && messages.length > 0;
    const isNewMessage = messages.length > prevMessagesLengthRef.current && messages[messages.length - 1]?._id !== prevLastMessageIdRef.current;
    
    let shouldScroll = false;

    if (isFirstLoad) {
      shouldScroll = true;
    } else if (isNewMessage) {
      const lastMsg = messages[messages.length - 1];
      const isSentByMe = lastMsg?.senderId === user?._id;
      const isNearBottom = el.scrollHeight - el.scrollTop - el.clientHeight < 150;
      
      if (isSentByMe || isNearBottom) {
        shouldScroll = true;
      }
    }

    if (shouldScroll) {
      scrollToBottom();
    }

    prevMessagesLengthRef.current = messages.length;
    prevLastMessageIdRef.current = messages[messages.length - 1]?._id;
  }, [messages, typingUsers, targetScrollMessageId, user?._id]);


  // 3. Logic Infinite Scroll (Tải thêm tin nhắn cũ)
  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    const target = e.target as HTMLDivElement;
    if (target.scrollTop === 0 && hasMore && !messageLoading) {
      setPrevScrollHeight(target.scrollHeight);
      fetchMessages(activeConversationId!);
    }
  };

  // Giữ nguyên vị trí cuộn sau khi tải xong tin nhắn cũ
  useLayoutEffect(() => {
    if (prevScrollHeight !== null && scrollRef.current) {
      const diff = scrollRef.current.scrollHeight - prevScrollHeight;
      scrollRef.current.scrollTop += diff;
      setPrevScrollHeight(null);
    }
  }, [messages.length, prevScrollHeight]);

  // 4. Logic Cuộn tới Tin nhắn ghim (Target Scroll)
  useEffect(() => {
    if (targetScrollMessageId) {
      const el = document.getElementById("message-" + targetScrollMessageId);
      if (el) {
        // Đã tìm thấy tin nhắn -> cuộn tới
        el.scrollIntoView({ behavior: "smooth", block: "center" });
      } else if (hasMore && !messageLoading) {
        // Chưa tìm thấy -> Tải thêm
        setPrevScrollHeight(scrollRef.current?.scrollHeight || null);
        fetchMessages(activeConversationId!);
      }
    }
  }, [targetScrollMessageId, messages, hasMore, messageLoading, activeConversationId, fetchMessages]);

  if (!selectedConvo) {
    return <ChatWelcomeScreen />;
  }

  // Chỉ hiển thị Loader full screen nếu đang tải lần đầu
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
        onScroll={handleScroll}
        className="flex-1 flex flex-col overflow-y-auto overflow-x-hidden beautiful-scrollbar space-y-4 pr-1"
      >
        {/* Loading Indicator khi scroll lên trên cùng */}
        {messageLoading && messages.length > 0 && (
          <div className="flex justify-center py-2">
            <Loader2 className="size-5 animate-spin text-primary/60" />
          </div>
        )}

        {messages.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground ">
            Chưa có tin nhắn trong cuộc trò chuyện này.
          </div>
        ) : (
          messages.map((message, index) => (
            <MessageItem
              key={message._id ?? index}
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
            <div
              key={userId}
              className="flex items-center gap-2 p-2 text-xs text-muted-foreground italic self-start bg-muted/20 rounded-lg max-w-xs message-bounce"
            >
              <UserAvatar
                type="chat"
                name={participant.displayName}
                avatarUrl={participant.avatarUrl ?? undefined}
                className="size-5"
              />
              <span>{participant.displayName} đang soạn tin</span>
              <div className="flex gap-0.5 items-center mt-1.5">
                <span className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="size-1 bg-muted-foreground/60 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default ChatWindowBody;

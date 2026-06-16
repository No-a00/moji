import { chatService } from "@/Service/chatService";
import type { ChatState } from "@/types/store";
import { create } from "zustand";
import { useAuthStore } from "./useAuthStore";

export const useChatStore = create<ChatState>((set, get) => ({
      conversations: [],
      messages: {},
      activeConversationId: null,
      messageLoading: false,
      convoLoading: false,
      replyingToMessage: null,
      targetScrollMessageId: null,
      setTargetScrollMessageId: (id) => set({ targetScrollMessageId: id }),
      setReplyingToMessage: (message) => set({ replyingToMessage: message }),
      reset: () => {
        set({
          conversations: [],
          messages: {},
          activeConversationId: null,
          convoLoading: true,
        });
      },
      setActiveConversation(id) {
        set({ activeConversationId: id });
      },
      fetchConversations: async () => {
        try {
          set({ convoLoading: true });

          // 1. Lấy toàn bộ response (không destructuring vội)
          const response = await chatService.fetchConversations();

          // 2. Lấy dữ liệu từ key "conversation" (số ít - theo log của bạn)
          // Thêm fallback || [] để không bao giờ bị null/undefined
          const data = response.conversations || [];
          // 3. Set vào store
          set({
            conversations: data,
            convoLoading: false,
          });
        } catch (error) {
          console.error("lỗi xảy ra khi fetchConversations", error);
          set({ convoLoading: false });
        }
      },
      fetchMessages: async (conversationId) => {
        const { activeConversationId, messages } = get();
        const { user } = useAuthStore.getState();
        const convoId = conversationId ?? activeConversationId;
        if (!convoId) return;
        const current = messages?.[convoId];
        const nextCursor =
          current?.nextCursor === undefined ? "" : current?.nextCursor;
        if (nextCursor === null) return;
        set({ messageLoading: true });

        try {
          const { messages: fetched, cursor } = await chatService.fetchMessages(
            convoId,
            nextCursor,
          );
          const processed = fetched.map((m) => ({
            ...m,
            isOwn: m.senderId === user?._id,
          }));
          set((state) => {
            const prev = state.messages[convoId]?.items ?? [];
            const merged =
              prev.length > 0 ? [...processed, ...prev] : processed;
            return {
              messages: {
                ...state.messages,
                [convoId]: {
                  items: merged,
                  hasMore: !!cursor,
                  nextCursor: cursor ?? null,
                },
              },
            };
          });
        } catch (error) {
          console.log("lỗi xảy ra khi fetchMessages", error);
        } finally {
          set({ messageLoading: false });
        }
      },
      sendDirectMessage: async (recipientId, content, imgUrl) => {
        try {
          const { activeConversationId } = get();
          await chatService.sendDirectMessage(
            recipientId,
            content,
            imgUrl,
            activeConversationId || undefined,
            get().replyingToMessage?._id
          );
          set((state) => ({
            replyingToMessage: null,
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("lỗi xảy ra khi gửi directMessage ", error);
          
        }
      },
      sendGroupMessage: async (conversationId, content, imgUrl) => {
        const { activeConversationId } = get();
        try {
          await chatService.sendGroupMessage(conversationId, content, imgUrl, get().replyingToMessage?._id);
          set((state) => ({
            replyingToMessage: null,
            conversations: state.conversations.map((c) =>
              c._id === activeConversationId ? { ...c, seenBy: [] } : c,
            ),
          }));
        } catch (error) {
          console.error("lỗi xảy ra khi gửi GroupMessage", error);
        }
      },
      addMessage: (message) => {
        const { user } = useAuthStore.getState();
        const convoId = message.conversationId;
        const processed = {
          ...message,
          isOwn: message.senderId === user?._id,
        };

        set((state) => {
          const currentConvo = state.messages[convoId];
          const currentItems = currentConvo?.items ?? [];
          
          if (currentItems.some((m) => m._id === message._id)) {
            return state;
          }

          return {
            messages: {
              ...state.messages,
              [convoId]: {
                items: [...currentItems, processed],
                hasMore: currentConvo?.hasMore ?? false,
                nextCursor: currentConvo?.nextCursor ?? null,
              },
            },
          };
        });
      },
      updateConversationFromSocket: (data) => {
        const { conversationId, lastMessage, unreadCount } = data;
        set((state) => {
          const convoIndex = state.conversations.findIndex((c) => c._id === conversationId);
          if (convoIndex === -1) {
            get().fetchConversations();
            return state;
          }

          const updatedConversations = [...state.conversations];
          const convo = { ...updatedConversations[convoIndex] };
          
          convo.lastMessage = {
            _id: lastMessage._id,
            content: lastMessage.content || "",
            hasImage: lastMessage.hasImage || false,
            createdAt: lastMessage.createdAt,
            sender: {
              _id: lastMessage.senderId,
              displayName: convo.participants.find(p => p._id === lastMessage.senderId)?.displayName || "",
            }
          };
          convo.lastMessageAt = lastMessage.createdAt;
          convo.unreadCount = unreadCount || {};
          if (data.seenBy !== undefined) {
            convo.seenBy = data.seenBy;
          }

          updatedConversations.splice(convoIndex, 1);
          updatedConversations.unshift(convo);

          return { conversations: updatedConversations };
        });
      },
      updateConversationTheme: (conversationId, theme) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, theme } : c
          ),
        }));
      },
      changeTheme: async (conversationId, theme) => {
        try {
          await chatService.changeTheme(conversationId, theme);
          get().updateConversationTheme(conversationId, theme);
        } catch (error) {
          console.error("lỗi xảy ra khi đổi theme", error);
        }
      },
      updateConversationWallpaper: (conversationId, wallpaper) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, wallpaper } : c
          ),
        }));
      },
      changeWallpaper: async (conversationId, wallpaper) => {
        try {
          await chatService.changeWallpaper(conversationId, wallpaper);
          get().updateConversationWallpaper(conversationId, wallpaper);
        } catch (error) {
          console.error("lỗi xảy ra khi đổi hình nền", error);
        }
      },
      updateConversationPinnedMessages: (conversationId, pinnedMessages) => {
        set((state) => ({
          conversations: state.conversations.map((c) =>
            c._id === conversationId ? { ...c, pinnedMessages } : c
          ),
        }));
      },
      addUserToSeenBy: (conversationId, userId) => {
        set((state) => ({
          conversations: state.conversations.map((c) => {
            if (c._id === conversationId) {
              const currentSeenBy = c.seenBy || [];
              const isAlreadySeen = currentSeenBy.some((p: any) => p._id === userId || p === userId);
              if (!isAlreadySeen) {
                // Chúng ta chỉ có userId, thực tế seenBy cần full user object hoặc ID.
                // Để đơn giản UI, map _id: userId là đủ nếu chỉ cần ID để tránh trùng.
                return { ...c, seenBy: [...currentSeenBy, { _id: userId } as any] };
              }
            }
            return c;
          }),
        }));
      },
      togglePinMessage: async (conversationId, messageId) => {
        try {
          const res = await chatService.togglePinMessage(conversationId, messageId);
          get().updateConversationPinnedMessages(conversationId, res.pinnedMessages);
        } catch (error) {
          console.error("lỗi xảy ra khi ghim tin nhắn", error);
        }
      },
      markAsSeen: async (conversationId) => {
        const { user } = useAuthStore.getState();
        if (!user) return;
        try {
          await chatService.markAsSeen(conversationId);
          
          set((state) => ({
            conversations: state.conversations.map((c) =>
              c._id === conversationId
                ? {
                    ...c,
                    unreadCount: {
                      ...(c.unreadCount || {}),
                      [user._id]: 0,
                    },
                    seenBy: c.seenBy.some((u) => u._id === user._id)
                      ? c.seenBy
                      : [...c.seenBy, { _id: user._id, displayName: user.displayName }],
                  }
                : c
            ),
          }));
        } catch (error) {
          console.error("Lỗi khi gọi markAsSeen API:", error);
        }
      },
      createConversation: async (type, memberIds, name) => {
        try {
          const response = await chatService.createConversation(type, memberIds, name);
          const convo = response.conversation;
          if (!convo) return;
          
          set((state) => {
            const exists = state.conversations.some((c) => c._id === convo._id);
            const nextConvos = exists
              ? state.conversations
              : [convo, ...state.conversations];
            
            return {
              conversations: nextConvos,
              activeConversationId: convo._id,
            };
          });

          get().fetchMessages(convo._id);
          return convo;
        } catch (error) {
          console.error("Lỗi khi tạo cuộc trò chuyện:", error);
        }
      },
      unsendMessage: async (messageId) => {
        try {
          await chatService.unsendMessage(messageId);
        } catch (error) {
          console.error("Lỗi khi thu hồi tin nhắn", error);
        }
      },
      editMessage: async (messageId, content) => {
        try {
          await chatService.editMessage(messageId, content);
        } catch (error) {
          console.error("Lỗi khi sửa tin nhắn", error);
        }
      },
      reactToMessage: async (messageId, emoji) => {
        try {
          await chatService.reactToMessage(messageId, emoji);
        } catch (error) {
          console.error("Lỗi khi thả cảm xúc", error);
        }
      },
      updateMessage: (message) => {
        const convoId = message.conversationId;
        set((state) => {
          const currentConvo = state.messages[convoId];
          if (!currentConvo) return state;

          const updatedItems = currentConvo.items.map((m) =>
            m._id === message._id ? { ...m, ...message } : m
          );

          return {
            messages: {
              ...state.messages,
              [convoId]: {
                ...currentConvo,
                items: updatedItems,
              },
            },
          };
        });
      },
}));

import { create } from "zustand";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "./useAuthStore";
import { useChatStore } from "./useChatStore";

interface SocketState {
  socket: Socket | null;
  isConnected: boolean;
  onlineUsers: string[];
  typingUsers: Record<string, string[]>; // conversationId -> senderIds[]
  connectSocket: () => void;
  disconnectSocket: () => void;
  emitTyping: (conversationId: string, recipientIds: string[]) => void;
  emitStopTyping: (conversationId: string, recipientIds: string[]) => void;
}

export const useSocketStore = create<SocketState>((set, get) => ({
  socket: null,
  isConnected: false,
  onlineUsers: [],
  typingUsers: {},

  connectSocket: () => {
    const { socket } = get();
    const { accessToken } = useAuthStore.getState();

    // Nếu đã có socket hoặc không có token thì không kết nối
    if (socket || !accessToken) return;

    const backendUrl = import.meta.env.MODE === "development" 
      ? "http://localhost:5001" 
      : "";

    const newSocket = io(backendUrl, {
      auth: {
        token: accessToken,
      },
    });

    newSocket.on("connect", () => {
      set({ socket: newSocket, isConnected: true });
      console.log("⚡ Realtime connected!");
    });

    newSocket.on("disconnect", () => {
      set({ socket: null, isConnected: false });
      console.log("⚡ Realtime disconnected!");
    });

    // Nhận danh sách user online
    newSocket.on("getOnlineUsers", (users: string[]) => {
      set({ onlineUsers: users });
    });

    // Nhận tin nhắn mới
    newSocket.on("newMessage", (message) => {
      const chatStore = useChatStore.getState();
      
      // Thêm tin nhắn vào cuộc hội thoại
      chatStore.addMessage(message);
      
      // Nếu tin nhắn thuộc cuộc hội thoại đang mở và là tin nhắn của người khác, tự động gọi API seen
      const { activeConversationId, markAsSeen } = chatStore;
      const { user } = useAuthStore.getState();
      
      if (activeConversationId === message.conversationId && message.senderId !== user?._id) {
         markAsSeen(message.conversationId);
      }
    });

    // Cập nhật trạng thái cuộc hội thoại (lastMessage, unreadCount)
    newSocket.on("conversationUpdated", (data) => {
      const chatStore = useChatStore.getState();
      chatStore.updateConversationFromSocket(data);
    });

    // Lắng nghe sự kiện cập nhật tin nhắn (sửa, xóa, thả cảm xúc)
    newSocket.on("messageUpdated", (message) => {
      const chatStore = useChatStore.getState();
      chatStore.updateMessage(message);
    });

    // Lắng nghe sự kiện đổi theme
    newSocket.on("themeUpdated", ({ conversationId, theme }) => {
      const chatStore = useChatStore.getState();
      chatStore.updateConversationTheme(conversationId, theme);
    });

    // Lắng nghe sự kiện đổi hình nền
    newSocket.on("wallpaperUpdated", ({ conversationId, wallpaper }) => {
      const chatStore = useChatStore.getState();
      chatStore.updateConversationWallpaper(conversationId, wallpaper);
    });

    // Lắng nghe sự kiện ghim tin nhắn
    newSocket.on("pinnedMessagesUpdated", ({ conversationId, pinnedMessages }) => {
      const chatStore = useChatStore.getState();
      chatStore.updateConversationPinnedMessages(conversationId, pinnedMessages);
    });

    // Lắng nghe sự kiện người dùng đã xem tin nhắn
    newSocket.on("conversationSeen", ({ conversationId, userId }) => {
      const chatStore = useChatStore.getState();
      chatStore.addUserToSeenBy(conversationId, userId);
    });

    // Lắng nghe sự kiện đối phương đang gõ chữ
    newSocket.on("userTyping", ({ conversationId, senderId }) => {
      set((state) => {
        const currentList = state.typingUsers[conversationId] || [];
        if (currentList.includes(senderId)) return state;
        
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: [...currentList, senderId],
          },
        };
      });
    });

    // Lắng nghe sự kiện đối phương dừng gõ chữ
    newSocket.on("userStopTyping", ({ conversationId, senderId }) => {
      set((state) => {
        const currentList = state.typingUsers[conversationId] || [];
        return {
          typingUsers: {
            ...state.typingUsers,
            [conversationId]: currentList.filter((id) => id !== senderId),
          },
        };
      });
    });

    set({ socket: newSocket });
  },

  disconnectSocket: () => {
    const { socket } = get();
    if (socket) {
      socket.disconnect();
      set({ socket: null, isConnected: false, onlineUsers: [], typingUsers: {} });
    }
  },

  emitTyping: (conversationId, recipientIds) => {
    const { socket } = get();
    if (socket && isConnectedHelper(socket)) {
      socket.emit("typing", { conversationId, recipientIds });
    }
  },

  emitStopTyping: (conversationId, recipientIds) => {
    const { socket } = get();
    if (socket && isConnectedHelper(socket)) {
      socket.emit("stopTyping", { conversationId, recipientIds });
    }
  },
}));

// Helper check socket connection status safely
const isConnectedHelper = (socket: Socket) => {
  return socket.connected;
};

export interface Participant {
  _id: string;
  displayName: string;
  avatarUrl?: string | null;
  coverUrl?: string | null;
  bio?: string | null;
  email?: string | null;
  joinedAt: string;
}

export interface SeenUser {
  _id: string;
  displayName?: string;
  avatarUrl?: string | null;
}

export interface Group {
  name: string;
  createdBy: string;
}

export interface LastMessage {
  _id: string;
  content: string;
  hasImage?: boolean;
  createdAt: string;
  sender: {
    _id: string;
    displayName: string;
    avatarUrl?: string | null;
  };
}

export interface Conversation {
  _id: string;
  type: "direct" | "group";
  group: Group;
  participants: Participant[];
  lastMessageAt: string;
  seenBy: SeenUser[];
  lastMessage: LastMessage | null;
  unreadCount: Record<string, number>; // key = userId, value = unread count
  theme?: string;
  wallpaper?: string;
  pinnedMessages?: Message[];
  seenBy?: Participant[];
  createdAt: string;
  updatedAt: string;
}

export interface ConversationResponse {
  conversations: Conversation[];
}

export interface Message {
  _id: string;
  conversationId: string;
  senderId: string;
  content: string | null;
  imgUrl?: string | null;
  isDeleted?: boolean;
  isEdited?: boolean;
  replyTo?: {
    _id: string;
    content: string | null;
    imgUrl?: string | null;
    senderId: string;
    isDeleted?: boolean;
  } | null;
  reactions?: { emoji: string; userId: string; _id?: string }[];
  updatedAt?: string | null;
  createdAt: string;
  isOwn?: boolean;
}

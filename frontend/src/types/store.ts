import type { Conversation, Message } from "./chat";
import type { User } from "./user";

export interface AuthState {
  accessToken: string | null;
  user: User | null;
  loading: boolean;
  clearState: () => void;
  signUp: (
    username: string,
    password: string,
    email: string,
    firstname: string,
    lastname: string
  ) => Promise<void>;
  signIn: (username: string, password:string) => Promise<void>;
  signOut: () => Promise<void>;
  fetchMe: () => Promise<void>;
  refresh: () => Promise<void>;
  setAccessToken: (AccessToken: string) => void;
}

export interface ThemeState{
   isDark:boolean;
   toggleTheme:()=>void;
   setTheme:(dark:boolean)=>void;
}

export interface ChatState{
  conversations:Conversation[];
  messages:Record<string,{
    items:Message[],
    hasMore:boolean,
    nextCursor?:string|null;
  }>;
  activeConversationId:string|null;
  messageLoading:boolean;
  convoLoading:boolean;
  replyingToMessage:Message | null;
  targetScrollMessageId: string | null;
  reset:()=>void;
  setActiveConversation:(id:string|null)=>void;
  setTargetScrollMessageId: (messageId: string | null) => void;
  setReplyingToMessage:(message:Message|null)=>void;
  fetchConversations:()=>Promise<void>;
  fetchMessages:(conversationId?:string)=>Promise<void>;
  sendDirectMessage:(
    recipientId:string,
    content:string,
    imgUrl?:string,
    replyTo?:string,
  )=>Promise<void>;
  sendGroupMessage:(
    conversationId:string,
    content:string,
    imgUrl?:string,
    replyTo?:string,
  )=>Promise<void>;
  addMessage:(message:Message)=>void;
  updateConversationFromSocket:(data:{
    conversationId:string;
    lastMessage:Message;
    unreadCount:Record<string, number>;
    seenBy?:any[];
  })=>void;
  markAsSeen:(conversationId:string)=>Promise<void>;
  changeTheme:(conversationId:string, theme:string)=>Promise<void>;
  updateConversationTheme:(conversationId:string, theme:string)=>void;
  changeWallpaper:(conversationId:string, wallpaper:string)=>Promise<void>;
  updateConversationWallpaper:(conversationId:string, wallpaper:string)=>void;
  togglePinMessage:(conversationId:string, messageId:string)=>Promise<void>;
  updateConversationPinnedMessages:(conversationId:string, pinnedMessages:Message[])=>void;
  addUserToSeenBy:(conversationId:string, userId:string)=>void;
  createConversation:(
    type: "direct" | "group",
    memberIds: string[],
    name?: string
  )=>Promise<Conversation | undefined>;
  unsendMessage: (messageId: string) => Promise<void>;
  editMessage: (messageId: string, content: string) => Promise<void>;
  reactToMessage: (messageId: string, emoji: string) => Promise<void>;
  updateMessage: (message: Message) => void;
}

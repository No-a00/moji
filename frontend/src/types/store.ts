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
  reset:()=>void;
  setActiveConversation:(id:string|null)=>void;
  fetchConversations:()=>Promise<void>;
  fetchMessages:(conversationId?:string)=>Promise<void>;
  sendDirectMessage:(
    recipientId:string,
    content:string,
    imgUrl?:string,
  )=>Promise<void>;
    sendGroupMessage:(
    conversationId:string,
    content:string,
    imgUrl?:string,
  )=>Promise<void>;
}


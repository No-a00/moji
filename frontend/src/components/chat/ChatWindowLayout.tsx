import { useChatStore } from "@/stores/useChatStore";
import ChatWelcomeScreen from "./ChatWelcomeScreen";
import ChatWindowSkeleton from "./ChatWindowSkeleton";
import { SidebarInset } from "../ui/sidebar";
import ChatWindowHeader from "./ChatWindowHeader";
import ChatWindowBody from "./ChatWindowBody";
import ChatWindowFooter from "./ChatWindowFooter";
import { PinnedMessagesBanner } from "./PinnedMessagesBanner";

const ChatWindowLayout = () => {
  const {
    activeConversationId,
    conversations,
    messageLoading: loading,
    messages,
  } = useChatStore();

  const selectedConvo = conversations.find((c)=>c._id===activeConversationId)??null;
  if(!selectedConvo){
    return <ChatWelcomeScreen/>
  }
 

  return (
  <SidebarInset className="flex flex-col h-full flex-1 overflow-hidden rounded-sm shadow-md">
    {/* header */}
    <ChatWindowHeader chat={selectedConvo}/>
    
    {/* Pinned Messages Banner */}
    <PinnedMessagesBanner />

    {/* body with wallpaper */}
    <div className="flex-1 relative overflow-hidden bg-primary-foreground">
      {selectedConvo.wallpaper && (
        <div 
          className="absolute inset-0 z-0 pointer-events-none"
          style={{
            backgroundImage: `url(${selectedConvo.wallpaper})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat'
          }}
        >
        </div>
      )}
      
      <div className="relative z-10 h-full">
        <ChatWindowBody/>
      </div>
    </div>
    
    {/* footer */}
    <ChatWindowFooter seletedConvo={selectedConvo}/>
  </SidebarInset>);
};

export default ChatWindowLayout;

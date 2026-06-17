
import ChatWindowLayout from "@/components/chat/ChatWindowLayout"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {  SidebarProvider } from "@/components/ui/sidebar"
import { useChatStore } from "@/stores/useChatStore"
import { cn } from "@/lib/utils"


const ChatAppPages = () => {
   const { activeConversationId } = useChatStore();

 return( 
 <SidebarProvider >
    <div className="relative flex h-[100dvh] w-full overflow-hidden md:h-screen">
      
      {/* Sidebar Pane */}
      <div className={cn(
        "absolute inset-0 z-10 w-full transition-transform duration-300 ease-in-out md:relative md:w-auto md:translate-x-0 md:flex md:shrink-0",
        activeConversationId ? "-translate-x-full" : "translate-x-0"
      )}>
        <AppSidebar/>
      </div>

      {/* Chat Window Pane */}
      <div className={cn(
        "absolute inset-0 z-20 w-full bg-background transition-transform duration-300 ease-in-out md:relative md:flex md:flex-1 md:translate-x-0 md:p-2",
        activeConversationId ? "translate-x-0" : "translate-x-full"
      )}>
        <ChatWindowLayout/>
      </div>

    </div>

     
 </SidebarProvider>
 )
}

export default ChatAppPages

import ChatWindowLayout from "@/components/chat/ChatWindowLayout"
import { AppSidebar } from "@/components/sidebar/app-sidebar"
import {  SidebarProvider } from "@/components/ui/sidebar"
import { useChatStore } from "@/stores/useChatStore"
import { cn } from "@/lib/utils"


const ChatAppPages = () => {
   const { activeConversationId } = useChatStore();

 return( 
 <SidebarProvider >
    <div className={cn(
      "h-full w-full md:flex shrink-0 transition-all duration-300 md:w-auto", 
      activeConversationId ? "hidden md:block" : "block"
    )}>
      <AppSidebar/>
    </div>
   
    <div className={cn(
      "flex h-screen w-full p-0 md:p-2 transition-all duration-300",
      activeConversationId ? "block" : "hidden md:flex"
    )}>
       <ChatWindowLayout/>
    </div>

     
 </SidebarProvider>
 )
}

export default ChatAppPages
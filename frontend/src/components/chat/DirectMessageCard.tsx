import type { Conversation } from '@/types/chat'
import ChatCard from './ChatCard'
import { useAuthStore } from '@/stores/useAuthStore'
import { useChatStore } from '@/stores/useChatStore'
import { cn } from '@/lib/utils'
import UserAvatar from './UserAvatar'
import StatusBadge from './StatusBadge'
import UnreadCountBadge from './UnreadCountBadge'

const DirectMessageCard = ({convo}:{convo:Conversation}) => {
   const {user} = useAuthStore();
   const {activeConversationId,setActiveConversation,messages,fetchMessages} = useChatStore();
    if(!user) return null;
    const ortherUser = convo.participants.find((p)=>p._id!==user._id);
    if(!ortherUser)return null;
    const unreadCount = convo?.unreadCount?.[user._id] || 0;
    let lastMessageText = convo.lastMessage?.content ?? "";
    if (!lastMessageText && convo.lastMessage?.hasImage) {
        lastMessageText = "Đã gửi 1 hình ảnh";
    }

    const handleSelectConversation = async (id:string)=>{
        setActiveConversation(id);
        if(!messages[id]){
            await fetchMessages();
        }
    }
    return <ChatCard
    convoId={convo._id}
    name={ortherUser.displayName??""}
    timestamp={
        convo.lastMessage?.createdAt?new Date(convo.lastMessage.createdAt):undefined
    }
    isActive={activeConversationId===convo._id}
    onSelect={handleSelectConversation}
    unreadCount={unreadCount}
    leftSection={
        <>
        <UserAvatar
        type="sidebar"
        name={ortherUser.displayName??""}
        avatarUrl={ortherUser.avatarUrl??undefined}

        />
        <StatusBadge status='online'/>
        {unreadCount>0&&<UnreadCountBadge unreadCount={unreadCount}/>}
        </>
    }
    subtitle={
        <p className={cn("text-sm truncate",unreadCount>0?"font-medium text-foreground ":"text-muted-foreground")}>
            {lastMessageText}
        </p>
    }
    />
}

export default DirectMessageCard
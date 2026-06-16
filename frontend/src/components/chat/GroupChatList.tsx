import { useChatStore } from '@/stores/useChatStore'
import GroupChatCard from './GroupChatCard';
import { useAuthStore } from '@/stores/useAuthStore';

const GroupChatList = () => {
   const {conversations} = useChatStore();
   const {user} = useAuthStore();
   
   if(!conversations || !user)return null;

   const groupchats = conversations.filter((convo) => 
     convo.type === "group" && !convo.archivedBy?.includes(user._id)
   );
   

  return (
    <div>
      {
        groupchats.map((convo)=>(
          <GroupChatCard
          key={convo._id}
          convo={convo}
          />
        ))
      }
    </div>
  )
}

export default GroupChatList
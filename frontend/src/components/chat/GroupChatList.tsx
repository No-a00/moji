
import { useChatStore } from '@/stores/useChatStore'
import GroupChatCard from './GroupChatCard';
const GroupChatList = () => {
   const {conversations} = useChatStore();
   
   if(!conversations)return;
   const groupchats = conversations.filter((convo)=>convo.type==="group");
   

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
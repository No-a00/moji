
import { useChatStore } from '@/stores/useChatStore'
import DirectMessageCard from './DirectMessageCard';
import { useAuthStore } from '@/stores/useAuthStore';

const DirrectMessageList = () => {
  const {conversations} = useChatStore();
  const {user} = useAuthStore();
  
  if(!conversations || !user)return null;

  const directConversations = conversations.filter((convo) => 
    convo.type === "direct" && !convo.archivedBy?.includes(user._id)
  );
  
  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
      {
        directConversations.map((convo)=>(
          <DirectMessageCard
          convo={convo}
          key={convo._id}
          />

        ))
      }
      
    </div>
  )
}

export default DirrectMessageList
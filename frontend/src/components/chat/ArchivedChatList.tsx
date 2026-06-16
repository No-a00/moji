import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import DirectMessageCard from './DirectMessageCard';
import GroupChatCard from './GroupChatCard';

const ArchivedChatList = () => {
  const { conversations } = useChatStore();
  const { user } = useAuthStore();
  
  if(!conversations || !user) return null;

  const archivedConversations = conversations.filter((convo) => 
    convo.archivedBy?.includes(user._id)
  );
  
  if (archivedConversations.length === 0) return null;

  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
      {archivedConversations.map((convo) => (
        convo.type === "direct" ? (
          <DirectMessageCard key={convo._id} convo={convo} />
        ) : (
          <GroupChatCard key={convo._id} convo={convo} />
        )
      ))}
    </div>
  );
};

export default ArchivedChatList;

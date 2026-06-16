import { useChatStore } from '@/stores/useChatStore';
import { useAuthStore } from '@/stores/useAuthStore';
import DirectMessageCard from './DirectMessageCard';
import GroupChatCard from './GroupChatCard';

const ChatList = () => {
  const { conversations } = useChatStore();
  const { user } = useAuthStore();
  
  if (!conversations || !user) return null;

  // Lọc ra các cuộc trò chuyện chưa bị lưu trữ
  const activeChats = conversations.filter((convo) => 
    !convo.archivedBy?.includes(user._id)
  );

  // Sắp xếp: Ghim lên trước, sau đó là thời gian tin nhắn mới nhất
  const sortedChats = activeChats.sort((a, b) => {
    const isPinnedA = a.pinnedBy?.includes(user._id) ? 1 : 0;
    const isPinnedB = b.pinnedBy?.includes(user._id) ? 1 : 0;

    if (isPinnedA !== isPinnedB) {
      return isPinnedB - isPinnedA; // Ghim lên trước
    }

    const timeA = new Date(a.lastMessageAt || a.createdAt).getTime();
    const timeB = new Date(b.lastMessageAt || b.createdAt).getTime();
    return timeB - timeA;
  });

  return (
    <div className='flex-1 overflow-y-auto p-2 space-y-2'>
      {sortedChats.map((convo) => (
        convo.type === "direct" ? (
          <DirectMessageCard key={convo._id} convo={convo} />
        ) : (
          <GroupChatCard key={convo._id} convo={convo} />
        )
      ))}
    </div>
  );
};

export default ChatList;

import { useEffect, useState } from "react";
import { userService } from "@/Service/userService";
import { useChatStore } from "@/stores/useChatStore";
import UserAvatar from "./UserAvatar";

interface Friend {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

const FriendSidebarList = () => {
  const [friends, setFriends] = useState<Friend[]>([]);
  const { createConversation, selectedConvo } = useChatStore();

  useEffect(() => {
    const fetchFriends = async () => {
      try {
        const list = await userService.getAllFriends();
        setFriends(list || []);
      } catch (error) {
        console.error("Lỗi khi tải danh sách bạn bè:", error);
      }
    };
    fetchFriends();
  }, []);

  if (friends.length === 0) {
    return <div className="p-4 text-center text-xs text-muted-foreground">Chưa có bạn bè</div>;
  }

  const handleSelectFriend = async (friendId: string) => {
    try {
      await createConversation("direct", [friendId]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <div className="flex-1 overflow-y-auto p-2 space-y-1 beautiful-scrollbar">
      {friends.map((friend) => {
        // Kiểm tra xem bạn bè này có phải là người đang chat không
        const isSelected = selectedConvo?.type === 'direct' && 
                           selectedConvo.participants.some(p => p._id === friend._id);

        return (
          <button
            key={friend._id}
            onClick={() => handleSelectFriend(friend._id)}
            className={`w-full flex items-center gap-3 p-2 rounded-lg transition-smooth ${
              isSelected ? "bg-sidebar-accent text-sidebar-accent-foreground shadow-sm" : "hover:bg-sidebar-accent/50 text-sidebar-foreground"
            }`}
          >
            <UserAvatar type="sidebar" name={friend.displayName} avatarUrl={friend.avatarUrl || undefined} />
            <div className="flex-1 text-left truncate">
              <span className="text-sm font-medium">{friend.displayName}</span>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default FriendSidebarList;

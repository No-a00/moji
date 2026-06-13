import { useState, useEffect } from "react";
import { MessageSquarePlus, Search, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "../ui/input";
import { userService } from "@/Service/userService";
import { useChatStore } from "@/stores/useChatStore";
import { toast } from "sonner";
import UserAvatar from "./UserAvatar";

interface Friend {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
}

const CreateNewChat = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { createConversation } = useChatStore();

  const loadFriends = async () => {
    setLoading(true);
    try {
      const list = await userService.getAllFriends();
      setFriends(list || []);
    } catch (error) {
      console.error("Lỗi khi tải danh sách bạn bè:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadFriends();
      setSearchQuery("");
    }
  }, [isOpen]);

  const handleStartChat = async (friendId: string) => {
    try {
      await createConversation("direct", [friendId]);
      setIsOpen(false);
      toast.success("Đã mở cuộc trò chuyện");
    } catch (error) {
      toast.error("Lỗi khi tạo cuộc trò chuyện");
    }
  };

  // Filter friends based on query
  const filteredFriends = friends.filter(
    (f) =>
      f.displayName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      f.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <button className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border/40 bg-muted/20 hover:bg-muted/40 text-muted-foreground hover:text-foreground transition-all cursor-pointer text-sm font-medium">
          <span className="flex items-center gap-2">
            <Search className="size-4 text-muted-foreground/75" />
            Tìm kiếm bạn bè...
          </span>
          <MessageSquarePlus className="size-4" />
        </button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] rounded-xl border border-border/50 shadow-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <MessageSquarePlus className="size-5 text-primary" /> Cuộc Trò Chuyện Mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 size-4 text-muted-foreground" />
            <Input
              placeholder="Tìm theo tên bạn bè..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 bg-muted/30 focus-visible:ring-primary/20"
            />
          </div>

          <div className="space-y-1 max-h-[300px] overflow-y-auto beautiful-scrollbar">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="size-5 animate-spin text-primary" />
              </div>
            ) : filteredFriends.length === 0 ? (
              <div className="text-center text-sm text-muted-foreground py-8">
                {friends.length === 0 ? "Bạn chưa có bạn bè nào. Hãy kết bạn trước nhé!" : "Không tìm thấy bạn bè nào khớp."}
              </div>
            ) : (
              filteredFriends.map((friend) => (
                <button
                  key={friend._id}
                  onClick={() => handleStartChat(friend._id)}
                  className="w-full flex items-center gap-3 p-2.5 rounded-lg hover:bg-muted/45 transition-all text-left"
                >
                  <UserAvatar name={friend.displayName} avatarUrl={friend.avatarUrl || undefined} />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{friend.displayName}</p>
                    <p className="text-xs text-muted-foreground">@{friend.username}</p>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default CreateNewChat;
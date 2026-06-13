import { useState, useEffect } from "react";
import { Users, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "../ui/button";
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

const NewGroupChatModal = ({ children }: { children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [friends, setFriends] = useState<Friend[]>([]);
  const [loading, setLoading] = useState(false);
  const [groupName, setGroupName] = useState("");
  const [selectedFriends, setSelectedFriends] = useState<string[]>([]);
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
      setGroupName("");
      setSelectedFriends([]);
    }
  }, [isOpen]);

  const handleToggleFriend = (friendId: string) => {
    setSelectedFriends((prev) =>
      prev.includes(friendId)
        ? prev.filter((id) => id !== friendId)
        : [...prev, friendId]
    );
  };

  const handleCreateGroup = async () => {
    if (!groupName.trim()) {
      toast.error("Vui lòng nhập tên nhóm!");
      return;
    }
    if (selectedFriends.length === 0) {
      toast.error("Vui lòng chọn ít nhất 1 thành viên!");
      return;
    }

    setLoading(true);
    try {
      await createConversation("group", selectedFriends, groupName);
      setIsOpen(false);
      toast.success(`Đã tạo nhóm "${groupName}" thành công!`);
    } catch (error) {
      toast.error("Lỗi khi tạo nhóm chat");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="flex items-center justify-center hover:text-foreground">
            <Plus className="size-4" />
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-[420px] rounded-xl border border-border/50 shadow-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="text-lg font-bold tracking-tight text-foreground flex items-center gap-2">
            <Users className="size-5 text-primary" /> Tạo Nhóm Chat Mới
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Nhập tên nhóm */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase">
              Tên Nhóm
            </label>
            <Input
              placeholder="Nhập tên nhóm chat..."
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="h-9 bg-muted/30 focus-visible:ring-primary/20"
            />
          </div>

          {/* Chọn bạn bè */}
          <div className="space-y-1">
            <label className="text-xs font-semibold text-muted-foreground uppercase flex justify-between">
              <span>Chọn Thành Viên</span>
              <span className="text-primary font-bold">{selectedFriends.length} đã chọn</span>
            </label>
            
            <div className="border border-border/40 rounded-lg p-2 max-h-[200px] overflow-y-auto beautiful-scrollbar space-y-1">
              {loading ? (
                <div className="flex items-center justify-center py-6">
                  <Loader2 className="size-5 animate-spin text-primary" />
                </div>
              ) : friends.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-6">
                  Hãy kết bạn trước khi tạo nhóm chat.
                </div>
              ) : (
                friends.map((friend) => (
                  <div
                    key={friend._id}
                    onClick={() => handleToggleFriend(friend._id)}
                    className="flex items-center justify-between p-2 rounded-md hover:bg-muted/30 transition-all cursor-pointer"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar name={friend.displayName} avatarUrl={friend.avatarUrl || undefined} />
                      <div>
                        <p className="font-semibold text-sm text-foreground">{friend.displayName}</p>
                        <p className="text-xs text-muted-foreground">@{friend.username}</p>
                      </div>
                    </div>
                    
                    <input
                      type="checkbox"
                      checked={selectedFriends.includes(friend._id)}
                      onChange={() => {}} // Handle by clicking the row
                      className="size-4 accent-primary rounded text-white border-border cursor-pointer focus:ring-0"
                    />
                  </div>
                ))
              )}
            </div>
          </div>

          <Button
            onClick={handleCreateGroup}
            className="w-full mt-2 bg-gradient-primary text-white shadow-glow"
            disabled={loading || !groupName.trim() || selectedFriends.length === 0}
          >
            {loading ? <Loader2 className="size-4 animate-spin" /> : "Tạo Nhóm"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewGroupChatModal;
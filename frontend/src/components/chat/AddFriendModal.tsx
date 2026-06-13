import { useState, useEffect } from "react";
import { UserPlus2, Search, Check, X, Send, UserCheck, Loader2 } from "lucide-react";
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
import { toast } from "sonner";
import UserAvatar from "./UserAvatar";
import { useChatStore } from "@/stores/useChatStore";

interface UserSearchResult {
  _id: string;
  username: string;
  displayName: string;
  avatarUrl?: string | null;
  bio?: string;
}

interface PendingRequest {
  _id: string;
  from?: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  to?: {
    _id: string;
    username: string;
    displayName: string;
    avatarUrl?: string | null;
  };
  message?: string;
}

const AddFriendModal = ({ children }: { children?: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<"search" | "received" | "sent">("search");
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [requestsLoading, setRequestsLoading] = useState(false);
  const [sentRequests, setSentRequests] = useState<PendingRequest[]>([]);
  const [receivedRequests, setReceivedRequests] = useState<PendingRequest[]>([]);
  const { fetchConversations } = useChatStore();

  // Load friend requests
  const loadRequests = async () => {
    setRequestsLoading(true);
    try {
      const data = await userService.getFriendRequests();
      setSentRequests(data.sent || []);
      setReceivedRequests(data.received || []);
    } catch (error) {
      console.error("Lỗi khi tải yêu cầu kết bạn:", error);
    } finally {
      setRequestsLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadRequests();
    }
  }, [isOpen]);

  const handleSearch = async () => {
    if (!searchQuery.trim()) return;
    setLoading(true);
    try {
      const users = await userService.searchUsers(searchQuery);
      setSearchResults(users);
    } catch (error) {
      toast.error("Lỗi khi tìm kiếm người dùng");
    } finally {
      setLoading(false);
    }
  };

  const handleSendRequest = async (userId: string) => {
    try {
      await userService.sendFriendRequest(userId, "Kết bạn với mình nhé!");
      toast.success("Đã gửi lời mời kết bạn");
      loadRequests();
    } catch (error: any) {
      const msg = error.response?.data?.message || "Không thể gửi lời mời kết bạn";
      toast.error(msg);
    }
  };

  const handleAcceptRequest = async (requestId: string) => {
    try {
      await userService.acceptFriendRequest(requestId);
      toast.success("Đã kết bạn thành công!");
      // Tải lại hội thoại ở sidebar để cập nhật danh sách bạn bè mới
      fetchConversations();
      loadRequests();
    } catch (error) {
      toast.error("Lỗi khi đồng ý kết bạn");
    }
  };

  const handleDeclineRequest = async (requestId: string) => {
    try {
      await userService.declineFriendRequest(requestId);
      toast.success("Đã từ chối lời mời kết bạn");
      loadRequests();
    } catch (error) {
      toast.error("Lỗi khi từ chối kết bạn");
    }
  };

  // Helper check if already requested
  const isRequestPending = (userId: string) => {
    return (
      sentRequests.some((r) => r.to?._id === userId) ||
      receivedRequests.some((r) => r.from?._id === userId)
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children || (
          <button className="flex items-center justify-center hover:text-foreground">
            <UserPlus2 className="size-4" />
          </button>
        )}
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-[480px] rounded-xl border border-border/50 shadow-2xl bg-background">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold tracking-tight text-foreground flex items-center gap-2">
            <UserPlus2 className="size-5 text-primary" /> Quản Lý Bạn Bè
          </DialogTitle>
        </DialogHeader>

        {/* Tab Header */}
        <div className="flex border-b border-border/40 mt-2">
          <button
            onClick={() => setActiveTab("search")}
            className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "search"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Tìm Kiếm
          </button>
          <button
            onClick={() => setActiveTab("received")}
            className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-all relative ${
              activeTab === "received"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã Nhận
            {receivedRequests.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 text-2xs font-bold bg-destructive text-white rounded-full">
                {receivedRequests.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("sent")}
            className={`flex-1 py-2 text-sm font-semibold border-b-2 transition-all ${
              activeTab === "sent"
                ? "border-primary text-primary"
                : "border-transparent text-muted-foreground hover:text-foreground"
            }`}
          >
            Đã Gửi
          </button>
        </div>

        {/* Tab Contents */}
        <div className="py-4 min-h-[300px] max-h-[400px] overflow-y-auto beautiful-scrollbar">
          {activeTab === "search" && (
            <div className="space-y-4">
              <div className="flex gap-2">
                <Input
                  placeholder="Nhập tên người dùng hoặc email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                  className="h-9 bg-muted/30 focus-visible:ring-primary/20"
                />
                <Button size="sm" onClick={handleSearch} className="h-9" disabled={loading}>
                  {loading ? <Loader2 className="size-4 animate-spin" /> : <Search className="size-4" />}
                </Button>
              </div>

              <div className="space-y-2">
                {searchResults.length === 0 ? (
                  <div className="text-center text-sm text-muted-foreground py-8">
                    {searchQuery ? "Không tìm thấy người dùng phù hợp." : "Tìm kiếm để kết nối với mọi người."}
                  </div>
                ) : (
                  searchResults.map((user) => {
                    const pending = isRequestPending(user._id);
                    return (
                      <div
                        key={user._id}
                        className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/10 hover:bg-muted/20 transition-all"
                      >
                        <div className="flex items-center gap-3">
                          <UserAvatar name={user.displayName} avatarUrl={user.avatarUrl || undefined} />
                          <div className="text-left">
                            <p className="font-semibold text-sm text-foreground">{user.displayName}</p>
                            <p className="text-xs text-muted-foreground">@{user.username}</p>
                          </div>
                        </div>

                        {pending ? (
                          <Button size="sm" variant="ghost" disabled className="h-8 text-xs gap-1">
                            <Loader2 className="size-3 animate-spin" /> Đang chờ
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleSendRequest(user._id)}
                            className="h-8 text-xs gap-1"
                          >
                            <Send className="size-3" /> Kết bạn
                          </Button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "received" && (
            <div className="space-y-2">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : receivedRequests.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Chưa có lời mời kết bạn nào.
                </div>
              ) : (
                receivedRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/10"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={req.from?.displayName || "User"}
                        avatarUrl={req.from?.avatarUrl || undefined}
                      />
                      <div className="text-left">
                        <p className="font-semibold text-sm text-foreground">
                          {req.from?.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">@{req.from?.username}</p>
                        {req.message && (
                          <p className="text-2xs text-muted-foreground mt-1 italic">
                            "{req.message}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-1">
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleAcceptRequest(req._id)}
                        className="size-8 text-emerald-500 hover:bg-emerald-500/10"
                      >
                        <Check className="size-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleDeclineRequest(req._id)}
                        className="size-8 text-destructive hover:bg-destructive/10"
                      >
                        <X className="size-4" />
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {activeTab === "sent" && (
            <div className="space-y-2">
              {requestsLoading ? (
                <div className="flex items-center justify-center py-8">
                  <Loader2 className="size-6 animate-spin text-primary" />
                </div>
              ) : sentRequests.length === 0 ? (
                <div className="text-center text-sm text-muted-foreground py-8">
                  Bạn chưa gửi lời mời kết bạn nào.
                </div>
              ) : (
                sentRequests.map((req) => (
                  <div
                    key={req._id}
                    className="flex items-center justify-between p-3 rounded-lg border border-border/20 bg-muted/10"
                  >
                    <div className="flex items-center gap-3">
                      <UserAvatar
                        name={req.to?.displayName || "User"}
                        avatarUrl={req.to?.avatarUrl || undefined}
                      />
                      <div className="text-left">
                        <p className="font-semibold text-sm text-foreground">
                          {req.to?.displayName}
                        </p>
                        <p className="text-xs text-muted-foreground">@{req.to?.username}</p>
                      </div>
                    </div>

                    <Button size="sm" variant="ghost" disabled className="h-8 text-xs gap-1">
                      <UserCheck className="size-3 text-muted-foreground" /> Đã gửi
                    </Button>
                  </div>
                ))
              )}
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default AddFriendModal;
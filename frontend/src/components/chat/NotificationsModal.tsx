import { useEffect, useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Button } from "../ui/button"
import { Check, X, Bell } from "lucide-react"
import UserAvatar from "./UserAvatar"
import { userService } from "@/Service/userService"
import { toast } from "sonner"

interface FriendRequest {
  _id: string;
  from: {
    _id: string;
    displayName: string;
    username: string;
    avatarUrl?: string;
  };
  message?: string;
  createdAt: string;
}

const NotificationsModal = ({ children }: { children: React.ReactNode }) => {
  const [requests, setRequests] = useState<FriendRequest[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchRequests();
    }
  }, [isOpen]);

  const fetchRequests = async () => {
    try {
      setIsLoading(true);
      const data = await userService.getFriendRequests();
      setRequests(data.received || []);
    } catch (error) {
      console.error(error);
      toast.error("Không thể tải thông báo");
    } finally {
      setIsLoading(false);
    }
  };

  const handleAccept = async (requestId: string) => {
    try {
      await userService.acceptFriendRequest(requestId);
      toast.success("Đã kết bạn!");
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      toast.error("Lỗi khi đồng ý kết bạn");
    }
  };

  const handleDecline = async (requestId: string) => {
    try {
      await userService.declineFriendRequest(requestId);
      toast.success("Đã từ chối");
      setRequests(prev => prev.filter(req => req._id !== requestId));
    } catch (error) {
      toast.error("Lỗi khi từ chối kết bạn");
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Bell className="size-5" /> Thông báo
          </DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto beautiful-scrollbar mt-4 pr-2">
          <div className="space-y-4">
            {isLoading ? (
              <p className="text-center text-sm text-muted-foreground py-4">Đang tải...</p>
            ) : requests.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-4">Bạn không có thông báo nào mới</p>
            ) : (
              requests.map((req) => (
                <div key={req._id} className="flex items-center gap-3 p-2 rounded-lg border">
                  <UserAvatar name={req.from.displayName} avatarUrl={req.from.avatarUrl || undefined} type="chat" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{req.from.displayName}</p>
                    <p className="text-xs text-muted-foreground truncate">{req.message || "Muốn kết bạn với bạn"}</p>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button onClick={() => handleAccept(req._id)} size="icon" variant="ghost" className="h-8 w-8 text-green-500 hover:text-green-600 hover:bg-green-500/10">
                      <Check className="size-4" />
                    </Button>
                    <Button onClick={() => handleDecline(req._id)} size="icon" variant="ghost" className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-500/10">
                      <X className="size-4" />
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default NotificationsModal

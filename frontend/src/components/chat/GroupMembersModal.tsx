import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import type { Participant } from "@/types/chat"
import UserAvatar from "./UserAvatar"
import { Users } from "lucide-react"
import { Button } from "../ui/button"

interface GroupMembersModalProps {
  participants: Participant[];
  groupName?: string;
}

const GroupMembersModal = ({ participants, groupName }: GroupMembersModalProps) => {
  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 ml-auto mr-2 rounded-full">
          <Users className="size-5 text-muted-foreground" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Thành viên nhóm {groupName && <span className="text-primary">({groupName})</span>}</DialogTitle>
        </DialogHeader>
        <div className="max-h-[60vh] overflow-y-auto beautiful-scrollbar mt-4 pr-2">
          <div className="space-y-4">
            {participants.map((p) => (
              <div key={p._id} className="flex items-center gap-3">
                <UserAvatar name={p.displayName} avatarUrl={p.avatarUrl || undefined} type="chat" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.displayName}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default GroupMembersModal

import { MoreHorizontal, BellOff, Pin } from "lucide-react";
import { Card } from "../ui/card";
import { formatOnlineTime, cn } from "@/lib/utils";

interface ChatCardProps {
  convoId: string;
  name: string;
  timestamp?: Date;
  isActive: boolean;
  onSelect: (id: string) => void;
  unreadCount?: number;
  leftSection: React.ReactNode;
  subtitle: React.ReactNode;
  actionMenu?: React.ReactNode;
  isMuted?: boolean;
  isPinned?: boolean;
}

const ChatCard = ({
  convoId,
  name,
  timestamp,
  isActive,
  onSelect,
  unreadCount,
  leftSection,
  subtitle,
  actionMenu,
  isMuted,
  isPinned,
}: ChatCardProps) => {
  return (
    <Card
      key={convoId}
      className={cn(
        "group border-none p-3 cursor-pointer transition-smooth glass hover:bg-muted/30",
        isActive &&
          "ring-2 ring-primary/50 bg-gradient-to-tr from-primary-glow/10 to-primary-foreground"
      )}
      onClick={() => onSelect(convoId)}
    >
      <div className="flex items-center gap-3">
        <div className="relative shrink-0">{leftSection}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1">
            <h3
              className={cn(
                "font-semibold text-sm truncate flex items-center gap-1",
                unreadCount && unreadCount > 0 && "text-foreground"
              )}
            >
              {name}
              {isPinned && <Pin className="size-3.5 text-primary rotate-45" fill="currentColor" />}
            </h3>
            <span
            className="text-xs text-muted-foreground"
            >{timestamp ? formatOnlineTime(timestamp) : ""}</span>
          </div>
          <div className="flex items-center justify-between">
            
            <div className="flex items-center gap-1 flex-1 min-w-0">
               {isMuted && <BellOff className="size-3.5 text-muted-foreground shrink-0" />}
               {subtitle}
            </div>
            {actionMenu ? (
              <div onClick={(e) => e.stopPropagation()} className="opacity-0 group-hover:opacity-100 transition-opacity">
                {actionMenu}
              </div>
            ) : (
              <MoreHorizontal className="size-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity"/>
            )}
          </div>
        </div>
      </div>
    </Card>
  );
};

export default ChatCard;

import { useChatStore } from "@/stores/useChatStore";
import { Pin, X } from "lucide-react";
import { useState } from "react";

export const PinnedMessagesBanner = () => {
    const { conversations, activeConversationId, togglePinMessage } = useChatStore();
    const chat = conversations.find((c) => c._id === activeConversationId);
    
    const [expanded, setExpanded] = useState(false);

    // Nếu không có tin ghim thì không hiển thị
    if (!chat || !chat.pinnedMessages || chat.pinnedMessages.length === 0) return null;

    const pinnedMessages = chat.pinnedMessages.filter(Boolean); // Lọc bỏ các giá trị null/undefined nếu có
    if (pinnedMessages.length === 0) return null;
    
    const latestPin = pinnedMessages[pinnedMessages.length - 1]; // Tin mới nhất ghim ở cuối mảng
    if (!latestPin) return null;

    const handleUnpin = (e: React.MouseEvent, messageId: string) => {
        e.stopPropagation();
        togglePinMessage(chat._id, messageId);
    };

    const handleJumpToMessage = (messageId: string) => {
        const el = document.getElementById("message-" + messageId);
        if (el) {
            el.scrollIntoView({ behavior: "smooth", block: "center" });
            useChatStore.getState().setTargetScrollMessageId(messageId);
        } else {
            // Chưa tải, yêu cầu load messages cho đến khi tìm thấy
            useChatStore.getState().setTargetScrollMessageId(messageId);
        }
        setExpanded(false);
    };

    return (
        <div className="bg-background/95 backdrop-blur-md border-b flex flex-col shadow-sm text-sm z-20">
            {/* Thanh thu gọn - Luôn hiện tin nhắn ghim mới nhất */}
            <div 
                className="flex items-center justify-between px-4 py-2 cursor-pointer hover:bg-muted/50 transition-colors"
                onClick={() => {
                    if (expanded) setExpanded(false);
                    else handleJumpToMessage(latestPin._id);
                }}
            >
                <div className="flex items-center gap-2 flex-1 overflow-hidden">
                    <Pin className="w-4 h-4 text-primary shrink-0" />
                    <div className="flex flex-col truncate">
                        <span className="font-semibold text-xs text-primary">Tin nhắn đã ghim</span>
                        <span className="text-muted-foreground truncate">
                            {latestPin.content || (latestPin.imgUrl ? "[Hình ảnh]" : "Tin nhắn")}
                        </span>
                    </div>
                </div>
                {pinnedMessages.length > 1 && (
                    <div className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded-full shrink-0">
                        {pinnedMessages.length} tin ghim
                    </div>
                )}
            </div>

            {/* Danh sách mở rộng - Chứa tất cả tin ghim */}
            {expanded && pinnedMessages.length > 1 && (
                <div className="flex flex-col border-t bg-muted/20">
                    {/* Đảo ngược mảng để tin mới nhất nằm trên cùng */}
                    {[...pinnedMessages].reverse().map((msg) => (
                        <div key={msg._id} onClick={() => handleJumpToMessage(msg._id)} className="flex items-center justify-between px-4 py-2 hover:bg-muted/50 border-b last:border-0 group cursor-pointer">
                            <div className="flex items-center gap-2 flex-1 overflow-hidden">
                                <div className="w-1 h-full bg-primary/20 rounded-full py-3" />
                                <div className="flex flex-col truncate">
                                    <span className="font-medium text-xs truncate">
                                        {(msg as any).senderId?.displayName || "Người dùng"}
                                    </span>
                                    <span className="text-muted-foreground truncate text-xs">
                                        {msg.content || (msg.imgUrl ? "[Hình ảnh]" : "Tin nhắn")}
                                    </span>
                                </div>
                            </div>
                            <button 
                                onClick={(e) => handleUnpin(e, msg._id)}
                                className="p-1.5 rounded-full hover:bg-destructive/10 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-all shrink-0"
                                title="Bỏ ghim"
                            >
                                <X className="w-4 h-4" />
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

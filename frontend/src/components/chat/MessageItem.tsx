import { useState, useEffect, useRef } from "react";
import { cn, formatMessageTime } from "@/lib/utils";
import type { Conversation, Message, Participant } from "@/types/chat"
import UserAvatar from "./UserAvatar";
import { Card } from "../ui/card";
import { Dialog, DialogContent, DialogTrigger } from "../ui/dialog";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "../ui/dropdown-menu";
import { MoreHorizontal, Pencil, Reply, Smile, Trash, Pin, FileText, Download } from 'lucide-react';
import { useChatStore } from "@/stores/useChatStore";
import { getThemeGradient } from "@/lib/themes";

import { useAuthStore } from "@/stores/useAuthStore";

interface MessageItemProp{
    message:Message;
    index:number;
    messages:Message[];
    selectedconvo:Conversation;
    lastMessageStatus:"delivered"|"seen"
}

const EMOJI_OPTIONS = ["👍", "❤️", "😂", "😮", "😢", "😡"];

const MessageItem = ({message,index,messages,selectedconvo,lastMessageStatus}:MessageItemProp) => {
  const { unsendMessage, editMessage, reactToMessage, setReplyingToMessage, togglePinMessage, targetScrollMessageId, setTargetScrollMessageId } = useChatStore();
  const { user } = useAuthStore();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isHighlighted, setIsHighlighted] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Xử lý hiệu ứng highlight khi scroll tới
  useEffect(() => {
    if (targetScrollMessageId === message._id) {
        setIsHighlighted(true);
        const timer = setTimeout(() => {
            setIsHighlighted(false);
            setTargetScrollMessageId(null); // Reset lại state
        }, 2000); // Highlight trong 2 giây
        return () => clearTimeout(timer);
    }
  }, [targetScrollMessageId, message._id, setTargetScrollMessageId]);
  
  const prev = messages[index-1];
  const next = messages[index+1];
  
  const isGroupBreak = index===0||
  message.senderId!==prev?.senderId||
  new Date(message.createdAt).getTime()-new Date(prev?.createdAt||0).getTime()>300000;//5phut
  
  const isPrevSameSender = prev?.senderId === message.senderId && new Date(message.createdAt).getTime() - new Date(prev.createdAt).getTime() < 300000;
  const isNextSameSender = next?.senderId === message.senderId && new Date(next.createdAt).getTime() - new Date(message.createdAt).getTime() < 300000;

  const participant = selectedconvo.participants.find((p:Participant)=>p._id.toString()===message.senderId.toString())
  
  // Close mobile menu when clicking outside
  useEffect(() => {
    if (!showMobileMenu) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
        if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
            setShowMobileMenu(false);
        }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
        document.removeEventListener("mousedown", handleClickOutside);
        document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showMobileMenu]);

  // Dynamic border radius logic
  let borderRadiusClass = "rounded-2xl";
  if (message.isOwn) {
    if (isPrevSameSender && isNextSameSender) {
        borderRadiusClass = "rounded-2xl rounded-tr-sm rounded-br-sm";
    } else if (isPrevSameSender) {
        borderRadiusClass = "rounded-2xl rounded-tr-sm";
    } else if (isNextSameSender) {
        borderRadiusClass = "rounded-2xl rounded-br-sm";
    }
  } else {
    if (isPrevSameSender && isNextSameSender) {
        borderRadiusClass = "rounded-2xl rounded-tl-sm rounded-bl-sm";
    } else if (isPrevSameSender) {
        borderRadiusClass = "rounded-2xl rounded-tl-sm";
    } else if (isNextSameSender) {
        borderRadiusClass = "rounded-2xl rounded-bl-sm";
    }
  }

  const handleUnsend = () => {
    if (window.confirm("Bạn có chắc chắn muốn thu hồi tin nhắn này không?")) {
        unsendMessage(message._id!);
    }
  }

  const handleEdit = () => {
    const newContent = window.prompt("Nhập nội dung tin nhắn mới:", message.content || "");
    if (newContent && newContent !== message.content) {
        editMessage(message._id!, newContent);
    }
  }

  const handleReact = (emoji: string) => {
    reactToMessage(message._id!, emoji);
    setShowMobileMenu(false);
  }

  const handleToggleMyReaction = () => {
    if (!user) return;
    const myReaction = message.reactions?.find(r => r.userId.toString() === user._id.toString());
    if (myReaction) {
        handleReact(myReaction.emoji);
    } else {
        handleReact("👍");
    }
  }

    return (
    <div 
        id={"message-" + message._id} 
        className={cn("flex gap-2 message-bounce group transition-all duration-500", 
            message.isOwn ? "justify-end" : "justify-start", 
            isPrevSameSender ? "mt-1" : "mt-4",
            isHighlighted && "bg-primary/20 dark:bg-primary/30 p-2 rounded-xl"
        )}
    >
        
        {/* avartar */}
        {!message.isOwn&&(
            <div className="w-8 flex items-end">
                {!isNextSameSender && (
                    <UserAvatar
                    type="chat"
                    name={participant?.displayName??"Moji"}
                    avatarUrl={participant?.avatarUrl??undefined}
                    />
                )}
            </div>
        )}
        
        {/* tin nhắn */}
        <div 
            className={cn("max-w-[85%] lg:max-w-md space-y-1 flex flex-col relative")}
            style={{ alignItems: message.isOwn ? "flex-end" : "flex-start" }}
            onContextMenu={(e) => {
                e.preventDefault();
                setShowMobileMenu(!showMobileMenu);
            }}
            ref={menuRef}
        >
            {/* Action Menu */}
            {!message.isDeleted && (
                <div className={cn(
                    "absolute z-50 flex items-center gap-1 transition-all",
                    // Desktop positioning (side)
                    "lg:top-1/2 lg:-translate-y-1/2",
                    message.isOwn ? "lg:right-full lg:mr-2 lg:left-auto lg:bottom-auto" : "lg:left-full lg:ml-2 lg:right-auto lg:bottom-auto",
                    // Mobile positioning (above)
                    "bottom-full mb-1",
                    message.isOwn ? "right-0" : "left-0",
                    // Visibility logic
                    "lg:opacity-0 lg:group-hover:opacity-100",
                    showMobileMenu ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none lg:pointer-events-auto"
                )}>
                    {/* Nút thả cảm xúc */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors bg-background/80 shadow-sm border">
                                <Smile className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent side="top" align={message.isOwn ? "end" : "start"} className="flex gap-1 p-2">
                            {EMOJI_OPTIONS.map(emoji => (
                                <DropdownMenuItem 
                                    key={emoji} 
                                    className="text-xl hover:scale-125 transition-transform cursor-pointer p-0 focus:bg-transparent"
                                    onClick={() => handleReact(emoji)}
                                >
                                    {emoji}
                                </DropdownMenuItem>
                            ))}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    {/* Các hành động khác (Trả lời, Thu hồi, Chỉnh sửa) - Hiện cho mọi tin nhắn nhưng tuỳ quyền */}
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <button className="p-1.5 rounded-full hover:bg-muted text-muted-foreground transition-colors bg-background/80 shadow-sm border">
                                <MoreHorizontal className="w-4 h-4" />
                            </button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align={message.isOwn ? "end" : "start"}>
                            <DropdownMenuItem 
                                onClick={() => {
                                    setReplyingToMessage(message);
                                    setShowMobileMenu(false);
                                }} 
                                className="gap-2 cursor-pointer"
                            >
                                <Reply className="w-4 h-4" /> Trả lời
                            </DropdownMenuItem>
                            
                            <DropdownMenuItem 
                                onClick={() => {
                                    togglePinMessage(selectedconvo._id, message._id);
                                    setShowMobileMenu(false);
                                }} 
                                className="gap-2 cursor-pointer"
                            >
                                <Pin className="w-4 h-4" /> 
                                {selectedconvo.pinnedMessages?.some(m => m?._id === message._id) ? "Bỏ ghim" : "Ghim tin nhắn"}
                            </DropdownMenuItem>
                            
                            {message.isOwn && (
                                <>
                                    <DropdownMenuItem onClick={handleEdit} className="gap-2 cursor-pointer">
                                        <Pencil className="w-4 h-4" /> Chỉnh sửa
                                    </DropdownMenuItem>
                                    <DropdownMenuItem onClick={handleUnsend} className="gap-2 text-destructive focus:bg-destructive/10 cursor-pointer">
                                        <Trash className="w-4 h-4" /> Thu hồi
                                    </DropdownMenuItem>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            )}

            {/* Trích dẫn tin nhắn (Reply Preview) */}
            {message.replyTo && (
                <div 
                    onClick={() => {
                        if (message.replyTo) {
                            setTargetScrollMessageId(message.replyTo._id);
                            // Cố gắng cuộn mượt luôn nếu có trên màn hình
                            const el = document.getElementById("message-" + message.replyTo._id);
                            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'center' });
                        }
                    }}
                    className={cn(
                        "relative mb-[-12px] pb-[16px] px-3 pt-2 rounded-t-2xl text-xs flex flex-col gap-1 cursor-pointer hover:brightness-95 hover:scale-[1.01] transition-all opacity-80",
                        message.isOwn ? "bg-black/20 dark:bg-black/40 text-white items-end self-end" : "bg-muted text-foreground items-start self-start"
                    )}
                    style={{ maxWidth: "85%", width: "fit-content" }}
                >
                    <span className="font-semibold text-[10px] opacity-70">
                        Đã trả lời {message.replyTo.senderId === user?._id ? "chính mình" : "tin nhắn"}
                    </span>
                    <span className="truncate w-full">
                        {message.replyTo.isDeleted ? "Tin nhắn đã thu hồi" : (message.replyTo.content || "Hình ảnh")}
                    </span>
                </div>
            )}

            <Card className={cn(
            "p-3 relative", 
            borderRadiusClass, 
            message.isDeleted ? "border border-border bg-transparent text-muted-foreground italic" : 
                (message.isOwn ? `text-white border-0 shadow-[var(--shadow-bubble)] ${getThemeGradient(selectedconvo.theme)}` : "chat-bubble-received")
        )}>
            {message.isDeleted ? (
                <p className="text-sm leading-relaxed break-words">{message.content}</p>
            ) : (
                <>
                    {message.imgUrl && (
                    <div className="mb-2">
                        <Dialog>
                        <DialogTrigger asChild>
                            <img 
                            src={message.imgUrl} 
                            alt="Đính kèm" 
                            className="max-w-[200px] sm:max-w-[250px] rounded-lg object-cover cursor-pointer hover:opacity-90 transition-opacity" 
                            />
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl bg-transparent border-none shadow-none flex justify-center items-center">
                            <img 
                            src={message.imgUrl} 
                            alt="Đính kèm full" 
                            className="max-w-full max-h-[80vh] object-contain rounded-md" 
                            />
                        </DialogContent>
                        </Dialog>
                    </div>
                    )}
                    {message.fileUrl && !message.audioUrl && (
                        <div className="mb-1 flex items-center gap-3 w-full min-w-[200px] max-w-sm">
                            <div className={cn(
                                "w-10 h-10 rounded-full flex items-center justify-center shrink-0", 
                                message.isOwn ? "bg-white/20 text-white" : "bg-primary/10 text-primary"
                            )}>
                                <FileText className="w-5 h-5" />
                            </div>
                            <div className="flex flex-col flex-1 overflow-hidden min-w-0">
                                <span 
                                    className={cn(
                                        "font-medium text-sm truncate",
                                        message.isOwn ? "text-white" : "text-foreground"
                                    )} 
                                    title={message.fileName || "Tài liệu"}
                                >
                                    {message.fileName || "Tài liệu đính kèm"}
                                </span>
                                <span 
                                    className={cn(
                                        "text-xs mt-0.5", 
                                        message.isOwn ? "text-white/70" : "text-muted-foreground"
                                    )}
                                >
                                    {message.fileSize ? (message.fileSize / 1024 / 1024).toFixed(2) + " MB" : "Unknown size"}
                                </span>
                            </div>
                            <a 
                                href={message.fileUrl} 
                                download={message.fileName || "download"} 
                                target="_blank" 
                                rel="noreferrer" 
                                className={cn(
                                    "p-2 rounded-full transition-colors shrink-0 flex items-center justify-center", 
                                    message.isOwn ? "hover:bg-white/20 text-white" : "hover:bg-muted text-foreground"
                                )}
                            >
                                <Download className="w-5 h-5" />
                            </a>
                        </div>
                    )}
                    {message.audioUrl && (
                        <div className="mb-2">
                            <audio controls src={message.audioUrl} className={cn("max-w-full rounded-full h-10 w-[200px] sm:w-[250px]", message.isOwn ? "invert brightness-150" : "")} />
                        </div>
                    )}
                    {message.content && <p className="text-sm leading-relaxed break-words">{message.content}</p>}
                </>
            )}
            
            {/* Hiển thị danh sách cảm xúc */}
            {message.reactions && message.reactions.length > 0 && (
                <div 
                    className={cn(
                        "absolute -bottom-3 px-1.5 py-0.5 bg-background border rounded-full text-xs shadow-sm flex items-center gap-1 cursor-pointer hover:bg-muted transition-colors",
                        message.isOwn ? "right-2" : "left-2"
                    )}
                    onClick={handleToggleMyReaction}
                >
                    {Array.from(new Set(message.reactions.map(r => r.emoji))).slice(0, 3).map((emoji, i) => (
                        <span key={i}>{emoji}</span>
                    ))}
                    {message.reactions.length > 1 && <span className="ml-1 font-medium">{message.reactions.length}</span>}
                </div>
            )}
        </Card>
        
        {/* Thời gian / Đã chỉnh sửa */}
        <div className="flex items-center gap-2 mt-1 px-1">
            {isGroupBreak && (
                <span className="text-xs text-muted-foreground">
                    {formatMessageTime(new Date(message.createdAt))}
                </span>
            )}
            {message.isEdited && !message.isDeleted && (
                <span className="text-[10px] text-muted-foreground italic">
                    Đã chỉnh sửa
                </span>
            )}
        </div>

        {/* seen/dlivered / avatars */}
        {message.isOwn && message._id === selectedconvo.lastMessage?._id && (
            <div className="flex justify-end mt-0.5 pr-1">
                {selectedconvo.type === 'direct' ? (
                    <span className={cn("text-[11px] px-1", lastMessageStatus === "seen" ? "text-primary" : "text-muted-foreground")}>
                        {lastMessageStatus === "seen" ? "Đã xem" : "Đã gửi"}
                    </span>
                ) : (
                    <div className="flex items-center -space-x-1">
                        {selectedconvo.seenBy && selectedconvo.seenBy
                            .filter(p => p._id !== user?._id) // Bỏ qua người gửi
                            .slice(0, 5) // Tối đa 5 avatar
                            .map((p, idx) => {
                                // Nếu ID trùng với ID của người tham gia, lấy avatar của người đó
                                const participant = selectedconvo.participants?.find(part => part._id === p._id);
                                return (
                                    <div key={p._id} className="w-4 h-4 rounded-full overflow-hidden border border-background z-10" style={{ zIndex: 10 - idx }}>
                                        {participant?.avatarUrl ? (
                                            <img src={participant.avatarUrl} alt={participant.displayName} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full bg-primary/20 flex items-center justify-center text-[8px] font-bold text-primary">
                                                {participant?.displayName?.[0]?.toUpperCase() || "?"}
                                            </div>
                                        )}
                                    </div>
                                );
                            })
                        }
                        {selectedconvo.seenBy && selectedconvo.seenBy.filter(p => p._id !== user?._id).length > 5 && (
                            <div className="w-4 h-4 rounded-full bg-muted flex items-center justify-center text-[8px] border border-background z-0">
                                +{selectedconvo.seenBy.filter(p => p._id !== user?._id).length - 5}
                            </div>
                        )}
                        {(!selectedconvo.seenBy || selectedconvo.seenBy.filter(p => p._id !== user?._id).length === 0) && (
                            <span className="text-[11px] px-1 text-muted-foreground">Đã gửi</span>
                        )}
                    </div>
                )}
            </div>
        )}
        </div>
        
    </div>
  )
}

export default MessageItem
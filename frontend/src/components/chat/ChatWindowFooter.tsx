import type { Conversation } from '@/types/chat';
import { ImagePlus, Send, Loader2, X, Reply } from 'lucide-react';
import { useState, useRef } from 'react'
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuthStore } from '@/stores/useAuthStore';
import EmoijPicker from './EmoijPicker';
import { useChatStore } from '@/stores/useChatStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { toast } from 'sonner';
import { chatService } from '@/Service/chatService';
import { getThemeGradient } from '@/lib/themes';

const ChatWindowFooter = ({seletedConvo}:{seletedConvo:Conversation}) => {
  const {user} = useAuthStore();
  const [value,setValue] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const {sendDirectMessage, sendGroupMessage, replyingToMessage, setReplyingToMessage} = useChatStore();
  const { emitTyping, emitStopTyping } = useSocketStore();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const isTypingRef = useRef(false);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  if(!user)return null;

  const handleTyping = () => {
    const recipientIds = seletedConvo.participants
      .filter((p) => p._id !== user._id)
      .map((p) => p._id);

    if (recipientIds.length === 0) return;

    if (!isTypingRef.current) {
      isTypingRef.current = true;
      emitTyping(seletedConvo._id, recipientIds);
    }

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    typingTimeoutRef.current = setTimeout(() => {
      isTypingRef.current = false;
      emitStopTyping(seletedConvo._id, recipientIds);
    }, 2000);
  };

  const handleStopTyping = () => {
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    if (isTypingRef.current) {
      isTypingRef.current = false;
      const recipientIds = seletedConvo.participants
        .filter((p) => p._id !== user._id)
        .map((p) => p._id);
      emitStopTyping(seletedConvo._id, recipientIds);
    }
  };

  const sendMessage = async(imgUrl?: string) =>{
    if(!value.trim() && !imgUrl) return;
    handleStopTyping();
    try {
      if(seletedConvo.type === 'direct'){
        const participants = seletedConvo.participants;
        const ortherUser = participants.filter((p)=>p._id!==user._id)[0];
        await sendDirectMessage(ortherUser._id, value, imgUrl);
      }
      else{
        await sendGroupMessage(seletedConvo._id, value, imgUrl);
      }
    } catch (error) {
      console.error(error);
      toast.error("lỗi xảy ra khi gửi tin nhắn . Bạn hãy thử lại !");
    }
    finally{
      setValue("");
    }
  }

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const imgUrl = await chatService.uploadImage(file);
      await sendMessage(imgUrl);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải ảnh lên!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value);
    handleTyping();
  };

  const handleKeyPress = (e:React.KeyboardEvent) =>{
    if(e.key === "Enter"){
      e.preventDefault();
      sendMessage();
    }
  } 

  return (
    <div className="flex flex-col bg-background">
      {/* Reply Banner */}
      {replyingToMessage && (
        <div className="flex items-center justify-between bg-muted/30 px-4 py-2 border-t border-border/50">
          <div className="flex items-center gap-2 overflow-hidden">
            <Reply className="size-4 text-primary shrink-0" />
            <div className="flex flex-col overflow-hidden">
              <span className="text-xs font-semibold text-primary">
                Đang trả lời {replyingToMessage.senderId === user._id ? "chính mình" : "tin nhắn"}
              </span>
              <span className="text-xs text-muted-foreground truncate">
                {replyingToMessage.isDeleted 
                  ? "Tin nhắn đã thu hồi"
                  : replyingToMessage.content || "Hình ảnh"}
              </span>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="size-6 shrink-0 hover:bg-muted"
            onClick={() => setReplyingToMessage(null)}
          >
            <X className="size-4 text-muted-foreground" />
          </Button>
        </div>
      )}

      {/* Input Row */}
      <div className='flex items-center gap-2 p-3 min-h-[56px]'>
        <input 
          type="file" 
          accept="image/*" 
          className="hidden" 
          ref={fileInputRef}
          onChange={handleImageUpload}
        />
        <Button 
          variant="ghost" 
          size="icon" 
          className="hover:bg-primary/10"
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading}
        >
          {isUploading ? <Loader2 className="size-4 animate-spin text-primary" /> : <ImagePlus className='size-4'/>}
        </Button>
        <div className='flex-1 relative'>
          <Input
          onKeyDown={handleKeyPress}
          value={value}
          onChange={handleInputChange}
          placeholder='Tin nhắn'
          className='pr-20 h-9 border-border/50 focus:border-primary/50 transition-smooth resize-none'
          />
          <div className='absolute right-2 top-1/2 transform -translate-y-1/2 flex items-center gap-1'>
          <Button
            asChild
            variant="ghost"
            className='size-8 hover:bg-primary/10 transition-smooth' 
          >
            <div><EmoijPicker onChange={(emoji:string)=>setValue(`${value}${emoji}`)}/></div>
          </Button>
          </div>
        </div>
        <Button 
          onClick={() => sendMessage()}
          className={`${getThemeGradient(seletedConvo.theme)} hover:shadow-glow transition-smooth hover:scale-105`} disabled={(!value.trim() && !isUploading) || isUploading}>
            <Send className='size-4 text-white '></Send>
        </Button>
      </div>
    </div>
  )
}

export default ChatWindowFooter
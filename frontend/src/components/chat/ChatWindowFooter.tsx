
import type { Conversation } from '@/types/chat';
import { ImagePlus, Send } from 'lucide-react';
import { useState } from 'react'
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { useAuthStore } from '@/stores/useAuthStore';
import EmoijPicker from './EmoijPicker';
import { useChatStore } from '@/stores/useChatStore';
import { toast } from 'sonner';

const ChatWindowFooter = ({seletedConvo}:{seletedConvo:Conversation}) => {
  const {user} = useAuthStore();
  const [value,setValue] = useState("");
  const {sendDirectMessage,sendGroupMessage} = useChatStore();
  if(!user)return;

  const sendMessage = async() =>{
    if(!value.trim())return;
    try {
      if(seletedConvo.type === 'direct'){
        const participants = seletedConvo.participants;
        
        const ortherUser = participants.filter((p)=>p._id!==user._id)[0];
        
        await sendDirectMessage(ortherUser._id,value);
      }
      else{
        await sendGroupMessage(seletedConvo._id,value);
      }
    } catch (error) {
      console.error(error);
      toast.error("lỗi xảy ra khi gửi tin nhắn . Bạn hãy thử lại !");

    }
    finally{
      setValue("");
    }
  }
  const handleKeyPress = (e:React.KeyboardEvent) =>{
    if(e.key === "Enter"){
      e.preventDefault();
      sendMessage();
    }
  } 
  return (
    <div className='flex items-center gap-2 p-3 min-h-[56px] bg-background'>
      <Button  variant= "ghost" size="icon" className="hover:bg-primary/10">
        <ImagePlus className='size-4'/>
      </Button>
      <div className='flex-1 relative'>
        <Input
        onKeyDown={handleKeyPress}
        value={value}
        onChange={(e)=>setValue(e.target.value)}
        placeholder='Tin nhắn'
        className='pr-20 h-9 bg-white border-border/50 focus:border-primary/50 transition-smooth resize-none'
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
        onClick={sendMessage}
      className='bg-gradient-chat hover:shadow-glow transition-smooth hover:scale-105' disabled={!value.trim()}>
          <Send className='size-4 text-white '></Send>
        </Button>
    </div>
  )
}

export default ChatWindowFooter
import type { Conversation } from '@/types/chat';
import { Paperclip, Send, Loader2, X, Reply, Mic, Square } from 'lucide-react';
import { useState, useRef, useEffect } from 'react'
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
  const typingTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [isRecording, setIsRecording] = useState(false);
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<BlobPart[]>([]);
  const durationIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

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

  const sendMessage = async(options?: {imgUrl?: string; fileUrl?: string; fileName?: string; fileSize?: number; fileType?: string; audioUrl?: string}) =>{
    if(!value.trim() && !options) return;
    handleStopTyping();
    try {
      if(seletedConvo.type === 'direct'){
        const participants = seletedConvo.participants;
        const ortherUser = participants.filter((p)=>p._id!==user._id)[0];
        await sendDirectMessage(ortherUser._id, value, options);
      }
      else{
        await sendGroupMessage(seletedConvo._id, value, options);
      }
    } catch (error) {
      console.error(error);
      toast.error("lỗi xảy ra khi gửi tin nhắn . Bạn hãy thử lại !");
    }
    finally{
      setValue("");
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      setIsUploading(true);
      const data = await chatService.uploadFile(file);
      await sendMessage(data);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi tải tệp lên!");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        setAudioBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
      setRecordingDuration(0);

      durationIntervalRef.current = setInterval(() => {
        setRecordingDuration((prev) => prev + 1);
      }, 1000);
    } catch (error) {
      console.error('Error accessing microphone:', error);
      toast.error('Không thể truy cập microphone');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      mediaRecorderRef.current.stream.getTracks().forEach(track => track.stop());
      setIsRecording(false);
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
    }
  };

  const cancelRecording = () => {
    setAudioBlob(null);
    setRecordingDuration(0);
    if (isRecording) {
      stopRecording();
    }
  };

  const sendAudioMessage = async () => {
    if (!audioBlob) return;
    try {
      setIsUploading(true);
      const file = new File([audioBlob], `voice-note-${Date.now()}.webm`, { type: 'audio/webm' });
      const data = await chatService.uploadFile(file);
      await sendMessage({...data, audioUrl: data.fileUrl});
      cancelRecording();
    } catch (error) {
      console.error('Error uploading audio:', error);
      toast.error('Lỗi khi gửi tin nhắn thoại');
    } finally {
      setIsUploading(false);
    }
  };

  useEffect(() => {
    return () => {
      if (durationIntervalRef.current) {
        clearInterval(durationIntervalRef.current);
      }
      if (mediaRecorderRef.current?.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
    };
  }, []);

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
        {!isRecording && !audioBlob && (
          <>
            <input 
              type="file" 
              className="hidden" 
              ref={fileInputRef}
              onChange={handleFileUpload}
            />
            <Button 
              variant="ghost" 
              size="icon" 
              className="hover:bg-primary/10 shrink-0"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              {isUploading ? <Loader2 className="size-4 animate-spin text-primary" /> : <Paperclip className='size-4'/>}
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
            
            {value.trim() ? (
              <Button 
                onClick={() => sendMessage()}
                className={`${getThemeGradient(seletedConvo.theme)} hover:shadow-glow transition-smooth hover:scale-105`} disabled={isUploading}>
                  <Send className='size-4 text-white '></Send>
              </Button>
            ) : (
              <Button 
                onClick={startRecording}
                variant="ghost"
                className={`hover:bg-primary/10 transition-smooth hover:scale-105`} disabled={isUploading}>
                  <Mic className='size-4 text-primary'></Mic>
              </Button>
            )}
          </>
        )}

        {isRecording && (
          <div className="flex-1 flex items-center justify-between bg-primary/5 rounded-full px-4 py-1.5 border border-primary/20">
            <div className="flex items-center gap-2">
              <div className="size-2.5 rounded-full bg-red-500 animate-pulse"></div>
              <span className="text-sm font-medium text-red-500">
                {Math.floor(recordingDuration / 60).toString().padStart(2, '0')}:
                {(recordingDuration % 60).toString().padStart(2, '0')}
              </span>
            </div>
            <Button variant="ghost" size="icon" onClick={stopRecording} className="text-primary hover:bg-primary/10 rounded-full h-8 w-8">
              <Square className="size-4 fill-current" />
            </Button>
          </div>
        )}

        {audioBlob && !isRecording && (
          <div className="flex-1 flex items-center justify-between bg-primary/5 rounded-full px-4 py-1.5 border border-primary/20">
            <div className="flex items-center gap-2">
              <audio controls src={URL.createObjectURL(audioBlob)} className="h-8 max-w-[200px]" />
            </div>
            <div className="flex items-center gap-1">
              <Button variant="ghost" size="icon" onClick={cancelRecording} className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 rounded-full h-8 w-8">
                <X className="size-4" />
              </Button>
              <Button 
                onClick={sendAudioMessage}
                disabled={isUploading}
                className={`rounded-full h-8 w-8 p-0 ${getThemeGradient(seletedConvo.theme)} hover:shadow-glow transition-smooth`}
              >
                {isUploading ? <Loader2 className="size-4 animate-spin text-white" /> : <Send className="size-3.5 text-white" />}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default ChatWindowFooter
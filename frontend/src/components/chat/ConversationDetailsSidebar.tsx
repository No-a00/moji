import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog"
import { useChatStore } from "@/stores/useChatStore"
import type { Conversation } from "@/types/chat"
import { Info, Image as ImageIcon, Users, Palette, Wallpaper, Upload, Loader2 } from "lucide-react"
import { Button } from "../ui/button"
import UserAvatar from "./UserAvatar"
import GroupChatAvatar from "./GroupChatAvatar"
import { useAuthStore } from "@/stores/useAuthStore"
import { CHAT_THEMES, WALLPAPERS } from "@/lib/themes"
import { useState, useRef } from "react"
import { chatService } from "@/Service/chatService"
import { toast } from "sonner"

interface ConversationDetailsProps {
  chat: Conversation
}

const ConversationDetailsSidebar = ({ chat }: ConversationDetailsProps) => {
  const { messages: allMessages, changeTheme, changeWallpaper } = useChatStore()
  const { user } = useAuthStore()
  const [isUploading, setIsUploading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)
  
  // Lấy danh sách tin nhắn của cuộc hội thoại này
  const messages = allMessages[chat._id]?.items || []
  
  // Lọc ra những tin nhắn có ảnh
  const mediaMessages = messages.filter(m => m.imgUrl)

  const isGroup = chat.type === "group"
  const otherUsers = isGroup ? chat.participants : chat.participants.filter(p => p._id !== user?._id)
  const displayName = isGroup ? chat.group?.name : otherUsers[0]?.displayName

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="ghost" size="icon" className="hover:bg-primary/10 ml-auto mr-2 rounded-full">
          <Info className="size-5 text-muted-foreground" />
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto beautiful-scrollbar">
        <SheetHeader className="pb-6 border-b p-0">
          <div className="flex flex-col items-center">
            {/* Cover Photo for Direct Chat */}
            {!isGroup && (
              <div className="w-full h-32 bg-muted relative">
                {otherUsers[0]?.coverUrl ? (
                  <img src={otherUsers[0].coverUrl} alt="Cover" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
                )}
              </div>
            )}
            
            <div className={`flex flex-col items-center gap-2 ${!isGroup ? '-mt-10' : 'mt-6'}`}>
              {isGroup ? (
                <GroupChatAvatar participants={chat.participants} type="chat" />
              ) : (
                <div className="rounded-full border-4 border-background overflow-hidden bg-background">
                  <UserAvatar 
                    type="profile" 
                    name={otherUsers[0]?.displayName || ""} 
                    avatarUrl={otherUsers[0]?.avatarUrl || undefined} 
                    className="w-20 h-20"
                  />
                </div>
              )}
              <SheetTitle className="text-xl mt-2">{displayName}</SheetTitle>
              {!isGroup && otherUsers[0]?.email && (
                <p className="text-sm text-muted-foreground">{otherUsers[0].email}</p>
              )}
              {!isGroup && otherUsers[0]?.bio && (
                <p className="text-sm mt-2 text-center px-4 italic">"{otherUsers[0].bio}"</p>
              )}
            </div>
          </div>
        </SheetHeader>

        <div className="py-6 space-y-6">
          {/* Members Section (Only for groups) */}
          {isGroup && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 font-semibold">
                <Users className="size-5" />
                <h3>Thành viên ({chat.participants.length})</h3>
              </div>
              <div className="space-y-3">
                {chat.participants.map(p => (
                  <div key={p._id} className="flex items-center gap-3">
                    <UserAvatar name={p.displayName} avatarUrl={p.avatarUrl || undefined} type="chat" />
                    <p className="text-sm font-medium">{p.displayName}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Media Section */}
          <div className="space-y-4">
            <div className="flex items-center gap-2 font-semibold">
              <ImageIcon className="size-5" />
              <h3>File phương tiện ({mediaMessages.length})</h3>
            </div>
            
            {mediaMessages.length === 0 ? (
              <p className="text-sm text-muted-foreground">Chưa có ảnh nào được gửi</p>
            ) : (
              <div className="grid grid-cols-3 gap-2">
                {mediaMessages.map(m => (
                  <Dialog key={m._id}>
                    <DialogTrigger asChild>
                      <div className="aspect-square rounded-md overflow-hidden bg-muted cursor-pointer hover:opacity-80 transition-opacity">
                        <img 
                          src={m.imgUrl || undefined} 
                          alt="Media" 
                          className="w-full h-full object-cover" 
                        />
                      </div>
                    </DialogTrigger>
                    <DialogContent className="max-w-4xl bg-transparent border-none shadow-none flex justify-center items-center">
                      <img 
                        src={m.imgUrl || undefined} 
                        alt="Media full" 
                        className="max-w-full max-h-[80vh] object-contain rounded-md" 
                      />
                    </DialogContent>
                  </Dialog>
                ))}
              </div>
            )}
          </div>

          {/* Theme Section */}
          <div className="space-y-4 pb-10">
            <div className="flex items-center gap-2 font-semibold">
              <Palette className="size-5" />
              <h3>Chủ đề cuộc trò chuyện</h3>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {CHAT_THEMES.map((theme) => (
                <div 
                  key={theme.id}
                  onClick={() => changeTheme(chat._id, theme.id)}
                  className={`flex flex-col items-center gap-1 cursor-pointer group`}
                >
                  <div 
                    className={`w-12 h-12 rounded-full transition-transform group-hover:scale-110 ${chat.theme === theme.id ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                    style={{ background: theme.colorHex }}
                  />
                  <span className={`text-xs ${chat.theme === theme.id ? 'font-semibold text-primary' : 'text-muted-foreground'}`}>
                    {theme.name}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Wallpaper Section */}
          <div className="space-y-4 pb-10">
            <div className="flex items-center gap-2 font-semibold">
              <Wallpaper className="size-5" />
              <h3>Hình nền cuộc trò chuyện</h3>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              {WALLPAPERS.map((wp) => (
                <div 
                  key={wp.id}
                  onClick={() => changeWallpaper(chat._id, wp.url)}
                  className={`relative aspect-video rounded-md overflow-hidden cursor-pointer group transition-all ${chat.wallpaper === wp.url ? 'ring-2 ring-primary ring-offset-2' : ''}`}
                >
                  {wp.url ? (
                    <img src={wp.url} alt={wp.name} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  ) : (
                    <div className="w-full h-full bg-muted flex items-center justify-center group-hover:bg-muted/80">
                      <span className="text-xs text-muted-foreground">{wp.name}</span>
                    </div>
                  )}
                  {chat.wallpaper === wp.url && wp.url !== '' && (
                    <div className="absolute inset-0 bg-black/20 flex items-end p-2">
                      <span className="text-white text-xs font-medium drop-shadow-md">{wp.name}</span>
                    </div>
                  )}
                </div>
              ))}
              
              {/* Upload Custom Wallpaper */}
              <div 
                onClick={() => !isUploading && fileInputRef.current?.click()}
                className="relative aspect-video rounded-md overflow-hidden cursor-pointer group border-2 border-dashed border-muted-foreground/30 hover:border-primary/50 flex flex-col items-center justify-center bg-muted/30 transition-all"
              >
                {isUploading ? (
                  <Loader2 className="size-6 text-primary animate-spin" />
                ) : (
                  <>
                    <Upload className="size-6 text-muted-foreground group-hover:text-primary transition-colors mb-1" />
                    <span className="text-xs text-muted-foreground group-hover:text-primary font-medium">Tải ảnh lên</span>
                  </>
                )}
                <input 
                  type="file" 
                  ref={fileInputRef} 
                  className="hidden" 
                  accept="image/*"
                  onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    try {
                      setIsUploading(true);
                      const data = await chatService.uploadFile(file);
                      if (data.imgUrl || data.fileUrl) {
                        await changeWallpaper(chat._id, data.imgUrl || data.fileUrl || "");
                      }
                      toast.success("Đã cập nhật hình nền");
                    } catch (error) {
                      toast.error("Lỗi khi tải ảnh lên");
                    } finally {
                      setIsUploading(false);
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }
                  }}
                />
              </div>
            </div>
          </div>

        </div>
      </SheetContent>
    </Sheet>
  )
}

export default ConversationDetailsSidebar

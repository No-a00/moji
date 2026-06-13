import { useState, useRef } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { useAuthStore } from "@/stores/useAuthStore"
import UserAvatar from "./UserAvatar"
import { Button } from "../ui/button"
import { Input } from "../ui/input"
import { Label } from "../ui/label"
import { Camera, Loader2, Save } from "lucide-react"
import { userService } from "@/Service/userService"
import { toast } from "sonner"

const ProfileModal = ({ children }: { children: React.ReactNode }) => {
  const { user, fetchMe } = useAuthStore()
  const [isOpen, setIsOpen] = useState(false)

  // States for editing
  const [displayName, setDisplayName] = useState(user?.displayName || "")
  const [avatarFile, setAvatarFile] = useState<File | null>(null)
  const [coverFile, setCoverFile] = useState<File | null>(null)
  
  // Preview URLs
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null)
  const [coverPreview, setCoverPreview] = useState<string | null>(null)

  const [isLoading, setIsLoading] = useState(false)

  const avatarInputRef = useRef<HTMLInputElement>(null)
  const coverInputRef = useRef<HTMLInputElement>(null)

  if (!user) return <>{children}</>;

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setAvatarFile(file);
      setAvatarPreview(URL.createObjectURL(file));
    }
  }

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      setCoverFile(file);
      setCoverPreview(URL.createObjectURL(file));
    }
  }

  const handleSave = async () => {
    if (!displayName.trim()) {
      toast.error("Tên hiển thị không được để trống");
      return;
    }
    
    try {
      setIsLoading(true);
      const formData = new FormData();
      formData.append("displayName", displayName);
      if (avatarFile) formData.append("avatar", avatarFile);
      if (coverFile) formData.append("cover", coverFile);

      await userService.updateProfile(formData);
      await fetchMe();
      
      toast.success("Cập nhật thông tin thành công!");
      setIsOpen(false);
    } catch (error) {
      console.error(error);
      toast.error("Lỗi khi cập nhật thông tin");
    } finally {
      setIsLoading(false);
    }
  }

  // When modal closes or opens, reset states to current user data
  const onOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      setDisplayName(user.displayName);
      setAvatarFile(null);
      setCoverFile(null);
      setAvatarPreview(null);
      setCoverPreview(null);
    }
  }

  const currentAvatar = avatarPreview || user.avatarUrl || user.avataUrl;
  const currentCover = coverPreview || user.coverUrl;

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogTrigger asChild>
        {children}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none shadow-xl">
        {/* Cover Photo */}
        <div className="relative h-40 w-full bg-muted">
          {currentCover ? (
            <img src={currentCover} alt="Cover" className="w-full h-full object-cover" />
          ) : (
            <div className="w-full h-full bg-gradient-to-r from-blue-400 to-purple-500" />
          )}
          <Button 
            variant="secondary" 
            size="icon" 
            className="absolute bottom-2 right-2 rounded-full h-8 w-8 opacity-80 hover:opacity-100"
            onClick={() => coverInputRef.current?.click()}
          >
            <Camera className="size-4" />
          </Button>
          <input 
            type="file" 
            ref={coverInputRef} 
            className="hidden" 
            accept="image/*" 
            onChange={handleCoverChange} 
          />
        </div>

        {/* Profile Info Section */}
        <div className="px-6 pb-6 pt-0 relative">
          {/* Avatar (overlapping cover) */}
          <div className="relative -mt-12 mb-4 w-fit">
            <div className="rounded-full border-4 border-background overflow-hidden relative group">
              <UserAvatar 
                name={displayName || user.displayName} 
                avatarUrl={currentAvatar} 
                type="profile" 
              />
              {/* Overlay edit button on hover */}
              <div 
                className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer"
                onClick={() => avatarInputRef.current?.click()}
              >
                <Camera className="size-6 text-white" />
              </div>
            </div>
            <input 
              type="file" 
              ref={avatarInputRef} 
              className="hidden" 
              accept="image/*" 
              onChange={handleAvatarChange} 
            />
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="displayName">Tên hiển thị</Label>
              <Input 
                id="displayName" 
                value={displayName} 
                onChange={(e) => setDisplayName(e.target.value)} 
                placeholder="Nhập tên của bạn"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Tên người dùng (Username)</Label>
              <Input value={user.username} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label>Email</Label>
              <Input value={user.email || user.eamil || ""} disabled className="bg-muted" />
            </div>

            <div className="pt-4 flex justify-end gap-2">
              <Button variant="outline" onClick={() => setIsOpen(false)}>Hủy</Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? <Loader2 className="size-4 animate-spin mr-2" /> : <Save className="size-4 mr-2" />}
                Lưu thay đổi
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default ProfileModal

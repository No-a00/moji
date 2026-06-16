import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useEffect, useState } from "react";
import { authService } from "@/Service/authService";
import type { User } from "@/types/user";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Mail, Phone, Calendar, Info } from "lucide-react";

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
}

export const UserProfileModal = ({ isOpen, onClose, userId }: UserProfileModalProps) => {
  const [profile, setProfile] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen && userId) {
      setLoading(true);
      authService.getUserProfile(userId)
        .then(data => setProfile(data))
        .catch(err => console.error(err))
        .finally(() => setLoading(false));
    }
  }, [isOpen, userId]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md bg-card/95 backdrop-blur-xl border-white/10 shadow-2xl p-0 overflow-hidden">
        {loading ? (
          <div className="h-64 flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : profile ? (
          <>
            <div className="h-32 bg-gradient-to-r from-primary/40 to-primary/10 relative">
              {profile.coverUrl && (
                <img src={profile.coverUrl} alt="Cover" className="w-full h-full object-cover" />
              )}
            </div>
            
            <div className="px-6 pb-6 pt-0 relative">
              <div className="flex justify-between items-end -mt-12 mb-4">
                <Avatar className="w-24 h-24 border-4 border-card bg-card shadow-xl">
                  <AvatarImage src={profile.avatarUrl || ""} className="object-cover" />
                  <AvatarFallback className="text-3xl bg-primary/10 text-primary">
                    {profile.displayName?.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
              </div>

              <div>
                <h2 className="text-2xl font-bold text-foreground">{profile.displayName}</h2>
                <p className="text-muted-foreground">@{profile.username}</p>
              </div>

              <div className="mt-6 space-y-4">
                {profile.bio && (
                  <div className="flex gap-3 text-sm">
                    <Info className="w-5 h-5 text-muted-foreground shrink-0" />
                    <p className="text-foreground/90">{profile.bio}</p>
                  </div>
                )}
                
                <div className="flex gap-3 text-sm items-center">
                  <Mail className="w-5 h-5 text-muted-foreground shrink-0" />
                  <p className="text-foreground/90">{profile.email}</p>
                </div>

                {profile.phone && (
                  <div className="flex gap-3 text-sm items-center">
                    <Phone className="w-5 h-5 text-muted-foreground shrink-0" />
                    <p className="text-foreground/90">{profile.phone}</p>
                  </div>
                )}

                {profile.createdAt && (
                  <div className="flex gap-3 text-sm items-center">
                    <Calendar className="w-5 h-5 text-muted-foreground shrink-0" />
                    <p className="text-foreground/90">
                      Tham gia: {new Intl.DateTimeFormat('vi-VN', { day: '2-digit', month: 'long', year: 'numeric' }).format(new Date(profile.createdAt))}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            Không tìm thấy thông tin
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default UserProfileModal;

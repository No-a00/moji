import { useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { authService } from "@/Service/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Lock, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ResetPasswordPage = () => {
  const { token } = useParams<{ token: string }>();
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) return toast.error("Vui lòng điền đủ thông tin");
    if (password !== confirmPassword) return toast.error("Mật khẩu không khớp");
    if (password.length < 6) return toast.error("Mật khẩu phải có ít nhất 6 ký tự");
    if (!token) return toast.error("Token không hợp lệ");
    
    setLoading(true);
    try {
      await authService.resetPassword(token, password);
      setSuccess(true);
      toast.success("Đặt lại mật khẩu thành công!");
      setTimeout(() => navigate("/signin"), 3000);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể đặt lại mật khẩu. Token có thể đã hết hạn.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Mật Khẩu Mới</h1>
          <p className="text-muted-foreground text-sm">
            Vui lòng nhập mật khẩu mới của bạn.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center space-y-4 py-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="font-medium">Đổi mật khẩu thành công!</p>
            <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
            <Button asChild className="w-full mt-4">
              <Link to="/signin">Đăng nhập ngay</Link>
            </Button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Mật khẩu mới</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium">Xác nhận mật khẩu</label>
              <div className="relative">
                <Lock className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  type="password"
                  placeholder="••••••••"
                  className="pl-10"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang lưu...
                </>
              ) : (
                "Đổi mật khẩu"
              )}
            </Button>
          </form>
        )}

        <div className="text-center">
          <Link to="/signin" className="text-sm text-primary hover:underline flex items-center justify-center gap-2">
            <ArrowLeft className="w-4 h-4" /> Quay lại đăng nhập
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ResetPasswordPage;

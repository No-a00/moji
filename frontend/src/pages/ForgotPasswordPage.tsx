import { useState } from "react";
import { Link } from "react-router";
import { authService } from "@/Service/authService";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error("Vui lòng nhập email");
    
    setLoading(true);
    try {
      await authService.forgotPassword(email);
      setSuccess(true);
      toast.success("Đã gửi link khôi phục mật khẩu. Vui lòng kiểm tra email.");
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Không thể gửi yêu cầu");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-2xl font-bold tracking-tight">Quên Mật Khẩu</h1>
          <p className="text-muted-foreground text-sm">
            Nhập email của bạn để nhận link đặt lại mật khẩu.
          </p>
        </div>

        {success ? (
          <div className="flex flex-col items-center space-y-4 py-4 text-center">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <p className="font-medium">Vui lòng kiểm tra hộp thư đến (hoặc thư mục Spam) của bạn.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  className="pl-10"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={loading}
                />
              </div>
            </div>
            <Button className="w-full" type="submit" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Đang gửi...
                </>
              ) : (
                "Gửi link đặt lại mật khẩu"
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

export default ForgotPasswordPage;

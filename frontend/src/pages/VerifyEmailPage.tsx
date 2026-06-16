import { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router";
import { authService } from "@/Service/authService";
import { Button } from "@/components/ui/button";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

const VerifyEmailPage = () => {
  const { token } = useParams<{ token: string }>();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const verifyEmail = async () => {
      if (!token) {
        setStatus("error");
        setMessage("Token không hợp lệ.");
        return;
      }
      try {
        const res = await authService.verifyEmail(token);
        setStatus("success");
        setMessage(res.message || "Xác thực email thành công! Bạn có thể đăng nhập ngay bây giờ.");
        setTimeout(() => navigate("/signin"), 3000);
      } catch (error: any) {
        setStatus("error");
        setMessage(error.response?.data?.message || "Xác thực thất bại. Link có thể đã hết hạn.");
      }
    };
    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-50 dark:bg-zinc-900 p-4">
      <div className="max-w-md w-full bg-white dark:bg-zinc-950 p-8 rounded-2xl shadow-lg text-center space-y-6">
        {status === "loading" && (
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="w-16 h-16 text-primary animate-spin" />
            <h2 className="text-xl font-semibold">Đang xác thực...</h2>
            <p className="text-muted-foreground">Vui lòng chờ trong giây lát.</p>
          </div>
        )}

        {status === "success" && (
          <div className="flex flex-col items-center space-y-4">
            <CheckCircle2 className="w-16 h-16 text-green-500" />
            <h2 className="text-xl font-semibold text-green-600">Thành công!</h2>
            <p className="text-muted-foreground">{message}</p>
            <p className="text-sm text-muted-foreground">Đang chuyển hướng về trang đăng nhập...</p>
            <Button asChild className="w-full mt-4">
              <Link to="/signin">Đăng nhập ngay</Link>
            </Button>
          </div>
        )}

        {status === "error" && (
          <div className="flex flex-col items-center space-y-4">
            <XCircle className="w-16 h-16 text-destructive" />
            <h2 className="text-xl font-semibold text-destructive">Lỗi xác thực</h2>
            <p className="text-muted-foreground">{message}</p>
            <Button asChild className="w-full mt-4">
              <Link to="/signin">Về trang đăng nhập</Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VerifyEmailPage;

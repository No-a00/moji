import { BrowserRouter, Routes, Route } from "react-router";
import {Toaster} from 'sonner'

import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
import VerifyEmailPage from "./pages/VerifyEmailPage";
import ForgotPasswordPage from "./pages/ForgotPasswordPage";
import ResetPasswordPage from "./pages/ResetPasswordPage";
import ChatAppPages from "./pages/ChatAppPages";
import ProtectRoute from "./components/auth/ProtectRoute";
import { useThemeStore } from "./stores/useThemeStore";
import { useEffect } from "react";

function App() {
  const {isDark,setTheme} = useThemeStore();
  useEffect(()=>{
    setTheme(isDark);
    
  },[isDark]);
  return (
    <>
    <Toaster richColors/> 
      <BrowserRouter>

        <Routes>
          {/* public routes */}
          <Route path="/signin" element={<SignInPage />} />
          <Route path="/signup" element={<SignUpPage />} />
          <Route path="/verify-email/:token" element={<VerifyEmailPage />} />
          <Route path="/forgot-password" element={<ForgotPasswordPage />} />
          <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          {/* protectect routes */}
          {/* todo:tạo protected route */}
          <Route element={<ProtectRoute />}>
          <Route path="/" element={<ChatAppPages />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </>
  );
}

export default App;

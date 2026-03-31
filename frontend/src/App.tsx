import { BrowserRouter, Routes, Route } from "react-router";
import {Toaster} from 'sonner'

import SignInPage from "./pages/SignInPage";
import SignUpPage from "./pages/SignUpPage";
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

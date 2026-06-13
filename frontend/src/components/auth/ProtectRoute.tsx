import { useAuthStore } from '@/stores/useAuthStore';
import { useSocketStore } from '@/stores/useSocketStore';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';

const ProtectRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const { connectSocket, disconnectSocket } = useSocketStore();
  const [startup, setStartup] = useState(true);

  const init = async () => {
    if (!accessToken) {
      await refresh();
    }
    if (accessToken && !user) {
      await fetchMe();
    }
    setStartup(false);
  };

  useEffect(() => {
    init();
  }, []);

  // Kết nối socket khi đã đăng nhập và lấy xong thông tin user
  useEffect(() => {
    if (accessToken && user) {
      connectSocket();
      import('@/stores/useChatStore').then(({ useChatStore }) => {
        useChatStore.getState().fetchConversations();
      });
    }
    return () => {
      disconnectSocket();
    };
  }, [accessToken, user, connectSocket, disconnectSocket]);

  if (loading || startup) {
    return (
      <div className='flex justify-center items-center h-screen text-xl font-semibold'>
        Đang tải trang...
      </div>
    );
  }

  if (!accessToken) {
    return <Navigate to="/signin" replace />;
  }

  return <Outlet />;
};

export default ProtectRoute;

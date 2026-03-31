import { useAuthStore } from '@/stores/useAuthStore';
import { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router';

const ProtectRoute = () => {
  const { accessToken, user, loading, refresh, fetchMe } = useAuthStore();
  const [startup, setStartup] = useState(true);

  const init = async () => {
    // có thể xảy ra khi refresh trang
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

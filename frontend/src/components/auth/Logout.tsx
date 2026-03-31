import { useAuthStore } from '@/stores/useAuthStore';
import { useNavigate } from 'react-router';

import { Button } from '../ui/button';
import { LogOut } from 'lucide-react';

const Logout = () => {
    const { signOut } = useAuthStore();
    const navigate = useNavigate();
    const hanleLogout = async () => {
        try {
            await signOut();
            navigate('/signin');

        } catch (error) {
            console.error( error);
        }

    }


  return (
    <Button variant="completeGhost" onClick={hanleLogout}>
        <LogOut className='text-destructive'/>
        Log out
    </Button>
  )
}

export default Logout;
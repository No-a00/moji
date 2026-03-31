import {create} from 'zustand'
import { toast } from 'sonner'
import { authService } from '@/Service/authService';
import type { AuthState } from '@/types/store';
import {persist} from "zustand/middleware"
import api from '@/lib/axios';
import { useChatStore } from './useChatStore';



export const useAuthStore = create<AuthState>()(
    persist((set,get)=>({
    accessToken:null,
    user:null,
    loading:false,

    signUp: async (username,password,email,firstname,lastname) => {
        try {
            set({loading:true});

            //gọi api
            await authService.signUp(username,password,email,firstname,lastname);

            toast.success("Đăng kí thành công!Bạn sẽ được chuyển sang trang đăng nhập.")
        } catch (error) {
            console.error(error);
            toast.error('Đăng kí không thành công');
        }
    },
    signIn:async(username,password)=>{
        try {
            set({loading:true});
            localStorage.clear();
            useChatStore.getState().reset();
            const {accessToken} = await authService.signIn(username,password);
            
            get().setAccessToken(accessToken);

            get().fetchMe();
            useChatStore.getState().fetchConversations();

            toast.success("chào mừng bạn quaym lại Moji 🎉")            
        } catch (error) {
            console.error(error);
            toast.error('Đăng nhập không thành công!')
        }finally{
            set({loading:false});
        }
    },
    signOut: async () =>{
        try {
            get().clearState();
            await authService.signOut();
            toast.success("Đăng xuất thành công!");
        } catch (error) {
            console.error(error);
            toast.error('Đăng xuất không thành công!');
        }

    },
    clearState: () => {
    set({
      accessToken: null,
      user: null,
      loading: false,
    });
    localStorage.clear()
     useChatStore.getState().reset();
  },
  fetchMe: async () => {
    try {
         
        set({loading:true});
        const user = await authService.fetchMe();
        set({ user });
    } catch (error) {
        console.log("Fetching:", `${api.defaults.baseURL}/auth/me`);
        console.error(error);
        set({ user: null ,accessToken:null});
        toast.error('lỗi khi lấy thông tin người dùng.Hãy thử lại!');
    } finally{
        set({loading:false});
    }

  },
  refresh: async () => {
    try {
        set({loading:true});
        const {user,fetchMe,setAccessToken} = get();

        const accessToken = await authService.refresh();

        setAccessToken(accessToken);

        if(!user){
         await fetchMe();   
        }
    } catch (error) {
        console.error(error);
        toast.error('làm mới phiên không thành công.Vui lòng đăng nhập lại!');
        get().clearState();
    } finally {
        set({loading:false});
    }
  },
    setAccessToken: (accessToken) => {
        set({accessToken});
    }

}),{
    name:'auth-storage',
    partialize:(state)=>({user:state.user})
})
)
import api from "@/lib/axios";

export const authService = {
  signUp: async (
    username: string,
    password: string,
    email: string,
    firstname: string,
    lastname: string
  ) => {
    const res = await api.post(
      "/auth/signup",
      { username, password, email, firstName: firstname, lastName: lastname },
      { withCredentials: true }
    );
    return res.data;
  },
  signIn:async (username:string,password:string)=>{
    const res = await api.post("auth/signin",{username,password},{withCredentials:true});
    return res.data;
  },
  signOut: async () =>{
    return api.post("auth/signout",{},{withCredentials:true});
  },
  fetchMe: async () =>{
    const res = await api.get("users/me",{withCredentials:true});
    return res.data.user;
  },
  refresh: async () =>{
    const res = await api.post("auth/refresh", { withCredentials: true });
    return res.data.accessToken;
  },
  getUserProfile: async (id: string) => {
    const res = await api.get(`users/profile/${id}`);
    return res.data.user;
  },
  blockUser: async (id: string) => {
    const res = await api.put(`users/block/${id}`);
    return res.data;
  },
  verifyEmail: async (token: string) => {
    const res = await api.post("auth/verify-email", { token });
    return res.data;
  },
  forgotPassword: async (email: string) => {
    const res = await api.post("auth/forgot-password", { email });
    return res.data;
  },
  resetPassword: async (token: string, password: string) => {
    const res = await api.post("auth/reset-password", { token, password });
    return res.data;
  }
};

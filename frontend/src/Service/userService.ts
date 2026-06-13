import api from "@/lib/axios";

export const userService = {
  // Tìm kiếm người dùng
  async searchUsers(query: string) {
    const res = await api.get(`/users/search?q=${encodeURIComponent(query)}`);
    return res.data.users;
  },

  // Gửi yêu cầu kết bạn
  async sendFriendRequest(toUserId: string, message: string = "") {
    const res = await api.post("/friend/request", { to: toUserId, message });
    return res.data;
  },

  // Lấy danh sách yêu cầu kết bạn (gồm cả gửi đi và nhận được)
  async getFriendRequests() {
    const res = await api.get("/friend/request");
    return res.data; // { sent: [...], received: [...] }
  },

  // Đồng ý lời mời kết bạn
  async acceptFriendRequest(requestId: string) {
    const res = await api.post(`/friend/request/${requestId}/accept`);
    return res.data;
  },

  // Từ chối lời mời kết bạn
  async declineFriendRequest(requestId: string) {
    const res = await api.post(`/friend/request/${requestId}/decline`);
    return res.data;
  },

  // Lấy tất cả bạn bè
  async getAllFriends() {
    const res = await api.get("/friend");
    return res.data.friends;
  },

  // Cập nhật thông tin tài khoản (avatar, cover, displayName)
  async updateProfile(formData: FormData) {
    const res = await api.put("/users/profile", formData, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return res.data;
  }
};

import api from "@/lib/axios";
import type { ConversationResponse,Message } from "@/types/chat";

interface FetchMessageProps{
    messages:Message[];
    cursor?:string;
}

const pageLimit = 50;

export const chatService = {
    async fetchConversations(): Promise<ConversationResponse> {
        const res = await api.get("/conversations");
        console.log("✅ API DONE. Data:", res.data);
        return res.data;
    },
    async fetchMessages(id:string,cursor?:string):Promise<FetchMessageProps>{
       
        const res = await api.get(`/conversations/${id}/messages?limit=${pageLimit}&cursor=${cursor}`);      
        console.log("✅ fecthMessage :",res.data.message );
        console.log("✅ fecthNextCursor :",res.data.nextCursor);
        return {messages:res.data.message,cursor:res.data.nextCursor}
    },
    async sendDirectMessage(recipientId:string,content:string="", options?: {imgUrl?:string; fileUrl?:string; fileName?:string; fileSize?:number; fileType?:string; audioUrl?:string; conversationId?:string}, replyTo?:string){
        const res = await api.post("/messages/direct",{
            recipientId,content,...options, replyTo
        })
        console.log("✅ API DONE. Data.mess direct:", res.data.message);
        return res.data.message;
    }, 
    async sendGroupMessage(conversationId:string,content:string="",options?: {imgUrl?:string; fileUrl?:string; fileName?:string; fileSize?:number; fileType?:string; audioUrl?:string}, replyTo?:string){
        const res = await api.post("/messages/group",{
            conversationId,content,...options, replyTo

        })
        console.log("✅ API DONE. Data.mess:", res.data.message);
        return res.data.message; 

    },
    async markAsSeen(conversationId: string) {
        const res = await api.post(`/conversations/${conversationId}/seen`);
        return res.data;
    },
    async changeTheme(conversationId: string, theme: string) {
        const res = await api.put(`/conversations/${conversationId}/theme`, { theme });
        return res.data;
    },
    async changeWallpaper(conversationId: string, wallpaper: string) {
        const res = await api.put(`/conversations/${conversationId}/wallpaper`, { wallpaper });
        return res.data;
    },
    async togglePinMessage(conversationId: string, messageId: string) {
        const res = await api.post(`/conversations/${conversationId}/pin`, { messageId });
        return res.data;
    },
    async createConversation(type: "direct" | "group", memberIds: string[], name?: string) {
        const res = await api.post("/conversations", { type, memberIds, name });
        return res.data;
    },
    async uploadFile(file: File): Promise<{fileUrl?: string; imgUrl?: string; fileName?: string; fileSize?: number; fileType?: string}> {
        const formData = new FormData();
        formData.append("file", file); // Tên field bên backend đã đổi thành 'file'
        const res = await api.post("/messages/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        
        // Nếu backend trả về fileUrl nhưng file là ảnh, gán vào imgUrl để tương thích
        if (file.type.startsWith("image/")) {
            return {
                imgUrl: res.data.fileUrl,
            }
        }
        
        return res.data;
    },
    async unsendMessage(messageId: string) {
        const res = await api.delete(`/messages/${messageId}/unsend`);
        return res.data;
    },
    async editMessage(messageId: string, content: string) {
        const res = await api.put(`/messages/${messageId}/edit`, { content });
        return res.data;
    },
    async reactToMessage(messageId: string, emoji: string) {
        const res = await api.post(`/messages/${messageId}/react`, { emoji });
        return res.data;
    },
    async markAsUnread(conversationId: string) {
        const res = await api.put(`/conversations/${conversationId}/unread`);
        return res.data;
    },
    async toggleMute(conversationId: string) {
        const res = await api.put(`/conversations/${conversationId}/mute`);
        return res.data;
    },
    async toggleArchive(conversationId: string) {
        const res = await api.put(`/conversations/${conversationId}/archive`);
        return res.data;
    },
    async pinConversation(conversationId: string) {
        const res = await api.put(`/conversations/${conversationId}/pin-chat`);
        return res.data;
    }
}

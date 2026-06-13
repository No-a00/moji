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
    async sendDirectMessage(recipientId:string,content:string="", imgUrl?:string ,conversationId?:string, replyTo?:string){
        const res = await api.post("/messages/direct",{
            recipientId,content,imgUrl,conversationId, replyTo
        })
        console.log("✅ API DONE. Data.mess direct:", res.data.message);
        return res.data.message;
    }, 
    async sendGroupMessage(conversationId:string,content:string="",imgUrl?:string, replyTo?:string){
        const res = await api.post("/messages/group",{
            conversationId,content,imgUrl, replyTo

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
    async createConversation(type: "direct" | "group", memberIds: string[], name?: string) {
        const res = await api.post("/conversations", { type, memberIds, name });
        return res.data;
    },
    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append("image", file);
        const res = await api.post("/messages/upload", formData, {
            headers: {
                "Content-Type": "multipart/form-data",
            },
        });
        return res.data.imgUrl;
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
    }
}


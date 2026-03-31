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
    async sendDirectMessage(recipientId:string,content:string="", imgUrl?:string ,conversationId?:string ){
        const res = await api.post("/messages/direct",{
            recipientId,content,imgUrl,conversationId
        })
        console.log("✅ API DONE. Data.mess direct:", res.data.message);
        return res.data.message;
    }, 
    async sendGroupMessage(conversationId:string,content:string="",imgUrl?:string){
        const res = await api.post("/message/group",{
            conversationId,content,imgUrl

        })
        console.log("✅ API DONE. Data.mess:", res.data.message);
        return res.data.message; 

    }

}


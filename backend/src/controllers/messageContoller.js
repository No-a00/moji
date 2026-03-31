import Message from '../model/Message.js'
import Conversation from '../model/Conversation.js'
import {updateConversationAfterCreateMessage} from '../utils/messageHelper.js'
export const sendDicrectMessage = async (req,res)=>{
    try {
       const  {recipientId,content,conversationId} = req.body;
       const senderId = req.user._id;
       let conversation;
        if(!content){
            return res.status(400).json({message:'thiếu nội dung'});
        }
        if(conversationId){
            conversation = await Conversation.findById(conversationId); 
            
        }
        if(!conversation){
            conversation = await Conversation.create({
                type:'direct',
                participants:[
                    {userId:senderId,joineAt: new Date()},
                    {userId:recipientId,joineAt: new Date()}
                ],   
            
                lastMessage: new Date(),
                unreadCount:new Map()
            })
        }
        const message = await Message.create({
            conversationId:conversation._id,
            senderId,
            content
        });
        updateConversationAfterCreateMessage(conversation,message,senderId);
        await conversation.save();
        return res.status(201).json({message});

    } catch (error) {
        console.error("lỗi xảy ra khi gửi tin nhắn trực tiếp",error);
        return res.status(500).json({message:'lỗi hệ thống'});
    }

}
export const sendGroupMessage = async (req,res)=>{
    try {
        const {conversationId,content} = req.body;
        const senderId = req.user._id;
        const conversation = req.conversation;
        if(!content){
            return res.status(400).json({message:'thiếu nội dung'});

        }
        const message = await Message.create({
            conversationId,
            senderId,
            content,
        });
        updateConversationAfterCreateMessage(conversation,message,senderId);
        await conversation.save();
        return res.status(201).json({message});
    } catch (error) {
        console.error('lỗi khi gửi tin nhắn nhóm',error);
        return res.status(500).json({message:'lỗi hệ thống'})        
    }
}
import Message from '../model/Message.js'
import Conversation from '../model/Conversation.js'
import {updateConversationAfterCreateMessage} from '../utils/messageHelper.js'

export const sendDicrectMessage = async (req,res)=>{
    try {
       const  {recipientId,content,imgUrl,conversationId,replyTo} = req.body;
       const senderId = req.user._id;
       let conversation;
        if(!content && !imgUrl){
            return res.status(400).json({message:'thiếu nội dung'});
        }
        if(conversationId){
            conversation = await Conversation.findById(conversationId); 
            
        }
        if(!conversation){
            conversation = await Conversation.create({
                type:'direct',
                participant:[
                    {userId:senderId,joineAt: new Date()},
                    {userId:recipientId,joineAt: new Date()}
                ],   
            
                lastMessageAt: new Date(),
                unreadCount:new Map()
            })
        }
        const messagePayload = {
            conversationId:conversation._id,
            senderId,
            content,
            imgUrl
        };
        if (replyTo) {
            messagePayload.replyTo = replyTo;
        }

        let message = await Message.create(messagePayload);
        
        // Populate replyTo immediately so realtime events have the full object
        if (replyTo) {
            message = await message.populate('replyTo', 'content imgUrl senderId isDeleted');
        }
        updateConversationAfterCreateMessage(conversation,message,senderId);
        await conversation.save();

        // Gửi tin nhắn qua socket thời gian thực cho các thành viên
        try {
            const { emitToUser } = await import("../libs/socket.js");
            conversation.participant.forEach(p => {
                emitToUser(p.userId, "newMessage", message);
                emitToUser(p.userId, "conversationUpdated", {
                    conversationId: conversation._id,
                    lastMessage: message,
                    unreadCount: Object.fromEntries(conversation.unreadCount || new Map()),
                    seenBy: conversation.seenBy
                });
            });
        } catch (socketErr) {
            console.error("Lỗi phát socket trong sendDirectMessage:", socketErr);
        }

        return res.status(201).json({message});

    } catch (error) {
        console.error("lỗi xảy ra khi gửi tin nhắn trực tiếp",error);
        return res.status(500).json({message:'lỗi hệ thống'});
    }

}

export const sendGroupMessage = async (req,res)=>{
    try {
        const {conversationId,content,imgUrl,replyTo} = req.body;
        const senderId = req.user._id;
        const conversation = req.conversation;
        if(!content && !imgUrl){
            return res.status(400).json({message:'thiếu nội dung'});

        }
        
        const messagePayload = {
            conversationId,
            senderId,
            content,
            imgUrl
        };
        if (replyTo) {
            messagePayload.replyTo = replyTo;
        }

        let message = await Message.create(messagePayload);
        
        // Populate replyTo immediately so realtime events have the full object
        if (replyTo) {
            message = await message.populate('replyTo', 'content imgUrl senderId isDeleted');
        }
        updateConversationAfterCreateMessage(conversation,message,senderId);
        await conversation.save();

        // Gửi tin nhắn qua socket thời gian thực cho các thành viên
        try {
            const { emitToUser } = await import("../libs/socket.js");
            conversation.participant.forEach(p => {
                emitToUser(p.userId, "newMessage", message);
                emitToUser(p.userId, "conversationUpdated", {
                    conversationId: conversation._id,
                    lastMessage: message,
                    unreadCount: Object.fromEntries(conversation.unreadCount || new Map()),
                    seenBy: conversation.seenBy
                });
            });
        } catch (socketErr) {
            console.error("Lỗi phát socket trong sendGroupMessage:", socketErr);
        }

        return res.status(201).json({message});
    } catch (error) {
        console.error('lỗi khi gửi tin nhắn nhóm',error);
        return res.status(500).json({message:'lỗi hệ thống'})        
    }
}

export const unsendMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền thu hồi tin nhắn này' });
        }

        // Đánh dấu là đã xóa
        message.isDeleted = true;
        message.content = "Tin nhắn đã bị thu hồi";
        message.imgUrl = null;
        await message.save();

        // Gửi socket event
        try {
            const conversation = await Conversation.findById(message.conversationId);
            if (conversation) {
                const { emitToUser } = await import("../libs/socket.js");
                
                let isLastMessage = false;
                // Cập nhật lại conversation nếu đây là tin nhắn cuối cùng
                if (conversation.lastMessage && conversation.lastMessage._id.toString() === message._id.toString()) {
                    conversation.lastMessage.content = message.content;
                    conversation.lastMessage.hasImage = false;
                    await conversation.save();
                    isLastMessage = true;
                }

                conversation.participant.forEach(p => {
                    emitToUser(p.userId, "messageUpdated", message);
                    
                    if (isLastMessage) {
                        emitToUser(p.userId, "conversationUpdated", {
                            conversationId: conversation._id,
                            lastMessage: conversation.lastMessage,
                            unreadCount: Object.fromEntries(conversation.unreadCount || new Map())
                        });
                    }
                });
            }
        } catch (socketErr) {
            console.error("Lỗi phát socket trong unsendMessage:", socketErr);
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi thu hồi tin nhắn:", error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

export const editMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;
        const userId = req.user._id;

        if (!content) {
            return res.status(400).json({ message: 'Nội dung không được để trống' });
        }

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
        }

        if (message.senderId.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'Bạn không có quyền sửa tin nhắn này' });
        }

        if (message.isDeleted) {
            return res.status(400).json({ message: 'Không thể sửa tin nhắn đã thu hồi' });
        }

        message.content = content;
        message.isEdited = true;
        await message.save();

        // Gửi socket event
        try {
            const conversation = await Conversation.findById(message.conversationId);
            if (conversation) {
                const { emitToUser } = await import("../libs/socket.js");
                
                let isLastMessage = false;
                // Nếu là tin nhắn cuối cùng, update lại
                if (conversation.lastMessage && conversation.lastMessage._id.toString() === message._id.toString()) {
                    conversation.lastMessage.content = message.content;
                    await conversation.save();
                    isLastMessage = true;
                }

                conversation.participant.forEach(p => {
                    emitToUser(p.userId, "messageUpdated", message);
                    
                    if (isLastMessage) {
                        emitToUser(p.userId, "conversationUpdated", {
                            conversationId: conversation._id,
                            lastMessage: conversation.lastMessage,
                            unreadCount: Object.fromEntries(conversation.unreadCount || new Map())
                        });
                    }
                });
            }
        } catch (socketErr) {
            console.error("Lỗi phát socket trong editMessage:", socketErr);
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi sửa tin nhắn:", error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

export const reactToMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { emoji } = req.body;
        const userId = req.user._id;

        const message = await Message.findById(id);
        if (!message) {
            return res.status(404).json({ message: 'Không tìm thấy tin nhắn' });
        }

        if (message.isDeleted) {
            return res.status(400).json({ message: 'Không thể thả cảm xúc vào tin nhắn đã thu hồi' });
        }

        // Kiểm tra xem user đã thả cảm xúc này chưa, nếu có rồi thì xóa (toggle), nếu chưa thì thêm/đổi
        const existingReactionIndex = message.reactions.findIndex(r => r.userId.toString() === userId.toString());
        
        if (existingReactionIndex !== -1) {
            if (message.reactions[existingReactionIndex].emoji === emoji) {
                // Xóa cảm xúc nếu click lại icon cũ
                message.reactions.splice(existingReactionIndex, 1);
            } else {
                // Thay đổi cảm xúc mới
                message.reactions[existingReactionIndex].emoji = emoji;
            }
        } else {
            // Thêm mới cảm xúc
            message.reactions.push({ emoji, userId });
        }

        await message.save();

        // Gửi socket event
        try {
            const conversation = await Conversation.findById(message.conversationId);
            if (conversation) {
                const { emitToUser } = await import("../libs/socket.js");
                conversation.participant.forEach(p => {
                    emitToUser(p.userId, "messageUpdated", message);
                });
            }
        } catch (socketErr) {
            console.error("Lỗi phát socket trong reactToMessage:", socketErr);
        }

        return res.status(200).json({ message });
    } catch (error) {
        console.error("Lỗi khi thả cảm xúc:", error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
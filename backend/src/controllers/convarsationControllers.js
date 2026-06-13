import Conversation from "../model/Conversation.js"
import Message from '../model/Message.js'


export const createConversation = async (req,res)=>{
    try {
        const {type,name,memberIds} = req.body;
        const userId  = req.user._id;           

        if(!type||(type==='group'&&!name )||!memberIds||!Array.isArray(memberIds)||memberIds.length==0){
            return res.status(400).json({message:'tên nhóm và danh sách thành viên là bắt buộc'})
        }

        let conversation;
        if(type==='direct'){
            const participantId = memberIds[0];

            conversation = await Conversation.findOne({type:'direct',
                'participant.userId':{$all:[userId,participantId]}
            })
            if(!conversation){
                conversation = new Conversation({
                    type:'direct',
                    participant:[{userId},{userId:participantId}],
                    lastMessageAt: new Date()
                })
            }
            await conversation.save();
        };
        if(type==='group'){
            conversation = new Conversation({
                type:'group',
                participant:[
                    {userId},
                    ...memberIds.map((id)=>({userId:id}))
                ],
                group:{
                    name,
                    createdBy:userId
                },
                lastMessageAt:new Date()
            })
            await conversation.save();
        }
        if(!conversation){
            return res.status(400).json({message:'Conversation type không hợp lệ'});
        }
        await conversation.populate([
            {path:'participant.userId',select:'displayName avatarUrl coverUrl bio email'},
            {
                path:'seenBy',select:'displayName avatarUrl'

            },
            {
                path:'lastMessage.senderId',select:'displayName avatarUrl'
            },
        ]);

        const convoObj = conversation.toObject();
        const participants = (convoObj.participant || []).map((p) => {
            const userObj = p.userId || {}; 
            return {
                _id: userObj._id || userObj,    
                displayName: userObj.displayName || "Lỗi tên", 
                avatarUrl: userObj.avatarUrl ?? null,
                coverUrl: userObj.coverUrl ?? null,
                bio: userObj.bio ?? null,
                email: userObj.email ?? null,
                joinedAt: p.joineAt
            };
        });

        const formattedConversation = {
            ...convoObj,
            unreadCount: convoObj.unreadCount || {},
            participants,
        };

        return res.status(201).json({ conversation: formattedConversation });
    } catch (error) {
        console.error('lỗi khi tạo conversation',error);
        return res.status(500).json({message:'lỗi hệ thống'});
        
    }
}
export const getConversation = async (req, res) => {
    try {
        const userId = req.user._id;
        
        // 1. Thêm .lean() vào cuối chuỗi query
        const conversation = await Conversation.find({
            "participant.userId": userId
        })
        .sort({ lastMessageAt: -1, updateAt: -1 })
        .populate({
            path: 'participant.userId',
            select: 'displayName avatarUrl coverUrl bio email' // 🚨 ĐẢM BẢO BẢNG USER CÓ ĐÚNG TRƯỜNG NÀY
        })
        .populate({
            path: 'lastMessage.senderId',
            select: 'displayName avatarUrl'
        })
        .populate({
            path: 'seenBy',
            select: 'displayName avatarUrl'
        })
        .lean(); // <--- VŨ KHÍ BÍ MẬT NẰM Ở ĐÂY

        // 2. In ra console để xem Mongoose có lấy được tên không
        // console.log("Dữ liệu thô từ DB: ", JSON.stringify(conversation[0]?.participant, null, 2));

        // 3. Map lại dữ liệu
        const formatted = conversation.map((convo) => {
            const participants = (convo.participant || []).map((p) => {
                // Do đã dùng .lean() nên p.userId giờ là 1 object thuần
                const userObj = p.userId || {}; 
                
                return {
                    // Ưu tiên lấy _id từ object đã populate, nếu hỏng thì lấy ID thô
                    _id: userObj._id || userObj,    
                    
                    // Thêm fallback "Lỗi tên" để nhìn UI là biết ngay bị xịt populate
                    displayName: userObj.displayName || "Lỗi tên", 
                    
                    avatarUrl: userObj.avatarUrl ?? null,
                    coverUrl: userObj.coverUrl ?? null,
                    bio: userObj.bio ?? null,
                    email: userObj.email ?? null,
                    joinedAt: p.joineAt
                };
            });

            return {
                ...convo, 
                unreadCount: convo.unreadCount || {},
                participants,
            }
        });

        return res.status(200).json({ conversations: formatted });
    } catch (error) {
        console.error('Lỗi xảy ra khi lấy conversation', error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
export const getMessages = async (req,res)=>{

    try {
        
        const {id:conversationId} = req.params;
        const {limit=50,cursor } = req.query;
  
        const query = {conversationId};

        if(cursor){
            query.createdAt = {$lt:new Date(cursor)}
        }
    
    
        let message = await Message.find(query)
        .sort({createdAt:-1})
        .limit(Number(limit)+1)
        .populate('replyTo', 'content imgUrl senderId isDeleted');

        console.log("2. Số lượng tin tìm được:", message.length);
        console.log("---------------------------------------");

        let nextCursor  =null;
        if(message.length>Number(limit)){
            const nextMessage  = message[message.length - 1];
            nextCursor = nextMessage.createdAt.toISOString();
            message.pop();
        }

        message  = message.reverse();
        return res.status(200).json({
            message,nextCursor
        })


    } catch (error) {
        console.error('lỗi xảy ra khi lấy message',error);
        return res.status(500).json({message:'lỗi hệ thống'})
    }
}

export const markAsSeen = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        }

        const isParticipant = conversation.participant.some(p => p.userId.toString() === userId.toString());
        if (!isParticipant) {
            return res.status(403).json({ message: 'Bạn không thuộc cuộc trò chuyện này' });
        }

        // Thêm vào seenBy nếu chưa có
        if (!conversation.seenBy.includes(userId)) {
            conversation.seenBy.push(userId);
        }

        // Reset tin nhắn chưa đọc của người dùng hiện tại về 0
        if (!conversation.unreadCount) {
            conversation.unreadCount = new Map();
        }
        conversation.unreadCount.set(userId.toString(), 0);

        await conversation.save();

        // Phát sự kiện realtime thông báo là người dùng đã xem tin nhắn
        try {
            const { emitToUser } = await import("../libs/socket.js");
            conversation.participant.forEach(p => {
                if (p.userId.toString() !== userId.toString()) {
                    emitToUser(p.userId, "conversationSeen", {
                        conversationId,
                        userId
                    });
                }
            });
        } catch (socketErr) {
            console.error("Lỗi emit socket trong markAsSeen:", socketErr);
        }

        return res.status(200).json({ message: "Đã đánh dấu xem tin nhắn", conversationId });
    } catch (error) {
        console.error('Lỗi khi đánh dấu đã xem', error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

export const updateTheme = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const { theme } = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        }

        const isParticipant = conversation.participant.some(p => p.userId.toString() === userId.toString());
        if (!isParticipant) {
            return res.status(403).json({ message: 'Bạn không thuộc cuộc trò chuyện này' });
        }

        conversation.theme = theme;
        await conversation.save();

        try {
            const { emitToUser } = await import("../libs/socket.js");
            conversation.participant.forEach(p => {
                emitToUser(p.userId, "themeUpdated", {
                    conversationId,
                    theme
                });
            });
        } catch (socketErr) {
            console.error("Lỗi emit socket trong updateTheme:", socketErr);
        }

        return res.status(200).json({ message: "Cập nhật chủ đề thành công", theme });
    } catch (error) {
        console.error('Lỗi khi cập nhật chủ đề:', error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}

export const updateWallpaper = async (req, res) => {
    try {
        const { id: conversationId } = req.params;
        const { wallpaper } = req.body;
        const userId = req.user._id;

        const conversation = await Conversation.findById(conversationId);
        if (!conversation) {
            return res.status(404).json({ message: 'Không tìm thấy cuộc trò chuyện' });
        }

        const isParticipant = conversation.participant.some(p => p.userId.toString() === userId.toString());
        if (!isParticipant) {
            return res.status(403).json({ message: 'Bạn không thuộc cuộc trò chuyện này' });
        }

        conversation.wallpaper = wallpaper;
        await conversation.save();

        try {
            const { emitToUser } = await import("../libs/socket.js");
            conversation.participant.forEach(p => {
                emitToUser(p.userId, "wallpaperUpdated", {
                    conversationId,
                    wallpaper
                });
            });
        } catch (socketErr) {
            console.error("Lỗi emit socket trong updateWallpaper:", socketErr);
        }

        return res.status(200).json({ message: "Cập nhật hình nền thành công", wallpaper });
    } catch (error) {
        console.error('Lỗi khi cập nhật hình nền:', error);
        return res.status(500).json({ message: 'Lỗi hệ thống' });
    }
}
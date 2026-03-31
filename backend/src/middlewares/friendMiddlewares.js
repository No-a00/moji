import Conversation from "../model/Conversation.js";
import Friend from "../model/Friend.js";

const pair = (a, b) =>  a < b ? [a, b] : [b, a] ;

export const CheckFriendShip = async (req, res, next) => {
    try {
        const me = req.user._id.toString();

        const recipientId = req.body?.recipientId ?? null;
        const memberIds = req.body?.memberIds ?? [];


        

        if (!recipientId && memberIds.length === 0) {
            return res.status(400).json({ mess: 'cần cung cấp recipientId hoặc memberIds'});

        }
        if (recipientId) {
            // nếu cần thêm tính năng cloud
            if (recipientId === me) return next();

            const [userA, userB] = pair(me, recipientId);

            const isFriend = await Friend.findOne({ userA, userB });

            if (!isFriend) {
                return res.status(403).json({ message: 'bạn chưa kết bạn với người này' });

            }
            return next();
        }
        //todo:chat nhóm   
        const friendChecks = memberIds.map(async(memberId)=>{
            const [userA,userB] = pair(me,memberId);
            const friend = await Friend.findOne({userA,userB});
            return friend ? null : memberId;
        })


        const results = await Promise.all(friendChecks);
        const notFriend = results.filter(Boolean);
        if(notFriend.length>0){
            return res.status(403).json({message:'bạn chỉ có thể thêm bạn bè vào nhóm ',notFriend});
        }
        next();

    } catch (error) {
        console.error('lỗi xảy ra khi checkFriendShips:', error);
        return res.status(500).json({ message: 'lỗi hệ thống' });
    }
}

export const checkGroupMembership = async(req,res,next)=>{
    try {
        const {conversationId} = req.body;
        const userId = req.user._id;
        const conversation = await Conversation.findById(conversationId);

        if(!conversation){
            return res.status(404).json({message:'không tìm thấy nội dung cuộc trò chuyện'});
        }
        const ismember = conversation.participant.some((p)=>
        p.userId.toString()===userId.toString());
        if(!ismember){
            return res.status(403).json({message:'bạn không ở trong nhóm này'});

        }
        req.conversation = conversation;
        next();

    } catch (error) {
        console.error('lỗi xảy ra khi checkGroupMemberShips:', error);
        return res.status(500).json({ message: 'lỗi hệ thống' });
    }
}
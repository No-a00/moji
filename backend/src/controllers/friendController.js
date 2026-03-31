import Friend from '../model/Friend.js';
import User from '../model/User.js';
import FriendRequest from '../model/FriendRequest.js'


export const sendFriendRequest = async (req, res) => {
    try {
        const { to, message } = req.body;

        const from = req.user._id;

        if (from === to) {
            return res.status(400).json({ message: 'không thể gửi lời mời cho chính mình' });
        }

        const userExists = await User.exists({ _id: to });

        if (!userExists) {
            return res.status(404).json({ message: 'người dùng không tồn tại' });
        }

        let userA = from.toString();
        let userB = to.toString();

        if (userA > userB) {
            [userA, userB] = [userB, userA];
        }

        const [alreadyFriends, existingRequest] = await Promise.all([
            Friend.findOne({ userA, userB }),
            FriendRequest.findOne({
                $or: [
                    { from, to },
                    { from: to, to: from }
                ]
            })
        ]);
        if (alreadyFriends) {
            return res.status(400).json({ message: 'hai người đã  là bạn bè' });
        }
        if (existingRequest) {
            return res.status(400).json({ message: 'đã có lời mời kết bạn dang chờ' });
        }

        const request = await FriendRequest.create({
            from,
            to,
            message
        })
        return res.status(201).json({ message: 'Gửi lời mời kết bạn thành công', request });
    } catch (error) {
        console.error('lỗi khi gửi yêu cầu kết bạn', error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
};
export const acceptFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'không tìm thấy lời mời kết bạn' });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403).json({ message: 'bạn không có quyền chấp nhận lời mời này' });
        }
        const friend = await Friend.create({
            userA: request.from,
            userB: request.to
        });
        await FriendRequest.findByIdAndDelete(requestId);

        const from = await User.findById(request.from).select('_id displayName avatarurl').lean();

        return res.status(200).json({
            message: 'chấp nhận lời mời kết bạn thành công',
            newFriend: {
                _id: from?._id,
                displayName: from?.displayName,
                avartarUrl: from?.avatarUrl,
            }

        },
        );
    } catch (error) {
        console.error('lỗi khi chấp nhận yêu cầu kết bạn', error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
};
export const declineFriendRequest = async (req, res) => {
    try {
        const { requestId } = req.params;
        const userId = req.user._id;

        const request = await FriendRequest.findById(requestId);

        if (!request) {
            return res.status(404).json({ message: 'không tìm thấy lời mời kết bạn' });
        }
        if (request.to.toString() !== userId.toString()) {
            return res.status(403)
                .json({ message: 'bạn không có quyền từ chối lời mời này' });
        }
        await FriendRequest.findByIdAndDelete(requestId);
        return res.status(200).json({ message: "Đã từ chối lời mời thành công" });

    } catch (error) {
        console.error('lỗi khi từ chối yêu cầu kết bạn', error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
};
export const getAllFriends = async (req, res) => {
    try {

        const userId = req.user._id;

        const friendships = await Friend.find({
            $or: [
                {
                    userA: userId,

                },
                {
                    userB: userId,
                }
            ]
        })
            .populate("userA", "_id displayName avatarUrl")
            .populate("userB", "_id displayName avatarUrl")
            ;
        if (!friendships.length) {
            return res.status(200).json({ friends: [] });
        }
        const friends = friendships.map((f) =>
            f.userA._id.toString() === userId.toString() ? f.userB : f.userA
        )
        return res.status(200).json({ friends });


    } catch (error) {
        console.error('lỗi khi lấy danh sách bạn bè', error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
};
export const getFriendRequests = async (req, res) => {
    try {
        const userId = req.user._id;
        const populateFiels = '_id username displayName avatarUrl';

        const [sent, received] = await Promise.all([
            FriendRequest.find({ from: userId }).populate('to', populateFiels),
            FriendRequest.find({ to: userId }).populate('from', populateFiels)
        ])

        res.status(200).json({ sent, received });


    } catch (error) {
        console.error('lỗi khi lấy danh sách yêu cầu kết bạn', error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
};
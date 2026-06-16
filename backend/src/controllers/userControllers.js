import User from "../model/User.js";

export const authMe = async(req,res)=>{
    try {
        const user = req.user;//lấy từ authMiddleware
        return res.status(200).json({
            user
        })
    } catch (error) {
        console.error("lỗi khi gọi authMe",error);
        return res.status(500).json({message:"lỗi hệ thống."})
    }
}

export const searchUsers = async(req,res)=>{
    try {
        const { q } = req.query;
        const currentUserId = req.user._id;
        if (!q) {
            return res.status(400).json({ message: "Thiếu từ khóa tìm kiếm" });
        }
        
        // Tìm kiếm người dùng loại trừ bản thân, đối sánh regex không phân biệt hoa thường
        const users = await User.find({
            _id: { $ne: currentUserId },
            $or: [
                { username: { $regex: q, $options: 'i' } },
                { displayName: { $regex: q, $options: 'i' } },
                { email: { $regex: q, $options: 'i' } }
            ]
        }).select('_id username displayName avatarUrl coverUrl bio');
        
        return res.status(200).json({ users });
    } catch (error) {
        console.error("lỗi khi tìm kiếm người dùng", error);
        return res.status(500).json({ message: "lỗi hệ thống." });
    }
}

export const updateProfile = async (req, res) => {
    try {
        const userId = req.user._id;
        const { displayName } = req.body;
        
        const updateData = {};
        if (displayName) {
            updateData.displayName = displayName;
        }

        if (req.files) {
            if (req.files.avatar && req.files.avatar[0]) {
                updateData.avatarUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.avatar[0].filename}`;
            }
            if (req.files.cover && req.files.cover[0]) {
                updateData.coverUrl = `${req.protocol}://${req.get('host')}/uploads/${req.files.cover[0].filename}`;
            }
        }

        const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true }).select('-hashedPassword');
        return res.status(200).json({ user: updatedUser });
    } catch (error) {
        console.error("lỗi khi cập nhật profile", error);
        return res.status(500).json({ message: "lỗi hệ thống khi cập nhật profile" });
    }
}

export const getUserProfile = async (req, res) => {
    try {
        const { id } = req.params;
        const user = await User.findById(id).select('-hashedPassword');
        if (!user) return res.status(404).json({ message: "Không tìm thấy người dùng" });
        return res.status(200).json({ user });
    } catch (error) {
        console.error("lỗi khi lấy profile", error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
}

export const blockUser = async (req, res) => {
    try {
        const { id } = req.params;
        const userId = req.user._id;

        if (id === userId.toString()) return res.status(400).json({ message: "Không thể tự chặn chính mình" });

        const currentUser = await User.findById(userId);
        const isBlocked = currentUser.blockedUsers.includes(id);

        if (isBlocked) {
            currentUser.blockedUsers = currentUser.blockedUsers.filter(bId => bId.toString() !== id.toString());
        } else {
            currentUser.blockedUsers.push(id);
        }

        await currentUser.save();
        return res.status(200).json({ message: isBlocked ? "Đã bỏ chặn" : "Đã chặn người dùng", isBlocked: !isBlocked, blockedUserId: id });
    } catch (error) {
        console.error("lỗi khi chặn người dùng", error);
        return res.status(500).json({ message: "lỗi hệ thống" });
    }
}
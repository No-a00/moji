export const updateConversationAfterCreateMessage = (conversation, message, senderId) => {
    try {
        conversation.set({
            seenBy: [senderId], // Người gửi coi như đã xem
            lastMessageAt: message.createdAt,
            lastMessage: {
                _id: message._id, // Lưu ý: message._id thường có dấu gạch dưới
                content: message.content,
                senderId: senderId,
                createdAt: message.createdAt,
            }
        });

        // --- BƯỚC 3: TÍNH SỐ TIN NHẮN CHƯA ĐỌC ---
        // Kiểm tra xem participant có tồn tại không trước khi lặp
        if (conversation.participant) {
            conversation.participant.forEach(p => {
                const memberId = p.userId.toString();
                const isSender = memberId === senderId.toString();
                
                // Đảm bảo unreadCounts là Map trước khi get/set
                if (!conversation.unreadCounts) {
                    conversation.unreadCounts = new Map();
                }

                const prevCount = conversation.unreadCounts.get(memberId) || 0;
                
                // Nếu là người gửi -> reset về 0
                // Nếu là người nhận -> tăng lên 1
                conversation.unreadCounts.set(memberId, isSender ? 0 : prevCount + 1);
            });
        }

    } catch (error) {
        console.error("Lỗi khi update conversation:", error);
    }
}
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../model/User.js";

// Map lưu trữ người dùng online: userId -> [socketId1, socketId2, ...]
const userSocketMap = {};

let io = null;

export const getReceiverSocketId = (userId) => {
    return userSocketMap[userId];
};

export const emitToUser = (userId, event, data) => {
    if (io) {
        io.to(userId.toString()).emit(event, data);
    }
};

export const initializeSocket = (server) => {
    io = new Server(server, {
        cors: {
            origin: process.env.CLIENT_URL || "http://localhost:5173",
            credentials: true,
        },
    });

    // Middleware xác thực JWT token kết nối socket
    io.use(async (socket, next) => {
        try {
            // Lấy token từ handshake auth hoặc headers
            let token = socket.handshake.auth?.token;
            
            if (!token) {
                // Thử lấy từ headers
                const authHeader = socket.handshake.headers?.authorization;
                token = authHeader && authHeader.split(" ")[1];
            }

            if (!token) {
                return next(new Error("Authentication error: No token provided"));
            }

            // Giải mã token
            const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
            const user = await User.findById(decoded.userId).select("-hashedPassword");

            if (!user) {
                return next(new Error("Authentication error: User not found"));
            }

            socket.user = user;
            next();
        } catch (err) {
            console.error("Socket Auth Error:", err.message);
            return next(new Error("Authentication error: Invalid token"));
        }
    });

    io.on("connection", (socket) => {
        const userId = socket.user._id.toString();
        console.log(`🔌 Socket connected: ${socket.user.displayName} (socketId: ${socket.id})`);

        // Join room cá nhân của user
        socket.join(userId);

        // Đăng ký socketId
        if (!userSocketMap[userId]) {
            userSocketMap[userId] = [];
        }
        userSocketMap[userId].push(socket.id);

        // Gửi danh sách người dùng online hiện tại cho tất cả mọi người
        io.emit("getOnlineUsers", Object.keys(userSocketMap));

        // Lắng nghe sự kiện "gõ chữ" (typing)
        socket.on("typing", ({ conversationId, recipientIds }) => {
            if (recipientIds && Array.isArray(recipientIds)) {
                recipientIds.forEach((receiverId) => {
                    // Gửi sự kiện đến room của người nhận
                    socket.to(receiverId.toString()).emit("userTyping", {
                        conversationId,
                        senderId: userId,
                    });
                });
            }
        });

        // Lắng nghe sự kiện "dừng gõ chữ" (stopTyping)
        socket.on("stopTyping", ({ conversationId, recipientIds }) => {
            if (recipientIds && Array.isArray(recipientIds)) {
                recipientIds.forEach((receiverId) => {
                    socket.to(receiverId.toString()).emit("userStopTyping", {
                        conversationId,
                        senderId: userId,
                    });
                });
            }
        });

        // Ngắt kết nối
        socket.on("disconnect", () => {
            console.log(`🔌 Socket disconnected: ${socket.user.displayName} (socketId: ${socket.id})`);
            
            if (userSocketMap[userId]) {
                userSocketMap[userId] = userSocketMap[userId].filter(id => id !== socket.id);
                if (userSocketMap[userId].length === 0) {
                    delete userSocketMap[userId];
                }
            }

            // Cập nhật danh sách online mới cho tất cả client
            io.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });

    return io;
};

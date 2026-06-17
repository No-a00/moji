import express from 'express'
import dotenv from 'dotenv'
import { conectDB } from './libs/db.js'
import authRouter from './router/authRouter.js'
import friendRoute from './router/friendRouter.js'
import messageRoute from './router/messageRoute.js'
import cookieParser from 'cookie-parser'
import userRoute from './router/userRoute.js'
import {protectedRoute} from "./middlewares/authmiddlewares.js"
import cors from 'cors'
import ConversationRoute from './router/conversationRoute.js'

import { createServer } from 'http'
import { initializeSocket } from './libs/socket.js'
import path from 'path';
import { fileURLToPath } from 'url';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 5001;

// Tạo HTTP Server bao bọc express app để dùng cho Socket.io
const server = createServer(app);
initializeSocket(server);

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

//public routes
app.use('/api/auth',authRouter);

//private routers
app.use(protectedRoute)
app.use('/api/users',userRoute);
app.use('/api/friend',friendRoute);
app.use('/api/messages',messageRoute);
app.use('/api/conversations',ConversationRoute)

conectDB().then(() => {
    // Phục vụ frontend tĩnh khi chạy production
    if (process.env.NODE_ENV === "production") {
        app.use(express.static(path.join(__dirname, '../../frontend/dist')));

        app.get(/(.*)/, (req, res) => {
            res.sendFile(path.resolve(__dirname, '../../frontend/dist', 'index.html'));
        });
    }

    server.listen(PORT, () => {
        console.log(`server bắt đầu trên cổng ${PORT}`);
    });
});

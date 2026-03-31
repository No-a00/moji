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

dotenv.config();


const app = express();

const POST = process.env.POST || 5001;

//middlewares
app.use(express.json());
app.use(cookieParser());
app.use(cors({origin:process.env.CLIENT_URL,credentials:true}))
//public routes
app.use('/api/auth',authRouter);
//private routers
app.use(protectedRoute)
app.use('/api/users',userRoute);
app.use('/api/friend',friendRoute);
app.use('/api/messages',messageRoute);
app.use('/api/conversations',ConversationRoute)

conectDB().then(() => {
    app.listen(POST, () => {
        console.log(`server bắt đầu trên cổng ${POST}`);
    });
});


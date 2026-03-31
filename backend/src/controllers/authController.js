import bcrypt from 'bcrypt'
import User from '../model/User.js';
import jwt from 'jsonwebtoken'
import crypto from "crypto"
import Session from '../model/Session.js'


const ACCESS_TOKEN_TTL = '30m'//thường là dưới 15m
const REFRESH_TOKEN_TTL = 14*24*60*60*1000//14 ngày 

export const signUp = async (req, res) => {
    try {
        const { username, password, email, firstName, lastName } = req.body;
        if (!username || !password || !email || !firstName || !lastName) {
            return res.status(400).json({ message: "không thể thiếu username,password,email.ffirstName,lastName" })
        };
        //kiểm tra username đã tồn tại chưa
        const duplicate = await User.findOne({ username });
        if (duplicate) {
            return res.status(409).json({ message: "username đã tồn tại " })
        }

        //mã hóa password
        const hashedPassword = await bcrypt.hash(password, 10); //   salt = 10

        //tạo username mới 
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${lastName} ${firstName}`,
        })

        //return
        return res.sendStatus(204);

    } catch (error) {
        console.log('lỗi khi gọi signup',error);
         res.status(500).josn({message:"lỗi hệ thống"});
    }
}

export const signIn = async(req,res)=>{
    try {
        //lấy inputs
        const {username,password}=req.body;
        if(!username||!password){
            return res.status(400).json({message:"thiếu username hoặc password  "});
        }
        //lấy hasedPassword trong db để so với input
        const user = await User.findOne({username});
        if(!user){
            return res.status(401).json({message:"username hoặc password không chính xác"});

        }
        //kiểm tra password
        const passwordConnect = await bcrypt.compare(password,user.hashedPassword);
        if(!passwordConnect){
             return res.status(401).json({message:"username hoặc password không chính xác"});
        }
        


        //nếu khớp tạo accsess token với JWT
        const accessToken = jwt.sign({userId:user._id},process.env.ACCESS_TOKEN_SECRET,{expiresIn:ACCESS_TOKEN_TTL});
        //tạo refresh token
        const refreshToken = crypto.randomBytes(64).toString("hex");

       

        //tạo session mới dể lưu refresh token
        await Session.create({
            userId:user._id,
            refreshToken,
            expiresAt:new Date(Date.now()+REFRESH_TOKEN_TTL),

        });

        //trả refresh token về trong cookie
         res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            secure:true,
            sameSite:'none',//backend frontend deploy riêng 
            maxAge:REFRESH_TOKEN_TTL,
        })
        //trả ascess về trong res
        return res.status(200).json({message:`User ${user.displayName} đã login `,accessToken})

    } catch (error) {
         console.log('lỗi khi gọi signin',error);
         res.status(500).josn({message:"lỗi hệ thống"});
    }
}

export const signOut = async(req,res) =>{
    try {
            //lấy refresh token từ cookie
            const token = req.cookies?.refreshToken;
            if(token){
                //xóa refresh token từ Session 
                await Session.deleteOne({refreshToken:token});
                 //xóa cookie 
                res.clearCookie('refreshToken');
            }
            
            return res.sendStatus(204);

    } catch (error) {
         console.log('lỗi khi gọi signOut',error);
         res.status(500).josn({message:"lỗi hệ thống"});
    }
}

//tạo access token mới từ refresh token
export const refreshToken = async(req,res)=>{
    try {
        //lấy refresh token từ cookie
        const token = req.cookies?.refreshToken;
        if(!token){
            return res.status(401).json({message:"không tìm thấy refresh token"});
        }
        //so với refresh token trong db
        const session = await Session.findOne({refreshToken:token});
        if(!session){
            return res.status(403).json({message:"Token không hợp lệ"});
        }
        //kiểm tra refresh token còn hạn không
        if(session.expiresAt < new Date()){
            return res.status(403).json({message:"Token đã hết hạn"});
        }
        //nếu hợp lệ tạo access token mới 
        const accessToken = jwt.sign({userId:session.userId},process.env.ACCESS_TOKEN_SECRET,{expiresIn:ACCESS_TOKEN_TTL});
         
        //trả access token về cho client
        return res.status(200).json({accessToken});

    } catch (error) {
        console.log('lỗi khi gọi refreshToken',error);
        res.status(500).json({message:"lỗi hệ thống"});
    }

}
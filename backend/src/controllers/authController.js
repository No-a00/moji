import bcrypt from 'bcrypt'
import User from '../model/User.js';
import jwt from 'jsonwebtoken'
import crypto from "crypto"
import Session from '../model/Session.js'
import { sendVerificationEmail, sendPasswordResetEmail } from '../libs/mail.js';


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

        // Tạo token xác thực
        const verificationToken = crypto.randomBytes(32).toString('hex');
        const verificationTokenExpires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 giờ

        //tạo username mới 
        await User.create({
            username,
            hashedPassword,
            email,
            displayName: `${lastName} ${firstName}`,
            verificationToken,
            verificationTokenExpires,
            isVerified: true // Tự động xác thực tài khoản
        });

        // Gửi email xác thực (chạy ngầm, nếu Render lỗi thì bỏ qua)
        sendVerificationEmail(email, verificationToken).catch(err => {
            console.error('Lỗi khi gửi email xác thực ngầm:', err);
        });

        //return
        return res.status(201).json({message: "Đăng ký thành công, vui lòng kiểm tra email để xác thực tài khoản."});

    } catch (error) {
        console.log('lỗi khi gọi signup',error);
         res.status(500).json({message:"lỗi hệ thống"});
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

        // Tạm thời vô hiệu hóa kiểm tra xác thực để dùng được trên Render Free
        // if (user.isVerified === false) {
        //     return res.status(403).json({message: "Tài khoản chưa được xác thực. Vui lòng kiểm tra email."});
        // }
        
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
         res.status(500).json({message:"lỗi hệ thống"});
    }
}

export const signOut = async(req,res) =>{
    try {
            //lấy refresh token từ cookie
            const token = req.cookies?.refreshToken;
            if(token){
                //xóa refresh token từ Session 
                await Session.deleteOne({refreshToken:token});
            }
            //xóa cookie 
            res.clearCookie('refreshToken', {
                httpOnly: true,
                secure: true,
                sameSite: 'none',
            });
            
            return res.sendStatus(204);

    } catch (error) {
         console.log('lỗi khi gọi signOut',error);
         res.status(500).json({message:"lỗi hệ thống"});
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

// Xác thực email
export const verifyEmail = async (req, res) => {
    try {
        const { token } = req.body;
        const user = await User.findOne({
            verificationToken: token,
            verificationTokenExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token xác thực không hợp lệ hoặc đã hết hạn" });
        }

        user.isVerified = true;
        user.verificationToken = undefined;
        user.verificationTokenExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Xác thực email thành công" });
    } catch (error) {
        console.error('lỗi khi verify email', error);
        res.status(500).json({ message: "lỗi hệ thống" });
    }
};

// Quên mật khẩu
export const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(404).json({ message: "Không tìm thấy người dùng với email này" });
        }

        const resetToken = crypto.randomBytes(32).toString('hex');
        user.resetPasswordToken = resetToken;
        user.resetPasswordExpires = Date.now() + 3600000; // 1 giờ
        await user.save();

        await sendPasswordResetEmail(user.email, resetToken);

        res.status(200).json({ message: "Đã gửi email đặt lại mật khẩu" });
    } catch (error) {
        console.error('lỗi khi forgot password', error);
        res.status(500).json({ message: "lỗi hệ thống" });
    }
};

// Đặt lại mật khẩu
export const resetPassword = async (req, res) => {
    try {
        const { token, password } = req.body;
        const user = await User.findOne({
            resetPasswordToken: token,
            resetPasswordExpires: { $gt: Date.now() }
        });

        if (!user) {
            return res.status(400).json({ message: "Token đặt lại mật khẩu không hợp lệ hoặc đã hết hạn" });
        }

        const hashedPassword = await bcrypt.hash(password, 10);
        user.hashedPassword = hashedPassword;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpires = undefined;
        await user.save();

        res.status(200).json({ message: "Đặt lại mật khẩu thành công" });
    } catch (error) {
        console.error('lỗi khi reset password', error);
        res.status(500).json({ message: "lỗi hệ thống" });
    }
};
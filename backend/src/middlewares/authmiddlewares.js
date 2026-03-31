import jwt  from "jsonwebtoken";

import User from "../model/User.js";

export const protectedRoute = (req,res,next)=>{
    try {
    //lấy token từ header
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(" ")[1];//Bearer <token>

    if(!token){
        return res.status(401).json({message:"không tìm thấy access token"})

    }
       //xác nhận token hợp lệ 
    jwt.verify(token,process.env.ACCESS_TOKEN_SECRET,async(err,decodeUser)=>{
        if(err){
            console.error(err)
            return res.status(403).json({message:"Access  token không đúng hoặc hết hạn"});
        }
        //tìm user
        const user =  await User.findById(decodeUser.userId).select('-hashedPassword')

        if(!user){
            return res.status(404).json({message:"người dung không tồn tại "});

        }
         //trả user trong 
         req.user = user;
         next();

    })

 
    
       

    } catch (error) {
        console.error('lỗi khi xác minh JWT trong authmiddleware ',error)
        return res.status(500).json({message:"lỗi hệ thống"});
    }
}

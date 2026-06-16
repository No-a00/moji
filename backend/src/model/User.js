import mongoose from "mongoose";

const userSchema   = new mongoose.Schema(
    {
        username:{
            type:String ,
            require:true,
            unique:true,
            trim:true,
            lowercase:true
        },
        
        hashedPassword:{
            type:String,
            require:true,

        },
        email:{
            type:String,
            require:true,
            unique:true,
            lowercase:true,
            trim:true,
        },
        displayName:{
            type:String,
            trim:true,
            require:true
        },
        avatarUrl:{
            type:String// link CDN để hiện thị hình 
        },
        coverUrl:{
            type:String// Ảnh nền đại diện
        },
        avatarId:{
            type:String,//Cloudinary public_id để xóa hình  
        },
        bio:{
            type:String,
            maxlength:500//tùy 
        },
        phone:{
            type:String,
            sparse:true//cho phép null nhưng không được trùng
        },
        blockedUsers: [{
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User'
        }],
        isVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: String,
        verificationTokenExpires: Date,
        resetPasswordToken: String,
        resetPasswordExpires: Date

    },
    {
        timestamps:true,
    }

);
const User = mongoose.model('User',userSchema);
export default User;

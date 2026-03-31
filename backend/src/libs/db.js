import mongoose from 'mongoose'

export const conectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGOOSE_DB)
        console.log("liên kết với cơ sở dữ liệu thành công !")
    } catch (error) {
        console.log('Lỗi khi kết lối CSDL',error);
        process.exit(1);
    }
}
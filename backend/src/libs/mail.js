import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

// Sử dụng cấu hình tường minh cho Gmail thay vì chỉ khai báo service
const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true, // dùng SSL
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Kiểm tra cấu hình email ngay khi server khởi động
if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
    transporter.verify(function(error, success) {
        if (error) {
            console.error('Lỗi cấu hình Email (Render):', error);
        } else {
            console.log('Server Email đã sẵn sàng để gửi tin nhắn!');
        }
    });
}

export const sendVerificationEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email/${token}`;
    
    // Nếu chưa có cấu hình email, in link ra console để test
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n=======================================');
        console.log(`[MOCK EMAIL] Verification link cho ${email}:`);
        console.log(url);
        console.log('=======================================\n');
        return;
    }

    const mailOptions = {
        from: `"Moji Chat" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Xác thực tài khoản Moji của bạn',
        html: `
            <h2>Chào mừng bạn đến với Moji!</h2>
            <p>Vui lòng click vào đường link dưới đây để xác thực tài khoản của bạn:</p>
            <a href="${url}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Xác thực tài khoản</a>
            <p>Hoặc copy link này vào trình duyệt: <br> ${url}</p>
            <p>Link sẽ hết hạn sau 24 giờ.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Verification email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

export const sendPasswordResetEmail = async (email, token) => {
    const url = `${process.env.CLIENT_URL || 'http://localhost:5173'}/reset-password/${token}`;
    
    // Nếu chưa có cấu hình email, in link ra console để test
    if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
        console.log('\n=======================================');
        console.log(`[MOCK EMAIL] Password Reset link cho ${email}:`);
        console.log(url);
        console.log('=======================================\n');
        return;
    }

    const mailOptions = {
        from: `"Moji Chat" <${process.env.EMAIL_USER}>`,
        to: email,
        subject: 'Đặt lại mật khẩu Moji của bạn',
        html: `
            <h2>Yêu cầu đặt lại mật khẩu</h2>
            <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản của bạn.</p>
            <p>Vui lòng click vào đường link dưới đây để đặt mật khẩu mới:</p>
            <a href="${url}" style="padding: 10px 20px; background-color: #2563eb; color: white; text-decoration: none; border-radius: 5px;">Đặt lại mật khẩu</a>
            <p>Hoặc copy link này vào trình duyệt: <br> ${url}</p>
            <p>Link sẽ hết hạn sau 1 giờ. Nếu bạn không yêu cầu, vui lòng bỏ qua email này.</p>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        console.log(`Password reset email sent to ${email}`);
    } catch (error) {
        console.error('Error sending email:', error);
    }
};

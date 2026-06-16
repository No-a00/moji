import multer from "multer";
import path from "path";
import fs from "fs";

// Đảm bảo thư mục uploads tồn tại
const uploadDir = path.join(process.cwd(), "src/uploads");
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Cấu hình lưu trữ
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

// Kiểm tra loại file
const fileFilter = (req, file, cb) => {
  const allowedMimes = [
    "image/",
    "audio/",
    "video/",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "application/zip",
    "application/x-zip-compressed"
  ];

  const isAllowed = allowedMimes.some(mime => file.mimetype.startsWith(mime));
  
  if (isAllowed) {
    cb(null, true);
  } else {
    cb(new Error("Loại tệp không được hỗ trợ!"), false);
  }
};

const upload = multer({
  storage: storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Giới hạn 20MB
  fileFilter: fileFilter,
});

export default upload;

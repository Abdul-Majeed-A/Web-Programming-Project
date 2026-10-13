import multer from 'multer';
import path from 'path';
import fs from 'fs';

const uploadsDir = path.resolve('uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate safe timestamped unique filename
    const sanitizedOriginal = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${uniqueSuffix}-${sanitizedOriginal}`);
  },
});

const fileFilter = (req, file, cb) => {
  const allowedExtensions = ['.pdf', '.doc', '.docx', '.ppt', '.pptx', '.zip', '.txt'];
  const ext = path.extname(file.originalname).toLowerCase();

  if (allowedExtensions.includes(ext)) {
    cb(null, true);
  } else {
    cb(
      new Error(
        `Invalid file format '${ext}'. Allowed file types are PDF, DOC, DOCX, PPT, PPTX, ZIP, TXT.`
      ),
      false
    );
  }
};

const maxFileSizeMB = parseInt(process.env.MAX_FILE_SIZE_MB || '15', 10);

export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: maxFileSizeMB * 1024 * 1024,
  },
});

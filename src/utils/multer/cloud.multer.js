import multer from "multer";

export const cloudFileUpload = ({ validation = [] } = {}) => {
  const storage = multer.diskStorage({});

  const fileFilter = (req, file, cb) => {
    if (!validation.includes(file.mimetype)) {
      return cb(new Error("Invalid File Type"), false);
    }
    cb(null, true);
  };
  return multer({ dest: "./temp", fileFilter, storage });
};

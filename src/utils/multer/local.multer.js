import multer from "multer";
import { nanoid } from "nanoid";
import fs from "node:fs";
import path from "node:path";

export const fileValidation = {
  image: ["image/jpeg", "image/gif"],
  document: ["application/pdf", "application/msword"],
};
export const localFileUpload = ({
  customPath = "general",
  validation = [],
} = {}) => {
  let basePath = `uploads/${customPath}`;

  const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      if (req.user?._id) {
        basePath += `/${req.user._id}`;
      }
      const fullPath = path.resolve(`./src/${basePath}`);
      if (!fs.existsSync(fullPath)) {
        fs.mkdirSync(fullPath, { recursive: true });
      }
      cb(null, path.resolve(fullPath));
    },
    filename: function (req, file, cb) {
      const uniqueFileName =
        Date.now() +
        "___" +
        Math.random() +
        "__" +
        nanoid() +
        "__" +
        file.originalname;

      file.finalPath = basePath + "/" + uniqueFileName;
      cb(null, uniqueFileName);
    },
  });

  const fileFilter = (req, file, cb) => {
    if (!validation.includes(file.mimetype)) {
      return cb(new Error("Invalid File Type"), false);
    }
    cb(null, true);
  };
  return multer({ dest: "./temp", fileFilter, storage });
};

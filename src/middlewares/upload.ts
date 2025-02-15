import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import { cloudinary } from "../configs/cloudinary";
import path from "path";

const storage = new CloudinaryStorage({
  cloudinary,
  params: (req, file) => {
    return {
      folder: "events",
      format: file.mimetype.split("/")[1].replace("jpeg", "jpg"), //cloudinary not use jpeg
      public_id: path.parse(file.originalname).name,
    };
  },
});

const upload = multer({ storage });

export default upload;

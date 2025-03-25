import multer, { StorageEngine } from "multer";
import path from "path";
// Define storage engine with correct types
const storage: StorageEngine = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "..", "uploads")); // Make sure this folder exists
  },
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    const filename = `${Date.now()}-${file.originalname}`;
    cb(null, filename);
  },
});

// Define multer instance
const upload = multer({
  storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // optional: 10MB max file size
  },
  fileFilter: (req, file, cb) => {
    // Optional: accept only certain types
    const allowedTypes = ["image/jpeg", "image/png"];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error("Invalid file type"));
    }
  },
});

export default upload;

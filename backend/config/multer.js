import multer from "multer";

export const upload = multer({
  //store in RAM
  storage: multer.memoryStorage(),
  //to avoid RAM overflow
  limits: {
    fileSize: 4 * 1024 * 1024, // 4MB
  },
  //for security validation
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf") {
      cb(null, true);
    } else {
      const err = new Error("Only PDF are allowed");
      err.status = 400;
      cb(err, false);
    }
  },
});
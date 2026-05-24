import cloudinary from "./cloudinary.js";

export const uploadToCloudinary = (buffer) => {
  console.log("Upload function called"); // 👈 ADD
  console.log(buffer);
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder: "resumess" }, (err, result) => {
      if (err) return reject(err);
      resolve(result);
    });
    stream.end(buffer);
  });
};
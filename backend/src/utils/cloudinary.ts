import {v2 as cloudinary} from "cloudinary"
import fs from "fs"
import dotenv from "dotenv"
import path from "path"
import { fileURLToPath } from "url"
const __filename=fileURLToPath(import.meta.url)
const __dirname=path.dirname(__filename)
dotenv.config({ path: path.resolve(__dirname, "../.env") });


if (!process.env.CLOUDINARY_SECRET || !process.env.CLOUDINARY_KEY||!process.env.CLOUDINARY_NAME){
    throw new Error ("no cloudinary keys")
}
export const uploadOnCloudinary = async (filePath: string) => {
  try {
    cloudinary.config({
      cloud_name: process.env.CLOUDINARY_NAME,
      api_key: process.env.CLOUDINARY_KEY,
      api_secret: process.env.CLOUDINARY_SECRET,
    });

    const result = await cloudinary.uploader.upload(filePath, {
      resource_type: "auto",
    });

    await fs.promises.unlink(filePath); 
    return result.secure_url;
  } catch (error) {
    await fs.promises.unlink(filePath).catch(() => {});
    console.error("Cloudinary upload error:", error);
    throw error;
  }
};

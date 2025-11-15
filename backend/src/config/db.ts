import mongoose from "mongoose";

export const connectDb = async () => {
  const MONGO_URI = process.env.MONGO_URI;
  if (!MONGO_URI) {
    throw new Error("no mongo uri");
  }

  try {
    await mongoose.connect(MONGO_URI);
    console.log("db connected");
  } catch (error) {
    console.error("Mongo connection failed:", error);
  }
};

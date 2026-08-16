import mongoose from "mongoose";

export default function connectDatabase() {
  return mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/taskflow");
}

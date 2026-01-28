import mongoose from "mongoose";

export const connectDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("Mongodb connected");
    } catch (error) {
        console.error("Mongodb connection error", error);
        // Do not exit, allow server to try starting (or use offline mode)
    }
};

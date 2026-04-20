import mongoose from "mongoose";
const connectDb = async () => {
  try {
    const result = await mongoose.connect(process.env.MONGO_URI);
    console.log(result.models);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(`fail to connect to DB`, error.message);
  }
};
export default connectDb;

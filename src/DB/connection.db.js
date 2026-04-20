import mongoose from "mongoose";
const connectDb = async () => {
  try {
    const result = await mongoose.connect(
      "mongodb+srv://ahmed:0000@cluster0.mik6egh.mongodb.net/SarahaaApp"
    );
    console.log(result.models);
    console.log("DB connected successfully");
  } catch (error) {
    console.log(`fail to connect to DB`, error.message);
  }
};
export default connectDb;

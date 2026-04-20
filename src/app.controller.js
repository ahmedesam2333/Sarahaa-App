import express from "express";
import dotenv from "dotenv";
import connectDb from "./DB/connection.db.js";
import authRoutes from "./auth/auth.route.js";
import { globalErrorHandling } from "./utils/response.js";
const bootsrtap = async () => {
  const app = express();
  const port = 5000;
  dotenv.config();
  //DB
  await connectDb();

  //Convert buffer data
  app.use(express.json());

  //app-routing
  app.get("/", (req, res) => {
    res.json({ message: `Welcome to Sarahaa APP!` });
  });
  app.use("/auth", authRoutes);
  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: `Invalid URL Access` });
  });

  //Global Error Handler
  app.use(globalErrorHandling);

  //listen to server
  app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
  });
};
export default bootsrtap;

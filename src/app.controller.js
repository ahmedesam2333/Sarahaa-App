import express from "express";
import connectDb from "./DB/connection.db.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import { globalErrorHandling } from "./utils/response.js";
import cors from "cors";
import path from "node:path";

const bootsrtap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;

  app.use(cors());

  //DB
  await connectDb();

  //Convert buffer data
  app.use(express.json());

  //static files
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  //app-routing
  app.get("/", (req, res) => {
    res.json({ message: `Welcome to Sarahaa APP! ❤️` });
  });

  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);

  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: `Invalid URL Access ❌` });
  });

  //Global Error Handler
  app.use(globalErrorHandling);

  //listen to server
  return app.listen(port, () => {
    console.log(`Server is running on port ${port} 🚀`);
  });
};
export default bootsrtap;

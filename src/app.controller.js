import express from "express";
import connectDb from "./DB/connection.db.js";
import authRoutes from "./modules/auth/auth.route.js";
import userRoutes from "./modules/user/user.route.js";
import messageRoutes from "./modules/message/message.route.js";
import { globalErrorHandling } from "./utils/response.js";
import cors from "cors";
import path from "node:path";
import morgan from "morgan";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import chalk from "chalk";

const bootsrtap = async () => {
  const app = express();
  const port = process.env.PORT || 5000;

  const limiter = rateLimit({
    windowMs: 60 * 60 * 1000,
    limit: 2000,
    message: { error: "Too many requests, please try again later" },
    handler: (req, res, next, options) => {
      res.status(options.statusCode || 429).json(options.message);
    },
    legacyHeaders: false,
    standardHeaders: "draft-8",
  });

  //secure middlewares
  app.use(cors());
  app.use(helmet());
  app.use(limiter);

  //DB
  await connectDb();

  //Convert buffer data
  app.use(express.json());

  //morgan logger
  app.use(morgan("dev"));

  //static files
  app.use("/uploads", express.static(path.resolve("./src/uploads")));

  //app-routing
  app.get("/", (req, res) => {
    res.json({ message: `Welcome to Sarahaa APP! ❤️` });
  });

  app.use("/auth", authRoutes);
  app.use("/user", userRoutes);
  app.use("/message", messageRoutes);

  app.all("{/*dummy}", (req, res) => {
    res.status(404).json({ message: `Invalid URL Access ❌` });
  });

  //Global Error Handler
  app.use(globalErrorHandling);

  //listen to server
  return app.listen(port, () => {
    console.log(
      chalk.green(chalk.bgBlack(`Server is running on port ${port} 🚀`))
    );
  });
};
export default bootsrtap;

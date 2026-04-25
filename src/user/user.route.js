import express from "express";
import * as userController from "./user.controller.js";
import { authentication } from "../middleware/authentication.middleware.js";
const router = express.Router();
router.get("/", authentication(), userController.getProfile);
export default router;

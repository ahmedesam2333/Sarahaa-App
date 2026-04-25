import express from "express";
import * as userController from "./user.controller.js";
const router = express.Router();
router.get("/:userId", userController.getProfile);
export default router;

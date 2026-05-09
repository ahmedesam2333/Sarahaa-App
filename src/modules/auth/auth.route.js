import express from "express";
import * as authController from "./auth.controller.js";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/gmail", authController.signupOrLoginWithGmail);

export default router;

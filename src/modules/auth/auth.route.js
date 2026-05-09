import express from "express";
import * as authController from "./auth.controller.js";
const router = express.Router();

router.post("/signup", authController.signup);
router.post("/login", authController.login);
router.post("/gmail", authController.signupOrLoginWithGmail);
router.patch("/confirm-email", authController.confirmEmail);
router.patch("/resend-otp", authController.resendOtp);

export default router;

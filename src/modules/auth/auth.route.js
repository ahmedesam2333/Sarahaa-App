import express from "express";
import * as authController from "./auth.controller.js";
import * as validators from "./auth.validation.js";
import { validation } from "./../../middleware/validation.middleware.js";

const router = express.Router();

router.post(
  "/signup",
  validation({ schema: validators.signup }),
  authController.signup
);
router.post(
  "/login",
  validation({ schema: validators.login }),
  authController.login
);
router.post(
  "/gmail",
  validation({ schema: validators.signupOrLoginWithGmail }),
  authController.signupOrLoginWithGmail
);
router.patch(
  "/confirm-email",
  validation({ schema: validators.confirmEmail }),
  authController.confirmEmail
);
router.patch(
  "/resend-otp",
  validation({ schema: validators.resendOtp }),
  authController.resendOtp
);

export default router;

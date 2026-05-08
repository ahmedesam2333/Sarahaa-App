import express from "express";
import * as userController from "./user.controller.js";
import { authentication } from "../../middleware/authentication.middleware.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
const router = express.Router();

router.get("/", authentication(), userController.getProfile);
router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userController.getNewLoginCredentials
);

export default router;

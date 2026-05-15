import express from "express";
import * as userController from "./user.controller.js";
import {
  authentication,
  authorization,
  auth,
} from "../../middleware/auth.middleware.js";
import { endpoint } from "./user.authorization.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
const router = express.Router();

router.get(
  "/",
  auth({ accessRoles: endpoint.profile }),
  userController.getProfile
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userController.getNewLoginCredentials
);

export default router;

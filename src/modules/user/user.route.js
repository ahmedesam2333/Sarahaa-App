import express from "express";
import * as userController from "./user.controller.js";
import {
  authentication,
  authorization,
  auth,
} from "../../middleware/auth.middleware.js";
import { endpoint } from "./user.authorization.js";
import { tokenTypeEnum } from "../../utils/security/token.security.js";
import * as validators from "./user.validation.js";
import { validation } from "./../../middleware/validation.middleware.js";

const router = express.Router();

router.get(
  "/",
  auth({ accessRoles: endpoint.profile }),
  userController.getProfile
);

router.patch(
  "/",
  authentication(),
  validation({ schema: validators.updateBasicProfile }),
  userController.updateBasicProfile
);

router.patch(
  "/password",
  authentication(),
  validation({ schema: validators.updatePassword }),
  userController.updatePassword
);

router.patch(
  "/:userId/restore-account",
  auth({ accessRoles: endpoint.restoreAccount }),
  validation({ schema: validators.restoreAccount }),
  userController.restoreAccount
);

router.delete(
  "/:userId",
  auth({ accessRoles: endpoint.deleteAccount }),
  validation({ schema: validators.deleteAccount }),
  userController.deleteAccount
);

router.delete(
  "{/:userId}/freeze-account",
  authentication(),
  validation({ schema: validators.freezeAccount }),
  userController.freezeAccount
);

router.get(
  "/refresh-token",
  authentication({ tokenType: tokenTypeEnum.refresh }),
  userController.getNewLoginCredentials
);

router.get(
  "/:userId",
  validation({ schema: validators.shareProfile }),
  userController.shareProfile
);

export default router;

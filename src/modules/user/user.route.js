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
import {
  fileValidation,
  localFileUpload,
} from "../../utils/multer/local.multer.js";
import { cloudFileUpload } from "../../utils/multer/cloud.multer.js";
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

router.get(
  "/:userId",
  validation({ schema: validators.shareProfile }),
  userController.shareProfile
);

router.post(
  "/logout",
  authentication(),
  validation({ schema: validators.logout }),
  userController.logout
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
  "/profile-image",
  authentication(),
  cloudFileUpload({
    validation: fileValidation.image,
  }).single("image"),
  validation({ schema: validators.profileImage }),
  userController.uploadProfileImage
);

router.patch(
  "/profile-cover-images",
  authentication(),
  cloudFileUpload({
    validation: fileValidation.image,
  }).array("images", 2),
  validation({ schema: validators.coverImages }),
  userController.uploadProfileCoverImages
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

export default router;

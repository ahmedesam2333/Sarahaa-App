import { Router } from "express";
import * as messageController from "./message.controller.js";
import * as validators from "./message.validation.js";
import { cloudFileUpload } from "./../../utils/multer/cloud.multer.js";
import { fileValidation } from "./../../utils/multer/local.multer.js";
import { validation } from "../../middleware/validation.middleware.js";
import { authentication } from "./../../middleware/auth.middleware.js";
const router = Router({
  caseSensitive: true,
  strict: true,
});

router.post(
  "/:receiverId",
  cloudFileUpload({ validation: fileValidation.image }).array("attachments", 2),
  validation({ schema: validators.sendMessage }),
  messageController.sendMessage
);

router.post(
  "/:receiverId/sender",
  authentication(),
  cloudFileUpload({ validation: fileValidation.image }).array("attachments", 2),
  validation({ schema: validators.sendMessage }),
  messageController.sendMessage
);

router.get("/", authentication(), messageController.listMessages);

router.get(
  "/:messageId",
  authentication(),
  validation({ schema: validators.getMessage }),
  messageController.getMessage
);

router.delete(
  "/freeze-message/:messageId",
  authentication(),
  validation({ schema: validators.freezeMessage }),
  messageController.freezeMessage
);

router.delete(
  "/delete-message/:messageId",
  authentication(),
  validation({ schema: validators.deleteMessage }),
  messageController.deleteMessage
);

router.patch(
  "/restore-message/:messageId",
  authentication(),
  validation({ schema: validators.restoreMessage }),
  messageController.restoreMessage
);

export default router;

import { asyncHandler, successResponse } from "./../../utils/response.js";
import MessageModel from "./../../DB/models/message.model.js";
import userModel from "./../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";
import { uploadFiles } from "./../../utils/multer/cloudinary.js";

export const sendMessage = asyncHandler(async (req, res, next) => {
  if (!req.body.content && !req.files) {
    return next(new Error("Message content or attachments are required"));
  }

  const { receiverId } = req.params;
  const user = await DBService.findOne({
    model: userModel,
    filter: {
      _id: receiverId,
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
  });
  if (!user) {
    return next(
      new Error("User not found or Not Verified Account", { cause: 404 })
    );
  }

  const { content } = req.body;
  let attachments = [];
  if (req.files) {
    attachments = await uploadFiles({
      files: req.files,
      path: `messages/${receiverId}`,
    });
  }
  const [message] = await DBService.create({
    model: MessageModel,
    data: [
      {
        content,
        attachments,
        receiverId,
        senderId: req.user?._id,
      },
    ],
  });

  return successResponse({
    res,
    status: 201,
    message: "Message Sent Successfully",
    data: message,
  });
});

export const listMessages = asyncHandler(async (req, res, next) => {
  return successResponse({
    res,
    data: { messages: req.user.messages },
  });
});

export const getMessage = asyncHandler(async (req, res, next) => {
  const message = await DBService.findOne({
    model: MessageModel,
    filter: {
      _id: req.params.messageId,
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
      deletedAt: { $exists: false },
    },
  });
  if (!message) {
    return next(new Error("Message Not Found", { cause: 404 }));
  }
  return successResponse({
    res,
    data: message,
  });
});

export const freezeMessage = asyncHandler(async (req, res, next) => {
  const message = await DBService.findOneAndUpdate({
    model: MessageModel,
    filter: {
      _id: req.params.messageId,
      receiverId: req.user._id,
      deletedAt: { $exists: false },
    },
    updatedData: {
      $set: {
        deletedAt: Date.now(),
        deletedBy: req.user._id,
      },
    },
  });
  if (!message) {
    return next(
      new Error("Message Not Found or Already Freezed", { cause: 404 })
    );
  }
  return successResponse({
    res,
    status: 204,
  });
});

export const deleteMessage = asyncHandler(async (req, res, next) => {
  const message = await DBService.deleteOne({
    model: MessageModel,
    filter: {
      _id: req.params.messageId,
      receiverId: req.user._id,
      deletedAt: { $exists: true },
    },
  });
  if (!message.deletedCount) {
    return next(
      new Error("Message Not Found or Already Deleted", { cause: 404 })
    );
  }
  return successResponse({
    res,
    status: 204,
  });
});

export const restoreMessage = asyncHandler(async (req, res, next) => {
  const message = await DBService.findOneAndUpdate({
    model: MessageModel,
    filter: {
      _id: req.params.messageId,
      deletedAt: { $exists: true },
      deletedBy: { $eq: req.user._id },
    },
    updatedData: {
      restoredAt: Date.now(),
      restoredBy: req.user._id,
      $unset: { deletedAt: 1, deletedBy: 1 },
    },
  });

  return message
    ? successResponse({ res })
    : next(
        new Error("Message Not Found or Already Restored Message", {
          cause: 404,
        })
      );
});

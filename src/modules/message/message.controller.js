import { successResponse } from "./../../utils/response.js";
import MessageModel from "./../../DB/models/message.model.js";
import userModel from "./../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";
import { uploadFiles } from "./../../utils/multer/cloudinary.js";
import client from "../../utils/openpipe.connect.js";

/**
 * Send a message to a specific user.
 *
 * Note: We are now depending on the Express v5 global async handler automatically.
 * Therefore, we are not using the `next` function (since it is not the right way to pass errors in modern Express)
 * and have replaced it with throwing standard errors.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * // Input:
 * // req.params = { receiverId: '60c72b2f9b1d8b2bad123456' }
 * // req.body = { content: 'Hello there!' }
 * // Output (201 Created):
 * // {
 * //   success: true,
 * //   message: "Message Sent Successfully",
 * //   data: { _id: '...', content: 'Hello there!', receiverId: '...' }
 * // }
 */
export const sendMessage = async (req, res) => {
  if (!req.body.content && !req.files) {
    throw new Error("Message content or attachments are required");
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
    throw new Error("User not found or Not Verified Account", { cause: 404 });
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
};

/**
 * List all messages received or sent by the user.
 *
 * Note: We are now depending on the Express v5 global async handler automatically.
 * Therefore, we are not using the `next` function (since it is not the right way to pass errors in modern Express)
 * and have replaced it with throwing standard errors.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * // Input:
 * // req.user.messages = [{ ... }]
 * // Output (200 OK):
 * // {
 * //   success: true,
 * //   data: { messages: [{ ... }] }
 * // }
 */
export const listMessages = async (req, res) => {
  return successResponse({
    res,
    data: { messages: req.user.messages },
  });
};

/**
 * Retrieve a specific message by its ID if the user is the sender or receiver.
 *
 * Note: We are now depending on the Express v5 global async handler automatically.
 * Therefore, we are not using the `next` function (since it is not the right way to pass errors in modern Express)
 * and have replaced it with throwing standard errors.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * // Input:
 * // req.params = { messageId: '60c72b2f9b1d8b2bad123456' }
 * // Output (200 OK):
 * // {
 * //   success: true,
 * //   data: { _id: '...', content: '...', receiverId: '...' }
 * // }
 */
export const getMessage = async (req, res) => {
  const message = await DBService.findOne({
    model: MessageModel,
    filter: {
      _id: req.params.messageId,
      $or: [{ senderId: req.user._id }, { receiverId: req.user._id }],
      deletedAt: { $exists: false },
    },
  });
  if (!message) {
    throw new Error("Message Not Found", { cause: 404 });
  }
  return successResponse({
    res,
    data: message,
  });
};

/**
 * Freeze (soft-delete) a specific message received by the user.
 *
 * Note: We are now depending on the Express v5 global async handler automatically.
 * Therefore, we are not using the `next` function (since it is not the right way to pass errors in modern Express)
 * and have replaced it with throwing standard errors.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * // Input:
 * // req.params = { messageId: '60c72b2f9b1d8b2bad123456' }
 * // Output (204 No Content)
 */
export const freezeMessage = async (req, res) => {
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
    throw new Error("Message Not Found or Already Freezed", { cause: 404 });
  }
  return successResponse({
    res,
    status: 204,
  });
};

/**
 * Permanently delete a frozen message.
 *
 * Note: We are now depending on the Express v5 global async handler automatically.
 * Therefore, we are not using the `next` function (since it is not the right way to pass errors in modern Express)
 * and have replaced it with throwing standard errors.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * // Input:
 * // req.params = { messageId: '60c72b2f9b1d8b2bad123456' }
 * // Output (204 No Content)
 */
export const deleteMessage = async (req, res) => {
  const message = await DBService.deleteOne({
    model: MessageModel,
    filter: {
      _id: req.params.messageId,
      receiverId: req.user._id,
      deletedAt: { $exists: true },
    },
  });
  if (!message.deletedCount) {
    throw new Error("Message Not Found or Already Deleted", { cause: 404 });
  }
  return successResponse({
    res,
    status: 204,
  });
};

/**
 * Restore a frozen message.
 *
 * Note: We are now depending on the Express v5 global async handler automatically.
 * Therefore, we are not using the `next` function (since it is not the right way to pass errors in modern Express)
 * and have replaced it with throwing standard errors.
 *
 * @param {import('express').Request} req - The Express request object.
 * @param {import('express').Response} res - The Express response object.
 * @returns {Promise<void>}
 *
 * @example
 * // Input:
 * // req.params = { messageId: '60c72b2f9b1d8b2bad123456' }
 * // Output (200 OK):
 * // {
 * //   success: true,
 * //   message: "success"
 * // }
 */
export const restoreMessage = async (req, res) => {
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

  if (!message) {
    throw new Error("Message Not Found or Already Restored Message", {
      cause: 404,
    });
  }

  return successResponse({ res });
};

export const sendChat = async (req, res) => {
  const { chatMessage } = req.body;
  const completion = await client.chat.completions.create({
    model: "openpipe:Sarahaa-App",
    messages: [
      {
        role: "system",
        content:
          'You are Sarahah\'s Toxicity Detection AI.\n\nYour task is to analyze anonymous messages and classify harmful content.\n\nReturn ONLY valid JSON.\n\nCategories:\n- safe\n- insult\n- harassment\n- bullying\n- threat\n- hate_speech\n- sexual_harassment\n- profanity\n- spam\n- self_harm\n\nSeverity:\n- none\n- low\n- medium\n- high\n- critical\n\nActions:\n- allow\n- warn\n- review\n- block\n\nOutput schema:\n{\n  "is_toxic": boolean,\n  "category": string,\n  "severity": string,\n  "confidence": float,\n  "action": string\n}\n\nAlways choose exactly one category.\nReturn only JSON.',
      },
      {
        role: "user",
        content: chatMessage,
      },
    ],
    temperature: 0,
  });

  const result = completion?.choices[0]?.message.content;

  return successResponse({
    res,
    message: "Chat Response",
    data: JSON.parse(result),
  });
};

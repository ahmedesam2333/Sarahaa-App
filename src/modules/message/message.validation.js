import joi from "joi";
import { fileValidation } from "../../utils/multer/local.multer.js";
import { generalFields } from "../../middleware/validation.middleware.js";

export const sendMessage = {
  files: joi
    .array()
    .items({
      fieldname: joi.string().valid("attachments").required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileValidation.image))
        .required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required(),
    })
    .min(0)
    .max(2),
  params: joi
    .object()
    .keys({
      receiverId: generalFields.id.required(),
    })
    .required(),
  body: joi
    .object()
    .keys({
      content: joi.string().min(2).max(20000).required(),
    })
    .required(),
};

export const getMessage = {
  params: joi
    .object()
    .keys({
      messageId: generalFields.id.required(),
    })
    .required(),
};

export const freezeMessage = {
  params: getMessage.params.append().required(),
};

export const deleteMessage = {
  params: getMessage.params.append().required(),
};

export const restoreMessage = {
  params: getMessage.params.append().required(),
};

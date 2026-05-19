import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";
import { logoutEnum } from "../../utils/security/token.security.js";
import { fileValidation } from "../../utils/multer/local.multer.js";

export const shareProfile = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id.required(),
    })
    .required(),
};

export const logout = {
  body: joi
    .object()
    .keys({
      flag: joi
        .string()
        .valid(...Object.values(logoutEnum))
        .default(logoutEnum.stayLoggedIn),
    })
    .required(),
};

export const freezeAccount = {
  params: joi.object().keys({
    userId: generalFields.id,
  }),
};

export const restoreAccount = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id,
    })
    .required(),
};

export const deleteAccount = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id,
    })
    .required(),
};

export const updateBasicProfile = {
  body: joi
    .object()
    .keys({
      fullName: generalFields.fullName,
      phone: generalFields.phone,
      gender: generalFields.gender,
    })
    .required(),
};

export const updatePassword = {
  body: logout.body
    .append({
      oldPassword: generalFields.password.required(),
      newPassword: generalFields.password
        .not(joi.ref("oldPassword"))
        .required(),
    })
    .required(),
};

export const profileImage = {
  file: joi
    .object()
    .keys({
      fieldname: joi.string().valid("image").required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileValidation.image))
        .required(),
      // finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required(),
    })
    .required(),
};

export const coverImages = {
  files: joi
    .array()
    .items({
      fieldname: joi.string().valid("images").required(),
      originalname: joi.string().required(),
      encoding: joi.string().required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileValidation.image))
        .required(),
      // finalPath: joi.string().required(),
      destination: joi.string().required(),
      filename: joi.string().required(),
      path: joi.string().required(),
      size: joi.number().positive().required(),
    })
    .required()
    .min(1)
    .max(2)
    .required(),
};

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
  file: generalFields.file
    .keys({
      fieldname: joi.string().valid("image").required(),
      mimetype: joi
        .string()
        .valid(...Object.values(fileValidation.image))
        .required(),
    })
    .required(),
};

export const coverImages = {
  files: joi
    .array()
    .items(
      generalFields.file.keys({
        fieldname: joi.string().valid("images").required(),
        mimetype: joi
          .string()
          .valid(...Object.values(fileValidation.image))
          .required(),
      })
    )
    .required()
    .min(1)
    .max(2)
    .required(),
};

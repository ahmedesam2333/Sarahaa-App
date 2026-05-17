import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const shareProfile = {
  params: joi
    .object()
    .keys({
      userId: generalFields.id.required(),
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
  body: joi
    .object()
    .keys({
      oldPassword: generalFields.password.required(),
      newPassword: generalFields.password
        .not(joi.ref("oldPassword"))
        .required(),
    })
    .required(),
};

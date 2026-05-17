import joi from "joi";
import { generalFields } from "../../middleware/validation.middleware.js";

export const signup = {
  body: joi
    .object()
    .keys({
      fullName: generalFields.fullName.required(),
      email: generalFields.email.required(),
      password: generalFields.password.required(),
      phone: generalFields.phone.required(),
      gender: generalFields.gender,
      role: generalFields.role,
    })
    .required()
    .options({ allowUnknown: false }),
};

export const login = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      password: generalFields.password.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const forgetPassword = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const verifyForgetPassword = {
  body: forgetPassword.body
    .append({
      otp: generalFields.otp.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const resetPassword = {
  body: verifyForgetPassword.body
    .append({
      password: generalFields.password.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const confirmEmail = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
      otp: generalFields.otp.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const resendOtp = {
  body: joi
    .object()
    .keys({
      email: generalFields.email.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

export const signupOrLoginWithGmail = {
  body: joi
    .object()
    .keys({
      idToken: generalFields.idToken.required(),
    })
    .required()
    .options({ allowUnknown: false }),
};

import { asyncHandler } from "../utils/response.js";
import joi from "joi";
import { Types } from "mongoose";

const validateObjectId = (value, helper) => {
  return Types.ObjectId.isValid(value)
    ? true
    : helper.message("Invalid ObjectId");
};

export const generalFields = {
  fullName: joi
    .string()
    .trim()
    .min(5)
    .max(41)
    .custom((value, helpers) => {
      const parts = value.split(/\s+/);
      if (parts.length < 2)
        return helpers.message(
          "fullName must contain at least first and last name separated by a space"
        );
      if (parts[0].length < 2 || parts[0].length > 20)
        return helpers.message(
          "first name must be between 2 and 20 characters"
        );
      if (parts[1].length < 2 || parts[1].length > 20)
        return helpers.message("last name must be between 2 and 20 characters");
      return value;
    }),
  email: joi
    .string()
    .email({
      minDomainSegments: 2,
      maxDomainSegments: 3,
      tlds: { allow: ["com", "net", "gov", "edu", "org", "io"] },
    })
    .messages({
      "string.email": "Please provide a valid email address",
    }),
  password: joi
    .string()
    .pattern(
      new RegExp(
        "^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@$!%*?&])[A-Za-z\\d@$!%*?&]{8,}$"
      )
    )
    .messages({
      "string.pattern.base":
        "Password must be at least 8 characters long, and contain at least one lowercase letter, one uppercase letter, one number and one special character (@$!%*?&)",
    }),
  phone: joi.string().pattern(new RegExp("^01[0125][0-9]{8}$")).messages({
    "string.pattern.base":
      "Phone number must be a valid Egyptian mobile number starting with 010, 011, 012, or 015",
  }),
  gender: joi.string().valid("male", "female"),
  role: joi.string().valid("user", "admin"),
  provider: joi.string().valid("system", "google"),
  otp: joi
    .string()
    .length(6)
    .pattern(/^[0-9]+$/)
    .messages({
      "string.pattern.base": "OTP must be exactly 6 digits",
      "string.length": "OTP must be exactly 6 digits",
    }),
  idToken: joi.string(),
  id: joi.string().custom(validateObjectId),
  file: joi.object({
    fieldname: joi.string().required(),
    originalname: joi.string().required(),
    encoding: joi.string().required(),
    mimetype: joi.string().required(),
    destination: joi.string().required(),
    filename: joi.string().required(),
    path: joi.string().required(),
    size: joi.number().positive().required(),
  }),
};

export const validation = ({ schema } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const validationError = [];
    for (let key of Object.keys(schema)) {
      const validationResult = schema[key].validate(req[key], {
        abortEarly: false,
      });
      if (validationResult.error) {
        validationError.push({ key, details: validationResult.error.details });
      }
    }
    if (validationError.length) {
      return res
        .status(400)
        .json({ err_message: "Validation Error", validationError });
    }
    return next();
  });
};

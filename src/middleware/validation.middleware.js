import { asyncHandler } from "../utils/response.js";
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

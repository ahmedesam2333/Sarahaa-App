import userModel from "../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import { genDecrypt } from "../../utils/security/encrypt.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";

//getProfile Api
export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = await genDecrypt({ cipherText: req.user.phone });
  return successResponse({ res, data: req.user });
});

//Get New Login Credentials Api
export const getNewLoginCredentials = asyncHandler(async (req, res, next) => {
  const newCredentials = await generateLoginCredentials({
    user: req.user,
  });

  return successResponse({
    res,
    status: 200,
    data: newCredentials,
  });
});

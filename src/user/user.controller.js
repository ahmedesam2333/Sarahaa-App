import userModel from "../DB/models/user.model.js";
import * as DBService from "../DB/db.service.js";
import { asyncHandler, successResponse } from "../utils/response.js";
import { genDecrypt } from "../utils/security/encrypt.security.js";

//getProfile Api
export const getProfile = asyncHandler(async (req, res, next) => {
  const user = await DBService.findById({
    model: userModel,
    id: req.params.userId,
  });
  user.phone = await genDecrypt({ cipherText: user.phone });
  return successResponse({ res, data: user });
});

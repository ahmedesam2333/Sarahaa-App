import { asyncHandler } from "../utils/response.js";
import { verifyToken } from "../utils/security/token.security.js";
import userModel from "../DB/models/user.model.js";
import * as DBService from "../DB/db.service.js";

export const authentication = () => {
  return asyncHandler(async (req, res, next) => {
    const { authorization } = req.headers;
    const decoded = await verifyToken({ token: authorization });
    if (!decoded?._id) return next(new Error("Invalid-Token", { cause: 400 }));
    const user = await DBService.findById({
      model: userModel,
      id: decoded._id,
    });
    if (!user) return next(new Error("User Not Found", { cause: 404 }));
    req.user = user;
    return next();
  });
};

import { asyncHandler } from "../utils/response.js";
import {
  decodeToken,
  tokenTypeEnum,
} from "../utils/security/token.security.js";

export const authentication = ({ tokenType = tokenTypeEnum.access } = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      (await decodeToken({
        next,
        authorization: req.headers?.authorization,
        tokenType,
      })) || {};

    req.user = user;
    req.decoded = decoded;
    return next();
  });
};

export const authorization = ({ accessRoles = [] } = {}) => {
  return asyncHandler(async (req, res, next) => {
    if (!accessRoles.includes(req.user?.role))
      return next(new Error("Unauthorized Account", { cause: 403 }));
    return next();
  });
};

export const auth = ({
  tokenType = tokenTypeEnum.access,
  accessRoles = [],
} = {}) => {
  return asyncHandler(async (req, res, next) => {
    const { user, decoded } =
      await decodeToken({
        next,
        authorization: req.headers?.authorization,
        tokenType,
      }) || {};

    req.user = user;
    req.decoded = decoded;

    if (!accessRoles.includes(req.user?.role)){
      return next(new Error("Unauthorized Account", { cause: 403 }));}
    return next();
  });
};

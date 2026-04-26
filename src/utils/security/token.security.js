import jwt from "jsonwebtoken";
import userModel from "../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";

export const signatureLevelEnum = { bearer: "Bearer", admin: "Admin" };
export const tokenTypeEnum = { access: "access", refresh: "refresh" };

export const genAccessToken = async ({
  payload = {},
  signature = process.env.JWT_ACCESS_USER_KEY,
  options = { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const genRefreshToken = async ({
  payload = {},
  signature = process.env.JWT_REFRESH_USER_KEY,
  options = { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = process.env.JWT_REFRESH_USER_KEY,
} = {}) => {
  return jwt.verify(token, signature);
};

export const getSignatures = async ({
  signatureLevel = signatureLevelEnum.bearer,
} = {}) => {
  let signatures = { accessSignature: undefined, refreshSignature: undefined };
  switch (signatureLevel) {
    case signatureLevelEnum.admin:
      signatures.accessSignature = process.env.JWT_ACCESS_ADMIN_KEY;
      signatures.refreshSignature = process.env.JWT_REFRESH_ADMIN_KEY;
      break;
    default:
      signatures.accessSignature = process.env.JWT_ACCESS_USER_KEY;
      signatures.refreshSignature = process.env.JWT_REFRESH_USER_KEY;
  }
  return signatures;
};

export const decodeToken = async ({
  next,
  authorization = "",
  tokenType = tokenTypeEnum.access,
} = {}) => {
  const [Bearer, token] = authorization?.split(" ") || [];

  if (!Bearer || !token)
    return next(new Error("Missing-Token-Parts", { cause: 401 }));
  let signatures = await getSignatures({
    signatureLevel: Bearer,
  });
  const decoded = await verifyToken({
    token,
    signature:
      tokenType === tokenTypeEnum.access
        ? signatures.accessSignature
        : signatures.refreshSignature,
  });
  if (!decoded?._id) return next(new Error("Invalid-Token", { cause: 400 }));

  const user = await DBService.findById({
    model: userModel,
    id: decoded._id,
  });
  if (!user) return next(new Error("User Not Found", { cause: 404 }));
  return user;
};

export const generateLoginCredentials = async ({ user } = {}) => {
  let signatures = await getSignatures({
    signatureLevel:
      user.role !== "user"
        ? signatureLevelEnum.admin
        : signatureLevelEnum.bearer,
  });
  const access_token = await genAccessToken({
    payload: { _id: user._id },
    signature: signatures.accessSignature,
  });
  const refresh_token = await genRefreshToken({
    payload: { _id: user._id },
    signature: signatures.refreshSignature,
  });
  return { access_token, refresh_token };
};

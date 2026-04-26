import jwt from "jsonwebtoken";

export const genAccessToken = async ({
  payload = {},
  signature = process.env.JWT_ACCESS_KEY,
  options = { expiresIn: process.env.JWT_ACCESS_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const genRefreshToken = async ({
  payload = {},
  signature = process.env.JWT_REFRESH_KEY,
  options = { expiresIn: process.env.JWT_REFRESH_EXPIRES_IN },
} = {}) => {
  return jwt.sign(payload, signature, options);
};

export const verifyToken = async ({
  token = "",
  signature = process.env.JWT_ACCESS_KEY,
} = {}) => {
  return jwt.verify(token, signature);
};

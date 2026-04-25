import userModel from "../DB/models/user.model.js";
import * as DBService from "../DB/db.service.js";
import { asyncHandler, successResponse } from "../utils/response.js";
import { generateHash, compareHash } from "../utils/security/hash.security.js";
import { genEncrypt } from "../utils/security/encrypt.security.js";
import {
  genAccessToken,
  genRefreshToken,
  verifyToken,
} from "../utils/security/token.security.js";

//Register Api
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone } = req.body;
  if (await DBService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }
  const hashedPassword = await generateHash({ plainText: password });
  const encPhone = await genEncrypt({ plainText: phone });
  const refresh_token = await genRefreshToken({
    payload: { email },
  });
  const user = await DBService.create({
    model: userModel,
    data: [
      {
        fullName,
        email,
        password: hashedPassword,
        gender,
        phone: encPhone,
        refresh_token,
      },
    ],
  });
  const access_token = await genAccessToken({
    payload: { _id: user._id },
  });
  return successResponse({
    res,
    message: "User created successfully",
    status: 201,
    data: { access_token, user },
  });
});

//Login Api
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({
    model: userModel,
    filter: { email },
  });
  if (!user) {
    return next(new Error("Invalid email or password", { cause: 404 }));
  }
  const match = await compareHash({
    plainText: password,
    hashedPassword: user.password,
  });
  if (!match) {
    return next(new Error("Invalid email or password", { cause: 404 }));
  }
  const access_token = await genAccessToken({ payload: { _id: user._id } });
  return successResponse({
    res,
    status: 200,
    message: "User Logged in successfully",
    data: { access_token },
  });
});

//getNewAccesTocken Api
export const getAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return next(new Error("Refresh Token is required", { cause: 400 }));

  const verify = await verifyToken({
    token: refreshToken,
    signature: process.env.JWT_REFRESH_KEY,
  });

  if (!verify?.email)
    return next(new Error("Invalid Refresh Token", { cause: 400 }));

  const user = await DBService.findOne({
    model: userModel,
    filter: { email: verify.email },
  });
  if (!user) return next(new Error("User not found", { cause: 404 }));
  const isTokenValid = user.refresh_token === refreshToken;
  if (!isTokenValid)
    return next(new Error("Invalid Refresh Token", { cause: 401 }));

  const access_token = await genAccessToken({ payload: { _id: user._id } });
  const refresh_token = await genRefreshToken({
    payload: { email: user.email },
  });
  await DBService.findByIdAndUpdate({
    model: userModel,
    id: user._id,
    updatedData: { refresh_token },
  });

  return successResponse({
    res,
    status: 200,
    data: { access_token, refresh_token },
  });
});

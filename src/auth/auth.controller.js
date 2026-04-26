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
  const user = await DBService.create({
    model: userModel,
    data: [
      {
        fullName,
        email,
        password: hashedPassword,
        gender,
        phone: encPhone,
      },
    ],
  });
  return successResponse({
    res,
    message: "User created successfully",
    status: 201,
    data: { user },
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
  const refresh_token = await genRefreshToken({ payload: { _id: user._id } });
  return successResponse({
    res,
    status: 200,
    message: "User Logged in successfully",
    data: { access_token, refresh_token },
  });
});

//Get New Access Token Api
export const getAccessToken = asyncHandler(async (req, res, next) => {
  const { refreshToken } = req.body;
  if (!refreshToken)
    return next(new Error("Refresh Token is required", { cause: 400 }));

  const verify = await verifyToken({
    token: refreshToken,
    signature: process.env.JWT_REFRESH_KEY,
  });

  if (!verify?._id)
    return next(new Error("Invalid Refresh Token", { cause: 400 }));

  const user = await DBService.findById({
    model: userModel,
    id: verify._id,
  });

  if (!user) return next(new Error("User not found", { cause: 404 }));

  const access_token = await genAccessToken({ payload: { _id: user._id } });

  return successResponse({
    res,
    status: 200,
    data: { access_token, refresh_token: refreshToken },
  });
});

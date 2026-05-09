import userModel, { providerEnum } from "../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import {
  generateHash,
  compareHash,
} from "../../utils/security/hash.security.js";
import { genEncrypt } from "../../utils/security/encrypt.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import { OAuth2Client } from "google-auth-library";

//Register Api
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone, role } = req.body;
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
        role,
      },
    ],
  });
  const credentials = await generateLoginCredentials({
    user,
  });
  return successResponse({
    res,
    message: "User created successfully",
    status: 201,
    data: credentials,
  });
});

//Login Api
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await DBService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum[0] },
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
  const credentials = await generateLoginCredentials({
    user,
  });
  return successResponse({
    res,
    status: 200,
    message: `${
      user.role === "user" ? "User" : "Admin"
    } Logged in successfully`,
    data: credentials,
  });
});

async function verifyGoogle({ idToken } = {}) {
  const client = new OAuth2Client();
  const ticket = await client.verifyIdToken({
    idToken,
    audience: process.env.WEB_CLIENT_IDS.split(","),
  });
  const payload = ticket.getPayload();
  return payload;
}

export const signupOrLoginWithGmail = asyncHandler(async (req, res, next) => {
  const { idToken } = req.body;
  const { name, email, picture, email_verified } = await verifyGoogle({
    idToken,
  });

  if (!email_verified) {
    return next(new Error("Email Not Verified", { cause: 401 }));
  }
  const user = await DBService.findOne({ model: userModel, filter: { email } });
  if (user) {
    if (user.provider === providerEnum[1]) {
      const credentials = await generateLoginCredentials({
        user,
      });
      return successResponse({
        res,
        status: 200,
        data: credentials,
      });
    }
    return next(new Error("Email Exist", { cause: 409 }));
  }

  const newUser = await DBService.create({
    model: userModel,
    data: [
      {
        fullName: name,
        email,
        confirmEmail: Date.now(),
        picture,
        provider: providerEnum[1],
      },
    ],
  });
  const credentials = await generateLoginCredentials({
    user: newUser,
  });
  return successResponse({
    res,
    message: "User created successfully",
    status: 201,
    data: credentials,
  });
});

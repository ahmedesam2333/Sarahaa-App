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
import { emailEvent } from "../../utils/events/email.event.js";
import { checkOtpAge, generateOtp } from "../../utils/security/otp.security.js";

//Register Api
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone, role } = req.body;
  if (await DBService.findOne({ model: userModel, filter: { email } })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }
  const hashedPassword = await generateHash({ plainText: password });
  const encPhone = await genEncrypt({ plainText: phone });
  const { otp, hashedOtp: confirmEmailOtp } = await generateOtp();

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
        confirmEmailOtp,
        otpDate: Date.now(),
      },
    ],
  });

  emailEvent.emit("confirmEmail", { to: email, otp });

  return successResponse({
    res,
    message: "User created successfully and Please check your email to verify",
    status: 201,
  });
});

//Confirm Email Api
export const confirmEmail = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      otpDate: { $exists: true },
    },
  });
  if (!user) {
    return next(
      new Error("Invalid Email or Has Been Confirmed Before", { cause: 404 })
    );
  }

  const matchOtp = await compareHash({
    plainText: otp,
    hashed: user.confirmEmailOtp,
  });
  if (!matchOtp) return next(new Error("Invalid OTP"));

  if (await checkOtpAge({ caller: "confirmEmail", user })) {
    return next(new Error("OTP has expired, please request a new one"));
  }

  const newUser = await DBService.findByIdAndUpdate({
    model: userModel,
    id: user._id,
    updatedData: {
      confirmEmail: Date.now(),
      $unset: {
        confirmEmailOtp: true,
        otpDate: true,
      },
      $inc: { __v: 1 },
    },
  });

  return successResponse({
    res,
    message: "Email Verified Successfully",
    data: newUser,
  });
});

//Resend OTP
export const resendOtp = asyncHandler(async (req, res, next) => {
  const { email } = req.body;

  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      confirmEmail: { $exists: false },
      confirmEmailOtp: { $exists: true },
      otpDate: { $exists: true },
    },
  });

  if (!user) {
    return next(
      new Error("Invalid Email or Already Confirmed", { cause: 404 })
    );
  }

  const now = Date.now();

  const waitSecs = await checkOtpAge({ caller: "resend", user });
  if (waitSecs)
    return next(
      new Error(
        `Please wait ${Math.ceil(waitSecs / 60)} mins before resending.`
      )
    );

  const { otp, hashedOtp: confirmEmailOtp } = await generateOtp();

  await DBService.findByIdAndUpdate({
    model: userModel,
    id: user._id,
    updatedData: {
      confirmEmailOtp,
      otpDate: now,
    },
  });

  emailEvent.emit("confirmEmail", { to: email, otp });

  return successResponse({
    res,
    message: "OTP resent successfully check your email",
  });
});

//Login Api
export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await DBService.findOne({
    model: userModel,
    filter: { email, provider: providerEnum[0], deletedAt: { $exists: false } },
  });
  if (!user) {
    return next(new Error("Invalid email or password", { cause: 404 }));
  }

  if (!user.confirmEmail) {
    return next(new Error("Please verify your account", { cause: 401 }));
  }
  if (user.deletedAt) {
    return next(new Error("this Account is deleted", { cause: 401 }));
  }

  const match = await compareHash({
    plainText: password,
    hashed: user.password,
  });
  if (!match) {
    return next(new Error("Invalid email or password", { cause: 404 }));
  }

  const credentials = await generateLoginCredentials({
    user,
  });
  return successResponse({
    res,
    message: `${
      user.role === "user" ? "User" : "Admin"
    } Logged in successfully`,
    data: credentials,
  });
});

//Forget Password Api
export const forgetPassword = asyncHandler(async (req, res, next) => {
  const { email } = req.body;
  const { hashedOtp, otp } = await generateOtp();

  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: {
      email,
      provider: providerEnum[0],
      deletedAt: { $exists: false },
      confirmEmail: { $exists: true },
    },
    updatedData: {
      forgetPasswordOtp: hashedOtp,
    },
  });

  if (!user) {
    return next(new Error("Email Not Found OR Not Verified", { cause: 404 }));
  }
  emailEvent.emit("forgetPassword", {
    to: email,
    otp,
    subject: "Forget Password OTP",
    title: "Reset Password",
  });

  return successResponse({
    res,
    message: " Please check your email for the OTP to reset your password",
  });
});

//Verify Forget Password Api
export const verifyForgetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp } = req.body;

  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum[0],
      deletedAt: { $exists: false },
      forgetPasswordOtp: { $exists: true },
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("Email Not Found", { cause: 404 }));
  }

  if (
    !(await compareHash({ plainText: otp, hashed: user.forgetPasswordOtp }))
  ) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  return successResponse({
    res,
    message: "OTP Verified Successfully, You Can Now Reset Your Password",
  });
});

//Reset Forget Password Api
export const resetPassword = asyncHandler(async (req, res, next) => {
  const { email, otp, password } = req.body;

  const user = await DBService.findOne({
    model: userModel,
    filter: {
      email,
      provider: providerEnum[0],
      deletedAt: { $exists: false },
      forgetPasswordOtp: { $exists: true },
      confirmEmail: { $exists: true },
    },
  });

  if (!user) {
    return next(new Error("Email Not Found", { cause: 404 }));
  }

  if (
    !(await compareHash({ plainText: otp, hashed: user.forgetPasswordOtp }))
  ) {
    return next(new Error("Invalid OTP", { cause: 400 }));
  }

  await DBService.findByIdAndUpdate({
    model: userModel,
    id: user._id,
    updatedData: {
      password: await generateHash({ plainText: password }),
      changeCredentialsTime: new Date(),
      $unset: { forgetPasswordOtp: 1 },
    },
  });

  return successResponse({
    res,
    message:
      "Password Reset Successfully, You Can Now Login With Your New Password",
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

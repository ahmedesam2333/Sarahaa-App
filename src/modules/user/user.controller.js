import userModel, { roleEnum } from "../../DB/models/user.model.js";
import * as DBService from "../../DB/db.service.js";
import { asyncHandler, successResponse } from "../../utils/response.js";
import {
  genDecrypt,
  genEncrypt,
} from "../../utils/security/encrypt.security.js";
import { generateLoginCredentials } from "../../utils/security/token.security.js";
import {
  compareHash,
  generateHash,
} from "../../utils/security/hash.security.js";

//Get Profile Api
export const getProfile = asyncHandler(async (req, res, next) => {
  req.user.phone = await genDecrypt({ cipherText: req.user.phone });
  return successResponse({ res, data: req.user });
});

//Share Profile Api
export const shareProfile = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  const user = await DBService.findOne({
    model: userModel,
    filter: { _id: userId, confirmEmail: { $exists: true } },
    projection: { firstName: 1, lastName: 1, fullName: 1, email: 1 },
  });
  return user
    ? successResponse({ res, data: user })
    : next(new Error("Invalid Account", { cause: 404 }));
});

//Update Profile Api
export const updateBasicProfile = asyncHandler(async (req, res, next) => {
  if (req.body.phone) {
    req.body.phone = await genEncrypt({ plainText: req.body.phone });
  }
  const user = await DBService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updatedData: { ...req.body, phone: req.body.phone },
  });
  return user
    ? successResponse({ res, data: user })
    : next(new Error("User Not Found", { cause: 404 }));
});

//Update Password Api
export const updatePassword = asyncHandler(async (req, res, next) => {
  const match = await compareHash({
    plainText: req.body.oldPassword,
    hashed: req.user.password,
  });
  if (!match) return next(new Error("Invalid Old Password", { cause: 400 }));

  if (req.user.oldPasswords?.length) {
    for (let hash of req.user.oldPasswords) {
      if (await compareHash({ plainText: req.body.newPassword, hashed: hash }))
        return next(
          new Error("New Password Should Not Be Same As Old Passwords", {
            cause: 409,
          })
        );
    }
  }

  const hashedPassword = await generateHash({
    plainText: req.body.newPassword,
  });

  const user = await DBService.findByIdAndUpdate({
    model: userModel,
    id: req.user._id,
    updatedData: {
      password: hashedPassword,
      $push: { oldPasswords: req.user.password },
    },
  });

  return user
    ? successResponse({
        res,
        message: "Password Updated Successfully",
        data: user,
      })
    : next(new Error("User Not Found", { cause: 404 }));
});

//Freeze Account Api
export const freezeAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;
  if (userId && req.user.role !== roleEnum[1]) {
    return next(new Error("Unauthorized Access", { cause: 403 }));
  }

  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: { _id: userId || req.user._id, deletedAt: { $exists: false } },
    updatedData: {
      deletedAt: Date.now(),
      deletedBy: req.user._id,
      $unset: { restoredAt: 1, restoredBy: 1 },
    },
  });

  return user
    ? successResponse({ res, status: 204 })
    : next(
        new Error("User Not Found or Already Freezed Account", { cause: 404 })
      );
});

//Restore Account Api
export const restoreAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await DBService.findOneAndUpdate({
    model: userModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
      deletedBy: { $ne: userId },
    },
    updatedData: {
      restoredAt: Date.now(),
      restoredBy: req.user._id,
      $unset: { deletedAt: 1, deletedBy: 1 },
    },
  });

  return user
    ? successResponse({ res })
    : next(
        new Error("User Not Found or Already Restored Account", {
          cause: 404,
        })
      );
});

//Hard Delete Account Api
export const deleteAccount = asyncHandler(async (req, res, next) => {
  const { userId } = req.params;

  const user = await DBService.deleteOne({
    model: userModel,
    filter: {
      _id: userId,
      deletedAt: { $exists: true },
    },
  });

  return user.deletedCount
    ? successResponse({ res, status: 204 })
    : next(
        new Error("User Not Found or Already Deleted", {
          cause: 404,
        })
      );
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

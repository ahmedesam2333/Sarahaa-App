import userModel from "../DB/models/user.model.js";
import { asyncHandler } from "../utils/response.js";
export const signup = asyncHandler(async (req, res, next) => {
  const { fullName, email, password, gender, phone } = req.body;
  if (await userModel.findOne({ email })) {
    return next(new Error("Email already exists", { cause: 409 }));
  }
  const user = await userModel.create({
    fullName,
    email,
    password,
    gender,
    phone,
  });
  return res.status(201).json({ message: "User created successfully", user });
});

export const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;
  const user = await userModel.findOne({ email, password });
  if (!user) {
    return next(new Error("Invalid email or password", { cause: 404 }));
  }
  return res.status(200).json({ message: "User Logged in successfully", user });
});

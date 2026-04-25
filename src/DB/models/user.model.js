import mongoose from "mongoose";
const genderEnum = ["male", "female"];
const userSchema = new mongoose.Schema(
  {
    firstName: {
      type: String,
      required: true,
      minLength: [2, "first name must be at least 2 characters"],
      maxLength: [20, "first name must be at most 20 characters"],
    },
    lastName: {
      type: String,
      required: true,
      minLength: [2, "last name must be at least 2 characters"],
      maxLength: [20, "last name must be at most 20 characters"],
    },
    email: {
      type: String,
      required: true,
      unique: [true, "email must be unique"],
    },
    password: {
      type: String,
      required: true,
    },
    gender: {
      type: String,
      enum: {
        values: genderEnum,
        message: `Gender allows only ${genderEnum[0]} or ${genderEnum[1]}`,
      },
      default: genderEnum[0],
    },
    phone: String,
    confirmEmail: Date,
    refresh_token: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);
userSchema
  .virtual("fullName")
  .set(function (value) {
    const [firstName, lastName] = value?.split(" ") || [];
    this.set({ firstName, lastName });
  })
  .get(function () {
    return `${this.firstName} ${this.lastName}`;
  });
const userModel = mongoose.models.User || mongoose.model("User", userSchema);
export default userModel;
userModel.syncIndexes();

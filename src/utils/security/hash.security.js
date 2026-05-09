import bcrypt from "bcryptjs";

export const generateHash = async ({
  plainText = "",
  salt = process.env.SALT_ROUND,
} = {}) => {
  const hash = bcrypt.hashSync(plainText, parseInt(salt));
  return hash;
};

export const compareHash = async ({ plainText = "", hashed = "" } = {}) => {
  const match = bcrypt.compareSync(plainText, hashed);
  return match;
};

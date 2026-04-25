import bcrypt from "bcryptjs";
export const generateHash = async ({ plainText = "", salt = 12 } = {}) => {
  const hash = bcrypt.hashSync(plainText, parseInt(salt));
  return hash;
};
export const compareHash = async ({
  plainText = "",
  hashedPassword = "",
} = {}) => {
  const match = bcrypt.compareSync(plainText, hashedPassword);
  return match;
};

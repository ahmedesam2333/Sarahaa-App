import CryptoJS from "crypto-js";

export const genEncrypt = async ({
  plainText = "",
  secretKey = process.env.AES_SECRET_KEY,
} = {}) => {
  return CryptoJS.AES.encrypt(plainText, secretKey).toString();
};

export const genDecrypt = async ({
  cipherText = "",
  secretKey = process.env.AES_SECRET_KEY,
} = {}) => {
  return CryptoJS.AES.decrypt(cipherText, secretKey).toString(
    CryptoJS.enc.Utf8
  );
};

import { customAlphabet } from "nanoid";
import { generateHash } from "../../utils/security/hash.security.js";

export const generateOtp = async () => {
  const otp = customAlphabet("0123456789", 6)();
  const hashedOtp = await generateHash({ plainText: otp });
  return { otp, hashedOtp };
};

export const checkOtpAge = async ({ caller = "", user } = {}) => {
  const otpAge = Date.now() - new Date(user.otpDate).getTime();
  switch (caller) {
    case "confirmEmail":
      if (otpAge > 60000 * 2) {
        return true;
      }
      break;
    default:
      if (otpAge < 60000 * 2) {
        const waitSecs = Math.ceil((60000 * 2 - otpAge) / 1000);
        return waitSecs;
      }
      break;
  }
};

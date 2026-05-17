import { roleEnum } from "../../DB/models/user.model.js";

export const endpoint = {
  profile: roleEnum,
  restoreAccount: roleEnum[1],
  deleteAccount: roleEnum[1],
};

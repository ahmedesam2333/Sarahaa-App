import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { confirmEmailTemplate } from "../email/templates/ConfirmEmail.template.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data = {}) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirm-Email",
    html: confirmEmailTemplate({ otp: data.otp }),
  }).catch((error) => {
    console.log("Fail to send the email", error);
  });
});

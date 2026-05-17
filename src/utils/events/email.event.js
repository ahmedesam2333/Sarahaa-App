import { EventEmitter } from "node:events";
import { sendEmail } from "../email/send.email.js";
import { emailTemplate } from "../email/templates/Email.template.js";

export const emailEvent = new EventEmitter();

emailEvent.on("confirmEmail", async (data = {}) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirm-Email",
    html: emailTemplate({ otp: data.otp }),
  }).catch((error) => {
    console.log("Fail to send the email", error);
  });
});

emailEvent.on("forgetPassword", async (data = {}) => {
  await sendEmail({
    to: data.to,
    subject: data.subject || "Confirm-Email",
    html: emailTemplate({ otp: data.otp, title: data.title }),
  }).catch((error) => {
    console.log("Fail to send the email", error);
  });
});

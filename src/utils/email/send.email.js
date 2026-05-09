import nodemailer from "nodemailer";

export async function sendEmail({
  from = process.env.APP_EMAIL,
  to = "",
  cc = "",
  bcc = "",
  subject = "Sarahaa App",
  text = "",
  html = "",
  attachments = [],
} = {}) {
  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.APP_EMAIL,
      pass: process.env.APP_PASSWORD,
    },
  });

  const info = await transporter.sendMail({
    from: `"Sarahaa App" <${from}>`,
    to,
    cc,
    bcc,
    subject,
    text,
    html,
    attachments,
  });
}

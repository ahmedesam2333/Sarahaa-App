export const confirmEmailTemplate = ({
  otp,
  title = "Confirm your email",
} = {}) => {
  return `<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"/><meta name="viewport" content="width=device-width,initial-scale=1.0"/></head>
<body style="margin:0;padding:32px 16px;background:#0d0d14;font-family:'Segoe UI',sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0"><tr><td align="center">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width:460px;background:#13131f;border-radius:16px;overflow:hidden;border:1px solid #1e1e30;">

      <!-- accent bar -->
      <tr><td style="background:linear-gradient(90deg,#6c47ff,#a78bfa,#60a5fa);height:3px;font-size:0;">&nbsp;</td></tr>

      <!-- header -->
      <tr><td align="center" style="padding:28px 32px 20px;">
        <p style="margin:0;font-size:20px;font-weight:700;color:#f0eeff;">🕵️ Sarahaa</p>
        <p style="margin:4px 0 0;font-size:11px;color:#6b6b8a;letter-spacing:2px;text-transform:uppercase;">${title}</p>
      </td></tr>

      <!-- divider -->
      <tr><td style="padding:0 32px;"><div style="height:1px;background:#1e1e30;"></div></td></tr>

      <!-- body -->
      <tr><td style="padding:28px 32px;">
        <p style="margin:0 0 20px;font-size:14px;color:#9090b0;line-height:1.6;">
          Use the code below to verify your email. Valid for <strong style="color:#a78bfa;">2 minutes</strong>.
        </p>

        <!-- OTP -->
        <table width="100%" cellpadding="0" cellspacing="0"><tr>
          <td align="center" style="background:#1a1a2e;border:1px solid #3b2f6e;border-radius:12px;padding:20px;">
            <p style="margin:0 0 4px;font-size:10px;color:#6c47ff;letter-spacing:3px;text-transform:uppercase;">OTP Code</p>
            <p style="margin:0;font-size:36px;font-weight:800;letter-spacing:10px;color:#f0eeff;font-family:'Courier New',monospace;">{${otp}}</p>
          </td>
        </tr></table>

        <p style="margin:16px 0 0;font-size:12px;color:#4a4a6a;">
          🔒 Never share this code. If you didn't sign up, ignore this email.
        </p>
      </td></tr>

      <!-- footer -->
      <tr><td align="center" style="padding:16px 32px 24px;border-top:1px solid #1e1e30;">
        <p style="margin:0;font-size:11px;color:#4a4a6a;">© 2025 Sarahaa · All rights reserved</p>
      </td></tr>

    </table>
  </td></tr></table>
</body>
</html>`;
};

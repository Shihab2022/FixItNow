import nodemailer, { Transporter } from "nodemailer";
import config from "../config";
let transporter: Transporter;

try {
  transporter = nodemailer.createTransport({
    host: config?.smtp?.host,
    port: config?.smtp?.port,
    secure: true, // true for port 465
    auth: {
      user: config?.smtp?.user_name,
      pass: config?.smtp?.password,
    },
  });
} catch (err) {
  console.error("Error creating Nodemailer transporter:", err);
  throw err;
}
transporter.verify((error, success) => {
  if (error) {
    console.error('[SMTP Verification Error]:', error);
  } else {
    console.log('[SMTP Ready] Transporter can send messages');
  }
});
export default transporter;

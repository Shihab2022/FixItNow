import nodemailer, { Transporter } from "nodemailer";
import config from "../config";
let transporter: Transporter;

try {
  transporter = nodemailer.createTransport({
    host: "smtp.gmail.com",
    port: 465,
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

export default transporter;

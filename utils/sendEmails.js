import nodemailer from "nodemailer";
import { activateEmailTemplate } from "../emails/activateEmailTemplate";

const {
  SENDER_EMAIL_ADDRESS,
  SENDER_EMAIL_PASSWORD,
} = process.env;

// Validate email configuration
if (!SENDER_EMAIL_ADDRESS || !SENDER_EMAIL_PASSWORD) {
  console.error("❌ EMAIL CONFIGURATION ERROR:");
  console.error("Missing required environment variables:");
  if (!SENDER_EMAIL_ADDRESS) {
    console.error("  - SENDER_EMAIL_ADDRESS is not set");
  }
  if (!SENDER_EMAIL_PASSWORD) {
    console.error("  - SENDER_EMAIL_PASSWORD is not set");
  }
  console.error("\n📝 Please add these to your .env.local or .env file:");
  console.error("   SENDER_EMAIL_ADDRESS=your-email@gmail.com");
  console.error("   SENDER_EMAIL_PASSWORD=your-16-digit-app-password");
  console.error("\n📖 See HUONG_DAN_CAU_HINH_EMAIL_APP_PASSWORD.md for instructions\n");
}

// Send email using App Password
export const sendEmail = (to, url, txt, subject, template) => {
  // Check if credentials are available
  if (!SENDER_EMAIL_ADDRESS || !SENDER_EMAIL_PASSWORD) {
    const error = new Error(
      "Email configuration is missing. Please set SENDER_EMAIL_ADDRESS and SENDER_EMAIL_PASSWORD in your .env file."
    );
    console.error("Error sending email:", error.message);
    return Promise.reject(error);
  }

  const smtpTransport = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: SENDER_EMAIL_ADDRESS,
      pass: SENDER_EMAIL_PASSWORD, // App Password từ Google
    },
  });
  
  // Use custom template if provided, otherwise use default activation template
  const htmlContent = template || activateEmailTemplate(to, url);
  
  const mailOptions = {
    from: SENDER_EMAIL_ADDRESS,
    to: to,
    subject: subject,
    html: htmlContent,
  };
  
  return new Promise((resolve, reject) => {
    smtpTransport.sendMail(mailOptions, (err, info) => {
      if (err) {
        console.error("Error sending email:", err);
        reject(err);
      } else {
        console.log("Email sent successfully:", info);
        resolve(info);
      }
    });
  });
};
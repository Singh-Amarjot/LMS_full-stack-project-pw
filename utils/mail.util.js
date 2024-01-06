// importing nodemailer
import nodemailer from "nodemailer";

const sendMail = (subject, message, email) => {
  // creating a transporter
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: false, // true for 465 port and false for all others
    auth: {
      user: process.env.SMTP_USERNAME,
      pass: process.env.SMTP_PASSWORD,
    },
  });

  // sending mail with the transporter
  transporter.sendMail({
    from: process.env.SENDER_EMAIL_ADDRESS,
    to: email,
    subject: subject,
    html: message,
  });
};

// exporting the sendMail utility
export default sendMail;

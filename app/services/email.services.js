const nodemailer = require("nodemailer");
const dotenv = require("dotenv");

dotenv.config();

// Function to send verification email
function sendVerificationEmail(email) {
  return new Promise((resolve, reject) => {
    // Create reusable transporter object using SMTP transport
    let transporter = nodemailer.createTransport({
      host: "smtp.zoho.com",
      port: 587,
      secure: false,
      auth: {
        user: process.env.AUTH_EMAIL,
        pass: process.env.AUTH_PASS,
      },
    });

    transporter.verify((error, success) => {
      if (error) {
        console.log(error);
      } else {
        console.log("Email connected:", success);
      }
    });

    // Send mail with defined transport object
    transporter.sendMail(
      {
        from: "mochammadsk@zohomail.com",
        to: email,
        subject: "Account Verification",
        html: "<p>Please click the following link to verify your account: <a href='http://yourwebsite.com/verify'>Verify Email</a></p>",
      },
      (error, info) => {
        if (error) {
          reject(error);
        } else {
          resolve(info);
        }
      }
    );
  });
}

module.exports = sendVerificationEmail;

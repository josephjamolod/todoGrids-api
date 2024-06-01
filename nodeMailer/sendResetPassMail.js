const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: "smtp.gmail.com",
  port: 465,
  secure: true,
  auth: {
    user: "josephjam627@gmail.com",
    pass: process.env.EMAIL_PASS,
  },
});

const sendResetPasswordMail = (user) => {
  const mailOptions = {
    from: '"todoApp" <josephjam627@gmail.com>', // sender address
    to: user.email, // list of receivers
    subject: "Reset Password", // Subject line
    html: `<p>Hello ${user.name}, reset your password here </p>
    <a href="${process.env.CLIENT_URL}/app/reset-password/${user._id}">Reset Your Password</a>`, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email for reset password Sent");
    }
  });
};

module.exports = { sendResetPasswordMail };

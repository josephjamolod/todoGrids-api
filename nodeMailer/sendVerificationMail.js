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

const sendVerificationMail = (user) => {
  const mailOptions = {
    from: '"todoApp" <josephjam627@gmail.com>', // sender address
    to: user.email, // list of receivers
    subject: "Verify your Email", // Subject line
    html: `<p>Hello ${user.name}, verify your email by clicking this link:</p>
    <a href="${process.env.CLIENT_URL}/app/verify-email/${user.emailToken}">Verify Your Email</a>`, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Verification Email Sent");
    }
  });
};

module.exports = { sendVerificationMail };

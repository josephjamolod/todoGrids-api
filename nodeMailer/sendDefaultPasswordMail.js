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

const sendDefaultPasswordMail = (user) => {
  const mailOptions = {
    from: '"todoApp" <josephjam627@gmail.com>', // sender address
    to: user.email, // list of receivers
    subject: "Default Password", // Subject line
    html: `<p>Hello ${user.name}, here's your default password. Please don't share this with anyone:</p>
    <h1>${user.password}</h1>`, // html body
  };

  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      console.log(error);
    } else {
      console.log("Email for default password Sent");
    }
  });
};

module.exports = { sendDefaultPasswordMail };

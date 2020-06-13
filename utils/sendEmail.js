const nodemailer = require("nodemailer");

const sendEmail = async function (options) {
  let transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    auth: {
      user: process.env.SMTP_EMAIL,
      pass: process.env.SMTP_PASSWORD, // generated ethereal password
    },
  });

  // send mail with defined transport object
  let message = {
    from: `${process.env.FROM_NAME} <${process.env.FROM_EMAIL}>}`, // sender address
    to: options.email, // list of receivers
    subject: options.subject,
    text: options.message, // plain text body
    html: options.html,
  };

  let info = await transporter.sendMail(message);
  console.log("Message sent: %s", info.messageId);
};

module.exports = sendEmail;

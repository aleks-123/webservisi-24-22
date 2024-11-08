// npm install nodemailer
const nodemailer = require('nodemailer');

const sendMail = async (option) => {
  const transporter = nodemailer.createTransport({
    host: 'sandbox.smtp.mailtrap.io',
    port: 2525,
    auth: {
      user: 'b881a174e483e8',
      pass: 'f2fb94f79b09d5',
    },
  });

  transporter.verify((err, succ) => {
    if (err) {
      console.log(err.message);
    }
    console.log('Send sucessfully');
  });

  const mailOptions = {
    from: 'nike shoes <nike@shoes.com>',
    to: option.email,
    subject: option.subject,
    text: option.message,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = sendMail;

// const transporter = nodemailer.createTransport({
//   service: 'Gmail',
//   auth: {
//     user: // ovde kje si go zapishite vashiot email,
//     pass: // ovde kje si go zapishite vashiot password
//   }
// });

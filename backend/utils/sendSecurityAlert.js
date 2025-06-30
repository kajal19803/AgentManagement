// utils/sendSecurityAlert.js
const nodemailer = require('nodemailer');

module.exports = async function sendSecurityAlert(email, ip, location, userAgent) {
  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    }
  });

  await transporter.sendMail({
    from: '"Security Alert" <yourapp@example.com>',
    to: email,
    subject: 'New Login from Unrecognized IP',
    text: `A login was detected from a new IP:
- IP: ${ip}
- Location: ${location || 'Unknown'}
- Device: ${userAgent}

If this wasn't you, please reset your password immediately.`,
  });
}

const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables from your .env file
dotenv.config();

async function sendTestEmail() {
  console.log('Attempting to send a test email...');
  console.log('Using Email User:', process.env.EMAIL_USER);
  // We don't log the password for security, but we'll use it.

  const transporter = nodemailer.createTransport({
      host: "smtp.office365.com",
      port: 587,
      secure: false,
      auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS,
      },
      tls: {
          ciphers: 'SSLv3'
      }
  });

  const mailOptions = {
      from: `"HiveMind Test" <${process.env.EMAIL_USER}>`,
      to: 'tanmaywork172@gmail.com', // <-- CHANGE THIS to your own email
      subject: 'Nodemailer Test Email',
      html: `<b>This is a test email from your HiveMind server.</b><p>If you received this, your email configuration is working!</p>`,
  };

  try {
      console.log('Sending mail...');
      let info = await transporter.sendMail(mailOptions);
      console.log('✅ Email sent successfully!');
      console.log('Message ID:', info.messageId);
  } catch (error) {
      console.error('--- EMAIL FAILED TO SEND ---');
      console.error(error);
  }
}

sendTestEmail();
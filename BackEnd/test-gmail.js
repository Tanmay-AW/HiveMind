const dotenv = require('dotenv');
const nodemailer = require('nodemailer');

// Load environment variables
dotenv.config();

async function testGmailConnection() {
  console.log('Testing Gmail SMTP connection...');
  console.log('Gmail User:', process.env.EMAIL_USER ? 'Set' : 'Not set');
  console.log('Gmail App Password:', process.env.EMAIL_PASS ? 'Set' : 'Not set');

  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    console.error('❌ Missing Gmail credentials in .env file');
    console.log('Please add the following to your .env file:');
    console.log('EMAIL_USER=your_email@gmail.com');
    console.log('EMAIL_PASS=your_16_character_app_password');
    return;
  }

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  try {
    // Verify connection configuration
    await transporter.verify();
    console.log('✅ Gmail SMTP connection verified successfully!');
    
    // Test sending a simple email
    const testEmail = {
      from: `"HiveMind Test" <${process.env.EMAIL_USER}>`,
      to: process.env.EMAIL_USER, // Send to yourself for testing
      subject: 'HiveMind Gmail SMTP Test',
      text: 'This is a test email to verify Gmail SMTP configuration is working correctly.',
      html: '<h2>Gmail SMTP Test</h2><p>If you received this email, your Gmail SMTP configuration is working correctly!</p>'
    };

    const info = await transporter.sendMail(testEmail);
    console.log('✅ Test email sent successfully!');
    console.log('Message ID:', info.messageId);
    console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
    
  } catch (error) {
    console.error('❌ Gmail SMTP test failed:');
    console.error(error.message);
    
    if (error.code === 'EAUTH') {
      console.log('\n🔧 Troubleshooting tips:');
      console.log('1. Make sure 2-Factor Authentication is enabled on your Gmail account');
      console.log('2. Generate an App Password (not your regular password)');
      console.log('3. Use the 16-character App Password in your .env file');
    }
  }
}

testGmailConnection(); 
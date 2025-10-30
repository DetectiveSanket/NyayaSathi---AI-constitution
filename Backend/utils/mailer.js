import nodemailer from 'nodemailer';

// Create reusable transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: process.env.SMTP_PORT === '465', // true for 465, false for other ports
  auth: {
    user: process.env.SMTP_MAIL,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Verify transporter configuration
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ SMTP connection error:', error);
  } else {
    console.log('✅ SMTP server is ready to send emails');
  }
});

/**
 * Send email utility
 * @param {Object} options - Email options
 * @param {string} options.to - Recipient email
 * @param {string} options.subject - Email subject
 * @param {string} options.html - HTML content
 * @param {string} options.replyTo - Reply-to email
 */
export async function sendMail({ to, subject, html, replyTo }) {
  try {
    const info = await transporter.sendMail({
      from: {
        name: process.env.CONTACT_FROM_NAME || 'NyayaSathi',
        address: process.env.CONTACT_FROM_EMAIL || process.env.SMTP_MAIL,
      },
      to,
      subject,
      html,
      replyTo,
    });

    console.log('✉️ Email sent:', info.messageId);
    return info;
  } catch (error) {
    console.error('❌ Email sending failed:', error);
    throw error;
  }
}

export default transporter;

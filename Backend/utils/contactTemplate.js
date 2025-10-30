/**
 * Sanitize HTML to prevent XSS
 * @param {string} str - String to sanitize
 */
const sanitize = (str) => {
  return String(str || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');
};

/**
 * Email template for contact form submission (sent to admin)
 * @param {Object} data - Contact form data
 * @param {string} data.name - Sender name
 * @param {string} data.email - Sender email
 * @param {string} data.message - Message content
 */
export function contactEmailTemplate({ name, email, message }) {
  const safeName = sanitize(name);
  const safeEmail = sanitize(email);
  const safeMessage = sanitize(message);
  const timestamp = new Date().toLocaleString('en-IN', { 
    timeZone: 'Asia/Kolkata',
    dateStyle: 'full',
    timeStyle: 'short'
  });

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>New Contact Message</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600">📩 New Contact Message</h1>
              <p style="margin:10px 0 0;color:#e8e8ff;font-size:14px">NyayaSathi Contact Form</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px">
              <p style="margin:0 0 20px;color:#333333;font-size:16px;line-height:1.5">
                You have received a new message from your website contact form.
              </p>

              <!-- Contact Details -->
              <table width="100%" cellpadding="12" cellspacing="0" style="background-color:#f8f9fa;border-radius:6px;margin:20px 0">
                <tr>
                  <td style="border-bottom:1px solid #e9ecef">
                    <strong style="color:#667eea;font-size:14px">👤 Name:</strong><br>
                    <span style="color:#333333;font-size:16px">${safeName}</span>
                  </td>
                </tr>
                <tr>
                  <td style="border-bottom:1px solid #e9ecef">
                    <strong style="color:#667eea;font-size:14px">📧 Email:</strong><br>
                    <a href="mailto:${safeEmail}" style="color:#667eea;text-decoration:none;font-size:16px">${safeEmail}</a>
                  </td>
                </tr>
                <tr>
                  <td>
                    <strong style="color:#667eea;font-size:14px">💬 Message:</strong><br>
                    <div style="margin-top:10px;padding:15px;background-color:#ffffff;border-left:3px solid #667eea;border-radius:4px">
                      <p style="margin:0;color:#333333;font-size:15px;line-height:1.6;white-space:pre-wrap">${safeMessage}</p>
                    </div>
                  </td>
                </tr>
              </table>

              <!-- Action Button -->
              <div style="text-align:center;margin:30px 0">
                <a href="mailto:${safeEmail}?subject=Re: Your inquiry on NyayaSathi" 
                   style="display:inline-block;background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);color:#ffffff;text-decoration:none;padding:14px 32px;border-radius:6px;font-weight:600;font-size:16px">
                  Reply to ${safeName}
                </a>
              </div>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 30px;text-align:center;border-radius:0 0 8px 8px;border-top:1px solid #e9ecef">
              <p style="margin:0;color:#6c757d;font-size:13px">
                📅 Received on ${timestamp}
              </p>
              <p style="margin:10px 0 0;color:#6c757d;font-size:12px">
                This is an automated message from NyayaSathi contact form
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

/**
 * Auto-reply template for contact form submission (sent to user)
 * @param {Object} data - Contact form data
 * @param {string} data.name - Sender name
 */
export function contactAutoReplyTemplate({ name }) {
  const safeName = sanitize(name);

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Thank You for Contacting Us</title>
</head>
<body style="margin:0;padding:0;background-color:#f5f5f5;font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f5f5f5;padding:20px">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="background-color:#ffffff;border-radius:8px;box-shadow:0 2px 4px rgba(0,0,0,0.1)">
          
          <!-- Header -->
          <tr>
            <td style="background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:30px;text-align:center;border-radius:8px 8px 0 0">
              <h1 style="margin:0;color:#ffffff;font-size:28px;font-weight:600">✅ Message Received!</h1>
              <p style="margin:10px 0 0;color:#e8e8ff;font-size:14px">NyayaSathi Team</p>
            </td>
          </tr>

          <!-- Content -->
          <tr>
            <td style="padding:40px 30px">
              <h2 style="margin:0 0 15px;color:#333333;font-size:22px">
                Thank you${safeName ? ', ' + safeName : ''}! 🙏
              </h2>
              
              <p style="margin:0 0 15px;color:#555555;font-size:16px;line-height:1.6">
                We've received your message and appreciate you taking the time to reach out to us.
              </p>

              <p style="margin:0 0 15px;color:#555555;font-size:16px;line-height:1.6">
                Our team will review your inquiry and get back to you within <strong>24 hours</strong>.
              </p>

              <!-- Info Box -->
              <div style="background-color:#f0f4ff;border-left:4px solid #667eea;padding:20px;margin:25px 0;border-radius:4px">
                <p style="margin:0;color:#333333;font-size:14px;line-height:1.6">
                  💡 <strong>In the meantime:</strong><br>
                  Feel free to explore our documentation and learn more about India's Constitution at 
                  <a href="https://nyayasathi.com" style="color:#667eea;text-decoration:none">nyayasathi.com</a>
                </p>
              </div>

              <p style="margin:25px 0 0;color:#555555;font-size:16px;line-height:1.6">
                Best regards,<br>
                <strong style="color:#667eea">The NyayaSathi Team</strong>
              </p>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color:#f8f9fa;padding:20px 30px;text-align:center;border-radius:0 0 8px 8px;border-top:1px solid #e9ecef">
              <p style="margin:0;color:#6c757d;font-size:13px">
                📧 nyayasathi.team@gmail.com
              </p>
              <p style="margin:10px 0 0;color:#6c757d;font-size:12px">
                This is an automated response. Please do not reply to this email.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

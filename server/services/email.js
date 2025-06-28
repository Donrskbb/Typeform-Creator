import nodemailer from 'nodemailer';

let transporter = null;

function createTransporter() {
  if (!transporter) {
    transporter = nodemailer.createTransporter({
      host: process.env.EMAIL_HOST,
      port: parseInt(process.env.EMAIL_PORT || '587'),
      secure: process.env.EMAIL_PORT === '465',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  }
  return transporter;
}

export async function submitToEmail(formData) {
  const emailTransporter = createTransporter();
  
  if (!process.env.EMAIL_TO) {
    throw new Error('Email recipient not configured');
  }

  const formFields = Object.entries(formData)
    .map(([key, value]) => `<strong>${key.charAt(0).toUpperCase() + key.slice(1)}:</strong> ${value || 'Not provided'}`)
    .join('<br>');

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: process.env.EMAIL_TO,
    subject: '📝 New Form Submission - Typeform Clone',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #7c3aed;">New Form Submission</h2>
        <div style="background: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${formFields}
        </div>
        <p style="color: #64748b; font-size: 14px;">
          Submitted at: ${new Date().toLocaleString()}
        </p>
      </div>
    `
  };

  const result = await emailTransporter.sendMail(mailOptions);
  return result;
}
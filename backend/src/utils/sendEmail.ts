import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
}

const sendEmail = async (options: EmailOptions) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service is not configured. Check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.');
  }

  const port = parseInt(EMAIL_PORT || '587', 10);
  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: port === 465,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: `"EduJobs Scholars" <${EMAIL_USER}>`,
    to: options.email,
    subject: options.subject,
    text: options.message,
    html: options.html,
  };

  try {
    console.log(`Attempting to send email to ${options.email}...`);
    await transporter.verify();
    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}. Message ID: ${info.messageId}`);
  } catch (error) {
    console.error(`Error sending email to ${options.email}:`, error);
    throw error;
  }
};

export default sendEmail;

import nodemailer from 'nodemailer';

interface EmailOptions {
  email: string;
  subject: string;
  message: string;
  html?: string;
  replyTo?: string;
}

const sendEmail = async (options: EmailOptions) => {
  const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, NODE_ENV } = process.env;

  if (!EMAIL_HOST || !EMAIL_USER || !EMAIL_PASS) {
    throw new Error('Email service is not configured. Check EMAIL_HOST, EMAIL_USER, and EMAIL_PASS.');
  }

  const port = parseInt(EMAIL_PORT || '587', 10);
  const isSecure = port === 465;

  const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port,
    secure: isSecure,
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASS,
    },
    // Increased timeouts for serverless environments (Vercel)
    connectionTimeout: 10000, // 10 seconds
    greetingTimeout: 10000,
    socketTimeout: 10000,
    tls: {
      // Do not fail on invalid certificates (helpful for some mail servers)
      rejectUnauthorized: false,
    },
  });

  const mailOptions = {
    from: `"EduJobs Scholars" <${EMAIL_USER}>`,
    to: options.email,
    replyTo: options.replyTo || EMAIL_USER,
    subject: options.subject,
    text: options.message,
    html: options.html,
    headers: {
      'X-Priority': '3',
      'X-MSMail-Priority': 'Normal',
      'Importance': 'Normal',
      'X-Mailer': 'EduJobs-Scholars-Admissions-Mailer/1.0',
      'Auto-Submitted': 'auto-generated',
      'X-Auto-Response-Suppress': 'OOF, AutoReply',
    },
  };

  try {
    console.log(`Attempting to send email to ${options.email}...`);

    // Only verify connection in development to save time in production
    if (NODE_ENV === 'development') {
      await transporter.verify();
    }

    const info = await transporter.sendMail(mailOptions);
    console.log(`Email sent successfully to ${options.email}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`Error sending email to ${options.email}:`, error);
    throw error;
  }
};

export default sendEmail;

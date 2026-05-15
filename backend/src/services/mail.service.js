// backend/src/services/mail/mail.service.js
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.MAIL_HOST || 'smtp-relay.brevo.com',
  port: 587,
  secure: false, 
  auth: {
    user: process.env.MAIL_USER, 
    pass: process.env.MAIL_PASS, 
  },
});

export const sendMailAsync = async ({ to, subject, html }) => {
  try {
    // 🌟 FIX: Added "const info =" so the variable actually exists!
    const info = await transporter.sendMail({
      from: `"EVALIX AI" <anirban008jana@gmail.com>`,
      to,
      subject,
      html,
    });
    console.log(`✅ [Mail Service] Email sent successfully to ${to}. Message ID: ${info.messageId}`);
    return info;
  } catch (error) {
    console.error(`❌ [Mail Service] Failed to send email to ${to}:`, error.message);
    throw error;
  }
};
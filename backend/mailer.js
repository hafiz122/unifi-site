const nodemailer = require('nodemailer');
require('dotenv').config();

const transporter = nodemailer.createTransport({
  host: 'smtp-relay.brevo.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.BREVO_USER,
    pass: process.env.BREVO_KEY,
  },
});

const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const FROM_NAME = 'PlanPilih';
const FROM_EMAIL = 'noreply@planpilih.com';

async function sendAdminNotification(enquiry) {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: ADMIN_EMAIL,
      subject: `New enquiry from ${enquiry.name} — ${enquiry.topic || 'General'}`,
      html: `
        <h3>New Contact Form Submission</h3>
        <p><strong>Name:</strong> ${enquiry.name}</p>
        <p><strong>Email:</strong> ${enquiry.email}</p>
        <p><strong>Phone:</strong> ${enquiry.phone || 'Not provided'}</p>
        <p><strong>Topic:</strong> ${enquiry.topic || 'Not specified'}</p>
        <p><strong>Message:</strong></p>
        <blockquote>${enquiry.message}</blockquote>
        <hr>
        <p><small>Sent from PlanPilih contact form.</small></p>
      `,
    });
    console.log('Admin notification sent for enquiry:', enquiry.id);
  } catch (err) {
    console.error('Failed to send admin notification:', err.message);
  }
}

async function sendAutoReply(enquiry) {
  try {
    await transporter.sendMail({
      from: `"${FROM_NAME}" <${FROM_EMAIL}>`,
      to: enquiry.email,
      subject: 'We received your message — PlanPilih',
      html: `
        <p>Hi ${enquiry.name},</p>
        <p>Thank you for contacting PlanPilih. We have received your enquiry about <strong>${enquiry.topic || 'your question'}</strong>.</p>
        <p>Our team will get back to you within 1-2 business days.</p>
        <p>Your message:</p>
        <blockquote>${enquiry.message}</blockquote>
        <hr>
        <p><small>This is an automated reply. Please do not reply to this email.</small></p>
      `,
    });
    console.log('Auto-reply sent to:', enquiry.email);
  } catch (err) {
    console.error('Failed to send auto-reply:', err.message);
  }
}

module.exports = { sendAdminNotification, sendAutoReply };

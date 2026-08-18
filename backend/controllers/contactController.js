import mongoose from 'mongoose';
import { env, isSmtpConfigured } from '../config/env.js';
import ContactMessage from '../models/ContactMessage.js';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

function validateContact({ name, email, message }) {
  const errors = [];
  if (!name || name.trim().length < 2) errors.push('Name must be at least 2 characters.');
  if (!email || !EMAIL_RE.test(email.trim())) errors.push('A valid email is required.');
  if (!message || message.trim().length < 10) errors.push('Message must be at least 10 characters.');
  return errors;
}

async function sendEmail({ name, email, message }) {
  if (!isSmtpConfigured()) return false;
  const { default: nodemailer } = await import('nodemailer');

  const transporter = nodemailer.createTransport({
    host: env.smtp.host,
    port: env.smtp.port,
    secure: env.smtp.port === 465,
    auth: { user: env.smtp.user, pass: env.smtp.pass },
  });

  await transporter.sendMail({
    from: `"Portfolio Contact" <${env.smtp.user}>`,
    to: env.contactToEmail,
    replyTo: email,
    subject: `New portfolio message from ${name}`,
    text: `Name: ${name}\nEmail: ${email}\n\nMessage:\n${message}`,
  });

  return true;
}

export async function createContactMessage(req, res) {
  const { name, email, message } = req.body || {};

  const errors = validateContact({ name, email, message });
  if (errors.length) {
    return res.status(400).json({ success: false, message: errors[0] });
  }

  let saved = false;
  const dbReady = mongoose.connection.readyState === 1;
  if (dbReady) {
    try {
      await ContactMessage.create({ name, email, message });
      saved = true;
    } catch (error) {
      console.error('[contact] Failed to save message:', error.message);
    }
  } else {
    console.warn('[contact] MongoDB not connected — message was not persisted.');
  }

  let emailed = false;
  try {
    emailed = await sendEmail({ name, email, message });
  } catch (error) {
    console.error('[contact] Failed to send email:', error.message);
  }

  if (!saved && !emailed) {
    return res.status(503).json({
      success: false,
      message:
        'Message could not be stored or delivered. The server has no database or email configured — check backend/.env.',
    });
  }

  res.status(201).json({
    success: true,
    message: 'Message received. Thank you for reaching out!',
    stored: saved,
    emailed,
  });
}

export async function getContactMessages(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ success: false, message: 'MongoDB is not connected.' });
  }
  try {
    const messages = await ContactMessage.find().sort({ createdAt: -1 }).limit(100);
    res.json({ success: true, count: messages.length, data: messages });
  } catch (error) {
    console.error('[contact] Failed to list messages:', error.message);
    res.status(500).json({ success: false, message: 'Failed to load messages.' });
  }
}

export async function deleteContactMessage(req, res) {
  if (mongoose.connection.readyState !== 1) {
    return res
      .status(503)
      .json({ success: false, message: 'MongoDB is not connected.' });
  }
  try {
    const { id } = req.params;
    if (!mongoose.isValidObjectId(id)) {
      return res.status(400).json({ success: false, message: 'Invalid message id.' });
    }
    const deleted = await ContactMessage.findByIdAndDelete(id);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Message not found.' });
    }
    res.json({ success: true, message: 'Message deleted.', data: deleted });
  } catch (error) {
    console.error('[contact] Failed to delete message:', error.message);
    res.status(500).json({ success: false, message: 'Failed to delete message.' });
  }
}

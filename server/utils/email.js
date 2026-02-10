const nodemailer = require('nodemailer');
require('dotenv').config();

const SMTP_TLS = process.env.SMTP_TLS === 'true';
const SMTP_PORT = process.env.SMTP_PORT || 465;
const SMTP_HOST = process.env.SMTP_HOST;
const SMTP_USER = process.env.SMTP_USER;
const SMTP_PASSWORD = process.env.SMTP_PASSWORD;
const EMAILS_FROM_EMAIL = process.env.EMAILS_FROM_EMAIL;
const EMAILS_FROM_NAME = process.env.EMAILS_FROM_NAME || "FastAPI Admin";

const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    secure: SMTP_TLS,
    auth: {
        user: SMTP_USER,
        pass: SMTP_PASSWORD,
    },
});

async function sendEmail(to, subject, text) {
    try {
        const info = await transporter.sendMail({
            from: `"${EMAILS_FROM_NAME}" <${EMAILS_FROM_EMAIL}>`,
            to: to,
            subject: subject,
            text: text,
        });
        console.log("Message sent: %s", info.messageId);
        return true;
    } catch (error) {
        console.error("Error sending email:", error);
        return false;
    }
}

module.exports = { sendEmail };

const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();

const sendEmail = async (options) => {
    // Create a transporter
    const transport = nodemailer.createTransport({
        service: process.env.EMAIL_HOST_SERVICE, // 'gmail' for Gmail
        auth: {
            user: process.env.EMAIL_USER, // Your Gmail address
            pass: process.env.EMAIL_PASSWORD, // App password for Gmail
        },
    });

    // Verify the transporter configuration
    try {
        await transport.verify();
        console.log('Transporter verified successfully.');
    } catch (error) {
        console.error('Transporter verification failed:', error);
        throw new Error('Email transporter configuration error');
    }

    // Define the email message
    const message = {
        from: `${process.env.SMTP_FROM_NAME} <${process.env.SMTP_FROM_MAIL}>`, // Sender details
        to: options.email, // Recipient email
        subject: options.subject, // Email subject
        text: options.message, // Plain text email message
        html: options.html,
    };

    // Send the email
    try {
        const info = await transport.sendMail(message);
        console.log('Email sent successfully:', info.response);
        return info;
    } catch (error) {
        console.error('Error sending email:', error.message);
        throw new Error('Could not send email');
    }
};

module.exports = sendEmail;

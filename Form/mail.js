// Import nodemailer library
const nodemailer = require('nodemailer');

// Function to generate a random 6-digit verification code
function generateVerificationCode() {
    return Math.floor(100000 + Math.random() * 900000);
}

// Function to send a verification email with a random code to the receiver email
async function sendVerificationEmail(receiverEmail) {
    // Create a transporter object for sending emails using Outlook SMTP
    const transporter = nodemailer.createTransport({
        host: 'smtp.office365.com',
        port: 587,
        secure: false, // TLS
        auth: {
            user: 'srikanthrl2003@outlook.com', // Your Outlook email address
            pass: '#srikanth2205' // Your Outlook password or app password
        }
    });

    // Generate a verification code
    const verificationCode = generateVerificationCode();

    // Construct the email options
    const mailOptions = {
        from: 'srikanthrl2003@outlook.com', // Sender email address
        to: receiverEmail, // Receiver email address (passed as a parameter)
        subject: 'Verification Code', // Email subject
        html: `
            <div style="background-color: #f4f4f4; padding: 20px; font-family: Arial, sans-serif;">
                <h2 style="color: #333;">For Reset Password</h2>
                <p style="font-size: 16px;">Please use the following verification code to reset your password;</p>
                <p style="font-size: 18px; color: #007bff;">Verification Code : <strong>${verificationCode}</strong></p>
                <p style="font-size: 16px;">If you didn't request this code, you can safely ignore this email.</p>
                <p style="font-size: 16px;">Thanks,</p>
                <p style="font-size: 17px;"><strong>Srikanth.</strong></p>
            </div>
        `
    };

    try {
        // Send the email
        const info = await transporter.sendMail(mailOptions);
        console.log('Email sent successfully:', info.response);
        return verificationCode; // Return the verification code
    } catch (error) {
        console.error('Error occurred while sending email:', error);
        throw error;
    }
}

// Export the sendVerificationEmail function
module.exports = sendVerificationEmail;
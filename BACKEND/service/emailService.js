const nodemailer = require('nodemailer');

// Create a transporter for sending emails
const createTransporter = () => {
    // For development, use ethereal email or a test service
    // In production, you'd configure this with real SMTP settings
    return nodemailer.createTransporter({
        host: process.env.SMTP_HOST || 'smtp.ethereal.email',
        port: process.env.SMTP_PORT || 587,
        secure: false, // true for 465, false for other ports
        auth: {
            user: process.env.SMTP_USER || 'ethereal.user@ethereal.email',
            pass: process.env.SMTP_PASS || 'ethereal.pass'
        }
    });
};

// Send email notification
const sendEmailNotification = async (emailContent) => {
    try {
        const transporter = createTransporter();
        
        const mailOptions = {
            from: process.env.EMAIL_FROM || '"Lost ID System" <noreply@lostid.system>',
            to: emailContent.to,
            subject: emailContent.subject,
            html: emailContent.body.replace(/\n/g, '<br>') // Convert newlines to HTML
        };

        const info = await transporter.sendMail(mailOptions);
        
        console.log('Email sent successfully:', info.messageId);
        
        // For development, log the preview URL
        if (process.env.NODE_ENV !== 'production') {
            console.log('Preview URL:', nodemailer.getTestMessageUrl(info));
        }
        
        return {
            success: true,
            messageId: info.messageId
        };
        
    } catch (error) {
        console.logror sending email:', error.message);
        return {
            success: false,
            error: error.message
        };
    }
};

// For development, you can test the email service
const testEmailService = async () => {
    if (process.env.NODE_ENV === 'development') {
        try {
            const testAccount = await nodemailer.createTestAccount();
            console.log('Test email account created:', testAccount.user);
            
            const transporter = createTransporter();
            const info = await transporter.sendMail({
                from: testAccount.user,
                to: testAccount.user,
                subject: 'Test Email',
                text: 'This is a test email from the Lost ID System'
            });
            
            console.log('Test email sent:', nodemailer.getTestMessageUrl(info));
        } catch (error) {
            console.logTest email failed:', error.message);
        }
    }
};

module.exports = {
    sendEmailNotification,
    testEmailService
};

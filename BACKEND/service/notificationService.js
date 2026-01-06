const { pool } = require('../model/connect');
const { sendEmailNotification } = require('./EmailAndAssociatedThings');

class NotificationService {
    constructor() {
        this.listeners = new Map();
        this.isListening = false;
    }

    // Start listening to PostgreSQL notifications
    async startListening() {
        if (this.isListening) return;

        try {
            // Connect to PostgreSQL for listening
            const client = await pool.connect();
            
            // Listen for different notification channels
            await client.query('LISTEN lost_id_found');
            await client.query('LISTEN rejected_request');
            await client.query('LISTEN unrejected_user');
            await client.query('LISTEN request_approved');

            // Handle notifications
            client.on('notification', async (msg) => {
                await this.handleNotification(msg.channel, msg.payload);
            });

            this.isListening = true;
            console.log('Notification service started listening to PostgreSQL events');
            
        } catch (error) {
            console.error('Error starting notification service:', error);
        }
    }

    // Handle incoming notifications
    async handleNotification(channel, payload) {
        try {
            const data = JSON.parse(payload);
            
            switch (channel) {
                case 'lost_id_found':
                    await this.handleLostIdFound(data);
                    break;
                case 'rejected_request':
                    await this.handleRequestRejected(data);
                    break;
                case 'unrejected_user':
                    await this.handleRequestUnrejected(data);
                    break;
                case 'request_approved':
                    await this.handleRequestApproved(data);
                    break;
                default:
                    console.log(`Unknown notification channel: ${channel}`);
            }
        } catch (error) {
            console.error('Error handling notification:', error.message);
        }
    }

    // Handle lost ID found notification
    async handleLostIdFound(data) {
        try {
            // Get student email
            const studentResult = await pool.query(
                'SELECT email, name FROM Users WHERE id = $1',
                [data.requesterId]
            );

            // Get founder information
            const founderResult = await pool.query(
                'SELECT founder_name, contact_info, found_at FROM foundIdReport WHERE id = $1',
                [data.founderTableInfo]
            );

            if (studentResult.rows.length > 0 && founderResult.rows.length > 0) {
                const student = studentResult.rows[0];
                const founder = founderResult.rows[0];

                const emailContent = {
                    to: student.email,
                    subject: 'Good News! Your Lost ID Has Been Found',
                    body: `
                        Dear ${student.name},
                        
                        Great news! Your lost ID has been found.
                        
                        Founder Information:
                        Name: ${founder.founder_name}
                        Contact: ${founder.contact_info}
                        Found at: ${founder.found_at}
                        
                        Please contact the founder to arrange for the collection of your ID.
                        
                        Best regards,
                        Lost ID Automation System
                    `
                };

                await sendEmailNotification(emailContent);
                console.log(`Lost ID found notification sent to ${student.email}`);
            }
        } catch (error) {
            console.error('Error handling lost ID found notification:', error.message);
        }
    }

    // Handle request rejected notification
    async handleRequestRejected(data) {
        try {
            // Get student and rejection details
            const result = await pool.query(`
                SELECT u.email, u.name, rr.reason, rf.id_number
                FROM Users u
                JOIN requestFlow rf ON u.id = rf.requester_id
                JOIN rejected_requests rr ON rf.rejection_id = rr.id
                WHERE u.id = $1 AND rr.id = $2
            `, [data.requester_id, data.rejection_id]);

            if (result.rows.length > 0) {
                const { email, name, reason, id_number } = result.rows[0];

                const emailContent = {
                    to: email,
                    subject: 'Your New ID Request Has Been Rejected',
                    body: `
                        Dear ${name},
                        
                        We regret to inform you that your request for a new ID (ID: ${id_number}) has been rejected.
                        
                        Reason for rejection: ${reason}
                        
                        If you believe this is an error or need clarification, please contact the administrative office.
                        
                        Best regards,
                        Lost ID Automation System
                    `
                };

                await sendEmailNotification(emailContent);
                console.log(`Request rejection notification sent to ${email}`);
            }
        } catch (error) {
            console.error('Error handling request rejected notification:', error.message);
        }
    }

    // Handle request unrejected notification
    async handleRequestUnrejected(data) {
        try {
            // Get student information
            const result = await pool.query(`
                SELECT u.email, u.name, rf.id_number
                FROM Users u
                JOIN requestFlow rf ON u.id = rf.requester_id
                WHERE u.id = $1
            `, [data.unrejected_id]);

            if (result.rows.length > 0) {
                const { email, name, id_number } = result.rows[0];

                const emailContent = {
                    to: email,
                    subject: 'Your ID Request Status Has Been Updated',
                    body: `
                        Dear ${name},
                        
                        Good news! Your request for a new ID (ID: ${id_number}) has been reactivated and is now pending review.
                        
                        The previous rejection has been overturned and your request is back in the approval process.
                        
                        You can check the status of your request at any time through the system.
                        
                        Best regards,
                        Lost ID Automation System
                    `
                };

                await sendEmailNotification(emailContent);
                console.log(`Request unrejection notification sent to ${email}`);
            }
        } catch (error) {
            console.error('Error handling request unrejected notification:', error.message);
        }
    }

    // Handle request approved notification
    async handleRequestApproved(data) {
        try {
            // This would be triggered when registral approves the request
            const result = await pool.query(`
                SELECT u.email, u.name, rf.id_number
                FROM Users u
                JOIN requestFlow rf ON u.id = rf.requester_id
                WHERE rf.id = $1
            `, [data.request_id]);

            if (result.rows.length > 0) {
                const { email, name, id_number } = result.rows[0];

                const emailContent = {
                    to: email,
                    subject: 'Your New ID Request Has Been Approved!',
                    body: `
                        Dear ${name},
                        
                        Congratulations! Your request for a new ID (ID: ${id_number}) has been approved.
                        
                        Your new ID is being processed and will be available for collection soon.
                        You will receive another notification when it's ready for pickup.
                        
                        Please keep this email for your records.
                        
                        Best regards,
                        Lost ID Automation System
                    `
                };

                await sendEmailNotification(emailContent);
                console.log(`Request approval notification sent to ${email}`);
            }
        } catch (error) {
            console.error('Error handling request approved notification:', error.message);
        }
    }

    // Stop listening to notifications
    async stopListening() {
        if (!this.isListening) return;

        try {
            // This would be implemented when you have a dedicated client for notifications
            this.isListening = false;
            console.log('Notification service stopped');
        } catch (error) {
            console.error('Error stopping notification service:', error.message);
        }
    }
}

// Create singleton instance
const notificationService = new NotificationService();

module.exports = { notificationService };

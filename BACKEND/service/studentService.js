const { pool } = require('../model/connect');
const { isStudentBanned } = require('../model/checkingBannedOrNot');
const { insertingIntoLostIdReport } = require('../model/reportingLostAndFoundId');

class StudentService {
    async reportLostId(studentInfo) {
        try {
            const { userId, idNumber } = studentInfo;

            // First check if student is banned
            const bannedCheck = await isStudentBanned(idNumber);
            if (!bannedCheck.success) {
                return {
                    success: false,
                    reason: "Error checking ban status"
                };
            }

            if (bannedCheck.isStudentBanned) {
                return {
                    success: false,
                    reason: "Student is banned from reporting lost IDs"
                };
            }

            // Report the lost ID using the stored procedure
            const result = await pool.query(
                'SELECT * FROM insertingIntoLostIdReport($1, $2)',
                [userId, idNumber]
            );

            if (!result.rows[0]) {
                return {
                    success: false,
                    reason: "Failed to report lost ID"
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "Lost ID reported successfully"
            };

        } catch (error) {
            console.error("Error in StudentService.reportLostId:", error.message);
            return {
                success: false,
                reason: "Internal server error while reporting lost ID"
            };
        }
    }

    async requestNewId(requestInfo) {
        try {
            const { userId, idNumber, policeDocument } = requestInfo;

            // First check if student is banned
            const bannedCheck = await isStudentBanned(idNumber);
            if (!bannedCheck.success) {
                return {
                    success: false,
                    reason: "Error checking ban status"
                };
            }

            if (bannedCheck.isStudentBanned) {
                return {
                    success: false,
                    reason: "Student is banned from requesting new IDs"
                };
            }

            // Check if there's already a pending request
            const existingRequest = await pool.query(
                'SELECT * FROM requestFlow WHERE id_number = $1 AND status = $2',
                [idNumber, 'pending']
            );

            if (existingRequest.rows.length > 0) {
                return {
                    success: false,
                    reason: "There is already a pending request for this ID"
                };
            }

            // Create new request flow entry
            const result = await pool.query(
                `INSERT INTO requestFlow (id_number, requester_id, police_document, status)
                 VALUES ($1, $2, $3, 'pending')
                 RETURNING *`,
                [idNumber, userId, policeDocument]
            );

            if (!result.rows[0]) {
                return {
                    success: false,
                    reason: "Failed to create new ID request"
                };
            }

            return {
                success: true,
                data: result.rows[0],
                message: "New ID request submitted successfully"
            };

        } catch (error) {
            console.error("Error in StudentService.requestNewId:", error.message);
            return {
                success: false,
                reason: "Internal server error while requesting new ID"
            };
        }
    }

    async checkRequestStatus(studentInfo) {
        try {
            const { userId, idNumber } = studentInfo;

            // Get all requests for this student
            const requests = await pool.query(
                `SELECT rf.*, 
                        CASE 
                            WHEN rf.rejection_id IS NOT NULL THEN rr.reason
                            ELSE NULL
                        END as rejection_reason
                 FROM requestFlow rf
                 LEFT JOIN rejected_requests rr ON rf.rejection_id = rr.id
                 WHERE rf.requester_id = $1 
                 ORDER BY rf.created_at DESC`,
                [userId]
            );

            if (!requests.success) {
                return {
                    success: false,
                    reason: "Failed to retrieve request status"
                };
            }

            // Get lost ID reports status
            const lostReports = await pool.query(
                `SELECT lr.*, fr.founder_name, fr.contact_info, fr.found_at
                 FROM lostIdReport lr
                 LEFT JOIN foundIdReport fr ON lr.founded_by = fr.id
                 WHERE lr.user_id = $1
                 ORDER BY lr.created_at DESC`,
                [userId]
            );

            return {
                success: true,
                data: {
                    requests: requests.rows,
                    lostReports: lostReports.rows
                },
                message: "Request status retrieved successfully"
            };

        } catch (error) {
            console.error("Error in StudentService.checkRequestStatus:", error.message);
            return {
                success: false,
                reason: "Internal server error while checking request status"
            };
        }
    }

    async getStudentNotifications(studentInfo) {
        try {
            const { userId } = studentInfo;

            // Get recent notifications based on database events
            // This would typically query a notifications table
            // For now, we'll return recent status changes
            
            const recentRejections = await pool.query(
                `SELECT rf.id, rf.status, rr.reason, rr.created_at
                 FROM requestFlow rf
                 JOIN rejected_requests rr ON rf.rejection_id = rr.id
                 WHERE rf.requester_id = $1 AND rf.status = 'rejected'
                 ORDER BY rr.created_at DESC
                 LIMIT 5`,
                [userId]
            );

            const recentApprovals = await pool.query(
                `SELECT rf.id, rf.status, rf.updated_at
                 FROM requestFlow rf
                 WHERE rf.requester_id = $1 AND rf.status = 'approved'
                 ORDER BY rf.updated_at DESC
                 LIMIT 5`,
                [userId]
            );

            const foundIds = await pool.query(
                `SELECT lr.id, lr.found_status, fr.founder_name, fr.contact_info, lr.created_at
                 FROM lostIdReport lr
                 JOIN foundIdReport fr ON lr.founded_by = fr.id
                 WHERE lr.user_id = $1 AND lr.found_status = true
                 ORDER BY lr.created_at DESC
                 LIMIT 5`,
                [userId]
            );

            return {
                success: true,
                data: {
                    rejections: recentRejections.rows,
                    approvals: recentApprovals.rows,
                    foundIds: foundIds.rows
                },
                message: "Notifications retrieved successfully"
            };

        } catch (error) {
            console.error("Error in StudentService.getStudentNotifications:", error.message);
            return {
                success: false,
                reason: "Internal server error while retrieving notifications"
            };
        }
    }
}

module.exports = { StudentService };

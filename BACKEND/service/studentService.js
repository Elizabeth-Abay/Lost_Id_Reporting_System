const { pool } = require('../model/connect');
const { isStudentBanned , isStudentIdAndIdNumMatching } = require('../model/checkingBannedOrNot');
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

            let isStudentRequestingHisOwnId = await isStudentIdAndIdNumMatching({userId, idNumber})

            if (!isStudentRequestingHisOwnId.success){
                return {
                    success : false,
                    reason : "Error checking isStudentRequestingHisOwnId"
                }
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
                `INSERT INTO requestFlow (id_number, requester_id, policeDocument, status)
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
                `SELECT rf.* , rr.reason
                 FROM requestFlow rf
                 LEFT JOIN rejected_requests rr ON rr.rejected_request_id = rf.id
                 WHERE rf.requester_id = $1 
                 ORDER BY rf.created_at DESC`,
                [userId]
            );

            // console.log(requests);

            if (!requests) {
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

            const recentUpdatesOnRequest = await pool.query(
                `SELECT * FROM getting_Notification_for_students($1)`,
                [userId]
            );

            let result = recentUpdatesOnRequest.rows[0];
            // this will be an object
            console.log(result)
            let rejections = {};

            if (result.status_received === 'rejected'){
                // then give back the name and role
                rejections.name = result.rejector_name;
                rejections.role = result.rejector_role;
                rejections.reason = result.reason;
            }

            // approvals
            let approvals = [];
            // it will be an array of objects = { name , role}
            // what if no one approved
            let approverInfo = {};

            let j = 0;
            // j = 0 means u r on name
            // j = 1 means u r on role

            // loop in the array of keys
            let KeyArray = Object.keys(result);

            for (let x of KeyArray){
                if (x === 'status_received') continue;

                let value = result[x];

                if (!value) break

                if (value && j === 0){
                    // means u r on name
                    approverInfo.name = value;
                    j++;
                    continue;
                }

                if (value && j === 1){
                    // means u r on name
                    approverInfo.role = value;
                    j--;
                    approvals.push(approverInfo);

                    approverInfo = {};

                }

            }

            // console.log(approvals);
            // console.log(rejections)


            


            const foundIds = await pool.query(
                `SELECT  lr.id , fr.founder_name, fr.contact_info 
                 FROM lostIdReport lr
                 JOIN foundIdReport fr ON lr.founded_by = fr.id
                 WHERE lr.user_id = $1 AND lr.found_status = true
                 AND seen = FALSE`,
                [userId]
            );

            // if (foundIds.rows.length >= 1){
            //     // then set the seen to true
            //     let res = await pool.query(
            //         `UPDATE lostIdReport 
            //         SET seen = true
            //         WHERE id = ${foundIds.rows.id}` 
            //     )
            // }

            console.log("found id" , foundIds.rows[0]);

            // once we query the table then mark the state of the found id to be seen
            // so create array of the ids

            let resultRows = [];
            // console.log(foundIds.rows)

            // then loop through obj
            // foundIds.rows is an array of objects
            let foundIdArray = foundIds.rows;

            for (let rs of foundIdArray) {
                // push the id of rs into the array
                resultRows.push(rs.id);
            };

            // console.log(resultRows)


            // set the things  u have accepted seen = true
            let res = await pool.query(`
                UPDATE lostIdReport 
                SET seen = TRUE 
                WHERE id = ANY($1)
                ` , [resultRows]);



            return {
                success: true,
                data: {
                    rejections,
                    approvals,
                    foundIds: foundIdArray
                },
                message: "Notifications retrieved successfully"
            };

        } catch (error) {
            console.error("Error in  StudentService.getStudentNotifications:", error.message);
            return {
                success: false,
                reason: "Internal server error while retrieving notifications"
            };
        }
    }
}

// let obj = new StudentService();
// testing

// obj.getStudentNotifications({userId : '8700fd90-6d15-4ef6-826f-b288445a4c99'})

module.exports = { StudentService };

const { banStudent, unBanStudent, getAllBannedByMeModel } = require('../model/bannigAndUnbanningStudents');
const { rejectingARequest, acceptingRequest, checkingRightOfUnrejector, unrejectingReq, getAllRejectedByMe, getUnsignedByMe } = require('../model/requestRelatedThings');
const { pool } = require('../model/connect');

class staffPrivilleges {
    async banStudentFunction(sentInfo) {
        try {
            // when u  ban a student u will need to have reason  , id , ur id
            let { idNumber, bannedBy, reason } = sentInfo;

            let result = await banStudent({ idNumber, bannedBy, reason });

            if (result.success) {
                return {
                    success: true
                }
            }

            return {
                success: false,
                reason: "Error while banning from db"
            }

        } catch (err) {
            console.log("Error message from staffPrivilleges.banStudent ", err.message);
            return {
                success: false,
                reason: "Error message from staffPrivilleges.banStudent"
            }
        }

    }

    async unBanStudent(sentInfo) {
        try {
            // when u unban a u need to delete 
            // as a business rule u need to be unbanned by someone who has banned u
            // { unbannerId , unbannedId }
            let { idNumberBeingUnBanned, unBannedBy } = sentInfo
            // so the unBannedBy comes from the refresh token and idNumber comes from the user

            let result = await unBanStudent({ idNumberBeingUnBanned, unBannedBy });

            if (result.success) {
                return {
                    success: true
                }
            }

            return {
                success: false,
                reason: "Couldnt unbanStudent"
            }


        } catch (err) {
            console.log("Error message from staffPrivilleges.unBanStudent ", err.message);
            return {
                success: false,
                reason: "Error message from staffPrivilleges.unBanStudent"
            }

        }

    }

    async getAllBannedByMe(sentInfo) {
        try {
            let { bannerId } = sentInfo;
            // do a get request to grasp all users U have banned

            let result = await getAllBannedByMeModel(bannerId);

            if (result.success) {
                if (!result.data) {
                    // meaning the user hasnt banned anyone
                    return {
                        success: true,
                        data: "Has not banned anyone yet"
                    }
                }

                return {
                    success: true,
                    data: result.data

                    // the front end will receive json objects and will decide how it wants to display the results
                }
            }

        } catch (err) {
            console.log("Error while staffPrivilleges.getAllBannedByMe ", err.message);
            return {
                success: false,
                reason: "Error while staffPrivilleges.getAllBannedByMe"
            }

        }

    }

    async reject(sentInfo) {
        try {
            // this is gonna communicate with the rejected_requests
            // and there is a procedure defined in the database so then call that from the model and work
            // rejected_by comes from the refresh token
            // reason comes from the body
            // rejected_request_id comes from the div id
            // in the front end 
            // rejected by id - comes from the access token
            // reason and rejected request id comes from the front end

            let { rejected_by, reason, rejected_request_Id } = sentInfo;

            let result = await rejectingARequest({ rejected_by, reason, rejected_request_Id });

            if (!result) {
                return {
                    success: false,
                    reason: "The rejectingARequest method is not properly running"
                }
            }

            return {
                success: true
            }



        } catch (err) {
            console.log("Error while reject ", err.message)
            return {
                success: false,
                reason: "Error while reject"
            }
        }

    }

    async unreject(sentInfo) {
        try {
            // to unreject
            // we just need the rejected request id
            // then the function from the postgres will do the update on requestFlow
            let { rejectedRequestId, unrejecterId } = sentInfo;
            // but first we need to check if the user who rejected is the one doing the unrejection

            let res = await checkingRightOfUnrejector({ rejectedRequestId, unrejecterId });

            if (res.success) {
                if (res.canUnreject) {
                    let result = await unrejectingReq({ rejectedRequestId, unrejecterId })

                    if (result.success){
                        return{
                            success : true
                        }
                    }

                    return {
                        success : false,
                        reason : "actual unrejection has failed"
                    }
                }
            }

            return {
                success : false,
                reason : "Unrejector not authorized"
            }




        } catch (err) {
            console.log("Error while reject ", err.message)
            return {
                success: false,
                reason: "Error while reject"
            }
        }


    }

    async acceptRequest(sentInfo) {
        try {
            // accepting will update the request Flow
            // role and approverId = from token
            // requestFlowId = from frontEnd 

            let { role, approverId, requestFlowId } = sentInfo;

            let result = await acceptingRequest({ role, approverId, requestFlowId });

            if (!result) {
                return {
                    success: false,
                    reason: "The acceptRequest method is not properly running"
                }
            }

            return {
                success: true
            }



        } catch (err) {
            console.log("Error while acceptRequest ", err.message)
            return {
                success: false,
                reason: "Error while acceptRequest"
            }
        }

    }


    async getUnSignedRequests(sentInfo) {
        // this is a get request and when the staff gets this then 
        // in the front end make sure the div id that u will put the actual tables' id
        // and this will send the police request for everyone who signed it
        // when the request is unsigned we will need to have police request sent to every one 
        try {
            // we query the requestFlow
            // we need the column name only 
            let { role } = sentInfo;
            // we get the role from the access Token

            let result = await getUnsignedByMe({role});

            if (result.success){
                return {
                    success : true,
                    data : result.data
                }
            }

            return {
                success : false
            }

            


        } catch (err){
            console.log("Error while getUnSignedRequests ", err.message)
            return {
                success: false,
                reason: "Error while getUnSignedRequests"
            }
        }

    }

    async gettingAllRejectedByMeService(sentInfo) {
        // this will get all requests that are banned by the user so that he can un reject them
        try {
            let { rejectorId } = sentInfo;
            // this will be a get request for this 
            // from the decoded access token we need to get the userId

            let res = await getAllRejectedByMe({ rejectorId });

            if (res.success){
                // then return the data
                return {
                    success : true,
                    data : res.data
                }
            }

            return {
                success : false,
                reason : "Couldnt do gettingAllRejectedByMeService "
            }



        } catch (err){
            console.log("Error while gettingAllRejectedByMe ", err.message)
            return {
                success: false,
                reason: "Error while gettingAllRejectedByMe"
            }
        }
    }

    async getAllRequests(sentInfo) {
        // Get all requests with filtering options
        try {
            let { status, limit = 50, offset = 0 } = sentInfo;
            
            let query = `
                SELECT rf.*, u.name as student_name, u.email as student_email
                FROM requestFlow rf
                JOIN Users u ON rf.requester_id = u.id
                WHERE 1=1
            `;
            let params = [];
            let paramIndex = 1;

            if (status && status !== 'all') {
                query += ` AND rf.status = $${paramIndex}`;
                params.push(status);
                paramIndex++;
            }

            query += ` ORDER BY rf.created_at DESC LIMIT $${paramIndex} OFFSET $${paramIndex + 1}`;
            params.push(limit, offset);

            let result = await pool.query(query, params);

            return {
                success: true,
                data: result.rows
            };

        } catch (err) {
            console.log("Error while getAllRequests ", err.message);
            return {
                success: false,
                reason: "Error while getAllRequests"
            };
        }
    }

    async getRequestDetails(sentInfo) {
        // Get detailed information about a specific request
        try {
            let { requestId } = sentInfo;

            let result = await pool.query(`
                SELECT rf.*, 
                       u.name as student_name, u.email as student_email, u.department,
                       lib.name as library_signer_name,
                       reg.name as registral_signer_name,
                       police.name as police_signer_name,
                       fin.name as financial_signer_name,
                       bs.name as bookstore_signer_name,
                       dh.name as department_head_signer_name,
                       rr.reason as rejection_reason
                FROM requestFlow rf
                JOIN Users u ON rf.requester_id = u.id
                LEFT JOIN Users lib ON rf.library_sign = lib.id
                LEFT JOIN Users reg ON rf.registral_sign = reg.id
                LEFT JOIN Users police ON rf.campus_police_sign = police.id
                LEFT JOIN Users fin ON rf.financial_sign = fin.id
                LEFT JOIN Users bs ON rf.book_store_sign = bs.id
                LEFT JOIN Users dh ON rf.department_head_sign = dh.id
                LEFT JOIN rejected_requests rr ON rf.rejection_id = rr.id
                WHERE rf.id = $1
            `, [requestId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    reason: "Request not found"
                };
            }

            return {
                success: true,
                data: result.rows[0]
            };

        } catch (err) {
            console.log("Error while getRequestDetails ", err.message);
            return {
                success: false,
                reason: "Error while getRequestDetails"
            };
        }
    }

    async finalizeRequest(sentInfo) {
        // Finalize a request when all signatures are complete (registral approval)
        try {
            let { requestId, staffId } = sentInfo;

            // Check if all required signatures are present
            let result = await pool.query(`
                SELECT library_sign, campus_police_sign, financial_sign, 
                       book_store_sign, department_head_sign, registral_sign
                FROM requestFlow 
                WHERE id = $1
            `, [requestId]);

            if (result.rows.length === 0) {
                return {
                    success: false,
                    reason: "Request not found"
                };
            }

            const request = result.rows[0];
            const requiredSignatures = [
                'library_sign', 'campus_police_sign', 'financial_sign',
                'book_store_sign', 'department_head_sign'
            ];

            const allSigned = requiredSignatures.every(sig => request[sig] !== null);

            if (!allSigned) {
                return {
                    success: false,
                    reason: "Not all required signatures are present"
                };
            }

            // Update status to completed and set registral signature
            await pool.query(`
                UPDATE requestFlow 
                SET status = 'completed', 
                    registral_sign = $1,
                    updated_at = CURRENT_TIMESTAMP
                WHERE id = $2
            `, [staffId, requestId]);

            // Send notification to student
            await pool.query(`
                SELECT pg_notify('request_approved', $1)
            `, [JSON.stringify({ request_id: requestId })]);

            return {
                success: true,
                message: "Request finalized successfully"
            };

        } catch (err) {
            console.log("Error while finalizeRequest ", err.message);
            return {
                success: false,
                reason: "Error while finalizeRequest"
            };
        }
    }

    async getDashboardStats(sentInfo) {
        // Get dashboard statistics for staff
        try {
            let { staffId } = sentInfo;

            const stats = await pool.query(`
                SELECT 
                    COUNT(CASE WHEN status = 'pending' THEN 1 END) as pending_requests,
                    COUNT(CASE WHEN status = 'approved' THEN 1 END) as approved_requests,
                    COUNT(CASE WHEN status = 'rejected' THEN 1 END) as rejected_requests,
                    COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_requests,
                    COUNT(*) as total_requests,
                    COUNT(CASE WHEN created_at >= CURRENT_DATE - INTERVAL '7 days' THEN 1 END) as this_week_requests
                FROM requestFlow
                WHERE requester_id IN (
                    SELECT id FROM Users WHERE role = 'student'
                )
            `);

            const bannedCount = await pool.query(`
                SELECT COUNT(*) as banned_students
                FROM Banned_Students
                WHERE banned_by = $1
            `, [staffId]);

            return {
                success: true,
                data: {
                    ...stats.rows[0],
                    banned_students: parseInt(bannedCount.rows[0].banned_students)
                }
            };

        } catch (err) {
            console.log("Error while getDashboardStats ", err.message);
            return {
                success: false,
                reason: "Error while getDashboardStats"
            };
        }
    }
}


// before making a request about lost id u need to check the banned table

const staffPrivillageObj = new staffPrivilleges();

module.exports = { staffPrivillageObj }
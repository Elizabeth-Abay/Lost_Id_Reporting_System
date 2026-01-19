const { pool } = require('./connect');

async function rejectingARequest(sentInfo) {
    try {
        let { rejected_by, reason, rejected_request_Id } = sentInfo;
        console.log(" rejected_by, ", rejected_by , " reason,  ", reason, " rejected_request_Id" , rejected_request_Id )

        // calling the procedure from the database
        let result = await pool.query('SELECT * FROM stopping_request_flow($1 , $2 , $3)', [rejected_by, reason, rejected_request_Id])

        if (!result) {
            return {
                success: false,
                reason: "Error in database while stopping_request_flow"
            }
        }

        return {
            success: true
        }
    } catch (err) {
        console.log("Error while rejectingARequest ", err.message);
        return {
            success: false,
            reason: "Error while rejectingARequest model "
        }

    }

}


async function acceptingRequest(sentInfo) {
    try {

        console.log("accepting request is fired")
        // to accept a req means to update the requestFlow table
        // there are columns with department names
        // so we need id of approver - from access token
        // we also know the role - from access token
        // so role = campus_police , library , registral , financial , book_store , department_head
        let { role, approverId, requestFlowId } = sentInfo;
        console.log("role from acceptingRequest in reqRelatedThings ", role)

        const roleColumnMap = {
            campus_police: 'campus_police',
            library: 'library',
            registral: 'registral',
            financial: 'financial',
            book_store: 'book_store',
            department_head: 'department_head'
        };

        // console.log("roleColumnMap.campus_police", roleColumnMap.campus_police);

        let columnUpdated = roleColumnMap[role.toLowerCase()];
        console.log("columnUpdated", columnUpdated);

        if (!columnUpdated) {
            return {
                success: false,
                reason: "Invalid role: " + role
            }
        }

        // console.log("type of approverId", typeof (approverId));
        // console.log("approverId value:", approverId);
        // console.log("requestFlowId type:", typeof (requestFlowId));
        // console.log("requestFlowId value:", requestFlowId);

        // // Fix: Ensure UUIDs are properly handled - remove any quotes if present
        // let cleanApproverId = approverId;
        // let cleanRequestFlowId = requestFlowId;

        // // Remove quotes if they exist (common issue with UUID handling)
        // if (typeof approverId === 'string' && approverId.startsWith("'")) {
        //     cleanApproverId = approverId.replace(/'/g, '');
        // }
        // if (typeof requestFlowId === 'string' && requestFlowId.startsWith("'")) {
        //     cleanRequestFlowId = requestFlowId.replace(/'/g, '');
        // }

        // console.log("Cleaned approverId:", cleanApproverId);
        // console.log("Cleaned requestFlowId:", cleanRequestFlowId);

        const result = await pool.query(
            `SELECT * FROM update_request_by_role($1 , $2 , $3)`,
            [columnUpdated, requestFlowId, approverId]
        );

        console.log(result);

        if (result.rowCount === 0) {
            return {
                success: false,
                reason: "Updating the requestFlow from the acceptingRequest problem"
            }
        }

        return {
            success: true
        }


    } catch (err) {
        console.log("Error while acceptingRequest ", err);
        return {
            success: false,
            reason: "Error while acceptingRequest model "
        }

    }

}

async function checkingRightOfUnrejector(sentInfo) {
    try {
        let { rejectedRequestId, unrejecterId } = sentInfo;

        let result = await pool.query('SELECT * FROM  rejected_requests WHERE id = $1 AND rejected_by = $2', [rejectedRequestId, unrejecterId]);

        // so this user can do what ever he wants to the request
        if (!result) {
            return {
                success: true,
                canUnreject: false,
                reason: "User unauthorized"
            }
        }

        return {
            success: true,
            canUnreject: true
        }

    } catch (err) {
        console.log("Error while checkingRightOfUnrejector ", err.message);
        return {
            success: false,
            reason: "Error while checkingRightOfUnrejector model "
        }
    }

}


async function unrejectingReq(sentInfo) {
    try {
        // sentInfo needs to contain the id of rejected_request
        let { rejectedRequestId, unrejecterId } = sentInfo;

        // first check if the user is actually the one doing the unrejection

        let result = await pool.query('SELECT * FROM unrejectingRequest($1)', [rejectedRequestId]);

        if (!result) {
            return {
                success: false,
                reason: "Database update is wrong"
            }
        }

        return {
            success: true
        }

    } catch (err) {
        console.log("Error while acceptingRequest ", err.message);
        return {
            success: false,
            reason: "Error while acceptingRequest model "
        }

    }

}

async function getAllRejectedByMe(sentInfo) {
    try {
        let { rejectorId } = sentInfo;
        let result = await pool.query(
            `SELECT  rr.id , rr.reason , rr.created_at , u.name , u.id_number 
            FROM rejected_requests AS rr
            JOIN requestFlow AS rf ON rr.rejected_request_id = rf.id
            JOIN Users AS u ON rf.requester_id = u.id
            WHERE  rr.rejected_by = $1;
            `, [rejectorId]
        )

        if (!result) {
            return {
                success: false,
                reason: "No thing got"
            }
        }

        console.log("Result received " ,  result.rows)

        return {
            success: true,
            data: result.rows
        }

    } catch (err) {
        console.log("Error while getAllRejectedByMe ", err.message);
        return {
            success: false,
            reason: "Error while getAllRejectedByMe"
        }
    }

}


async function getUnsignedByMe(sentInfo) {
    try {
        let { role, userId, department } = sentInfo;


        const roleColumnMap = {
            campus_police: 'campuspolice_sign',
            library: 'library_sign',
            registral: 'registral_sign',
            financial: 'finance_sign',
            book_store: 'bookstore_sign',
            department_head: 'departmenthead_sign'
        };

        // console.log("roleColumnMap.campus_police", roleColumnMap.campus_police);

        let columnUpdated = roleColumnMap[role.toLowerCase()];
        console.log("columnUpdated", columnUpdated);


        // so here get the department from the table or acces token


        let query = `
            SELECT rf.policeDocument, rf.id, rf.id_number, u.name as student_name, u.department as student_department
            FROM requestFlow rf
            JOIN Users u ON rf.requester_id = u.id
            WHERE ${columnUpdated} IS NULL AND rf.status = 'pending'
        `;

        let params = [];

        // If department head, filter by their department
        if (role === 'department_head') {
            // first get the department they are heading from users table
            let result = await pool.query(
                `SELECT department FROM Users WHERE id = $1`, [userId]
            );

            let depHeaded = result.rows[0].department

            query = `
                SELECT rf.policeDocument, rf.id, rf.id_number, u.name as student_name, u.department as student_department
                FROM requestFlow rf
                JOIN Users u ON rf.requester_id = u.id
                WHERE 
                    ${columnUpdated} IS NULL 
                    AND 
                    rf.status = 'pending'
                    AND 
                    u.department = $1
            `
            params.push(depHeaded)
        }


        if (role === 'registral') {
            // then only get items that are signed by all the others 
            // and also notify the students and set status to be approved 
            // select items where there are no null columns

            query = `
                SELECT * 
                FROM requestFlow
                WHERE  registral_sign IS NULL
                AND status = 'pending'
                AND num_nulls(
                library_sign ,
                campuspolice_sign,
                finance_sign,
                bookstore_sign,
                departmenthead_sign
            ) = 0
            `
        }


        console.log("query")
        let result = await pool.query(query, params);
        console.log("result from getting Unsigned 0 ", result.rows)

        if (!result) {
            return {
                success: true,
                rowCount: 0,
                reason: "No more visible thing"
            }
        }

        return {
            success: true,
            data: result.rows
        }

    } catch (err) {
        console.log("Error while getUnsignedByMe ", err.message)
        return {
            success: false,
            reason: "Error while getUnsignedByMe"
        }
    }
}

async function getFinalApprovalsForRegistry(sentInfo) {
    try {
        // Registry can only see requests that have all other signatures but missing registry signature
        let query = `
            SELECT rf.policeDocument, rf.id, rf.id_number, u.name as student_name, u.department as student_department,
                   rf.library_sign, rf.campus_police_sign, rf.financial_sign, 
                   rf.book_store_sign, rf.department_head_sign
            FROM requestFlow rf
            JOIN Users u ON rf.requester_id = u.id
            WHERE rf.registral_sign IS NULL 
            AND rf.status = 'pending'
            AND rf.library_sign IS NOT NULL
            AND rf.campus_police_sign IS NOT NULL
            AND rf.financial_sign IS NOT NULL
            AND rf.book_store_sign IS NOT NULL
            AND rf.department_head_sign IS NOT NULL
            ORDER BY rf.created_at ASC
        `;

        let result = await pool.query(query);

        if (!result) {
            return {
                success: true,
                rowCount: 0,
                reason: "No requests ready for final approval"
            }
        }

        return {
            success: true,
            data: result.rows
        }

    } catch (err) {
        console.log("Error while getFinalApprovalsForRegistry ", err.message)
        return {
            success: false,
            reason: "Error while getFinalApprovalsForRegistry"
        }
    }
}





module.exports = { rejectingARequest, acceptingRequest, checkingRightOfUnrejector, unrejectingReq, getAllRejectedByMe, getUnsignedByMe, getFinalApprovalsForRegistry }
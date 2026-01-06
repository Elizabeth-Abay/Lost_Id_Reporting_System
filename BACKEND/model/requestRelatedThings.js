const { pool } = require('./connect');

async function rejectingARequest(sentInfo) {
    try {
        let { rejected_by, reason, rejected_request_Id } = sentInfo;

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
        // to accept a req means to update the requestFlow
        // there are columns with department names
        // so we need id of approver - from access token
        // we also know the role - from access token
        // so role = campus_police , library , registral , financial , book_store , department_head
        let { role, approverId, requestFlowId } = sentInfo;

        let columnUpdated = role + '_sign';

        console.log(columnUpdated);

        let result = await pool.query(`UPDATE requestFlow SET ${columnUpdated} = $1 WHERE id = $2`, [approverId, requestFlowId]);

        if (!result) {
            return {
                success: false,
                reason: "Updating the requestFlow from the acceptingRequest problem"
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
            'SELECT * FROM rejected_requests WHERE  rejected_by = $1', [rejectorId]
        )

        if (!result) {
            return {
                success: false,
                reason: "No thing got"
            }
        }

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
        let { role } = sentInfo;

        let colName = role + '_sign'

        let result = await pool.query(
            `SELECT police_document , id FROM requestFlow WHERE ${colName} IS NULL AND status = 'pending'`
        )

        // we will get police_document which is the image
        // and the id of the request which will be made the div's id when sent to the frontend

        if (!result){
            return {
                success : true,
                rowCount : 0,
                reason : "No more visible thing"
            }
        }

        return {
            success : true,
            data : result.rows
        }

    } catch (err) {
        console.log("Error while getUnsignedByMe ", err.message)
        return {
            success: false,
            reason: "Error while getUnsignedByMe"
        }
    }

}

module.exports = { rejectingARequest, acceptingRequest, checkingRightOfUnrejector, unrejectingReq, getAllRejectedByMe , getUnsignedByMe }
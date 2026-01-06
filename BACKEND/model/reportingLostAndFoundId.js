const { pool } = require("./connect.js");

async function reportLostId(sentInfo) {
    try {
        // let {userId, lostIdNumber } = sentInfo
        let { userId, lostIdNumber } = sentInfo;
        // here the userId comes from the decoded access token
        // and lostId comes from input form
        const query = `
            SELECT *
            FROM insertingIntoLostIdReport($1, $2);
        `;

        const values = [userId, lostIdNumber];

        const result = await pool.query(query, values);

        const insertedRow = result.rows[0];

        if (!insertedRow) {
            return {
                success: false,
                reason: "Lost ID report failed"
            };
        }

        return {
            success: true,
            data : insertedRow
        };

    } catch (err) {
        console.error("Database error while reporting lost ID ".err.message);

        return {
            success: false,
            reason: "Database error while reporting lost ID"
        };
    }
}


async function reportFoundId(sentInfo) {
    try {

        let {founderName, contactInfo, foundIdNumber, foundAt} = sentInfo;
        const query = `
            SELECT *
            FROM insertingIntoFoundIdReport($1, $2, $3, $4);
        `;

        const values = [
            founderName,
            contactInfo,
            foundIdNumber,
            foundAt
        ];

        const result = await pool.query(query, values);

        const insertedRow = result.rows[0];

        if (!insertedRow) {
            return {
                success: false,
                reason: "Found ID report failed"
            };
        }

        return {
            success: true,
            data: insertedRow
        };

    } catch (Err) {
        console.error("Database error while reporting found ID ".err.message);

        return {
            success: false,
            reason: "Database error while reporting lost ID"
        };
    }
}

module.exports = { reportLostId , reportFoundId };

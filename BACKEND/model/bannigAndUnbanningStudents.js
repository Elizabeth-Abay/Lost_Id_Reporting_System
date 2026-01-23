const { pool } = require("./connect.js");

async function banStudent(sentInfo) {
    try {
        let {idNumber, bannedBy, reason } = sentInfo;
        const query = `
            INSERT INTO Banned_Students (id_number, banned_by, reason)
            VALUES ($1, $2, $3)
            RETURNING *;
        `;

        const values = [idNumber, bannedBy, reason];

        const result = await pool.query(query, values);

        const bannedRow = result.rows[0];

        if (!bannedRow) {
            return {
                success: false,
                reason: "Failed to ban student"
            };
        }

        return {
            success: true
        };

    } catch (err) {
        console.log("Database error while banning student" , err.message);

        return {
            success: false,
            reason: "Database error while banning student"
        };
    }
}


async function unBanStudent(sentInfo) {
    try{
        let {idNumberBeingUnBanned , unBannedBy } = sentInfo;
        let query = `DELETE FROM Banned_Students WHERE id_number = $1 AND banned_by = $2`;

        let result = await pool.query(query , [idNumberBeingUnBanned , unBannedBy]);

        if (result.rowCount === 0){
            return {
                success : false,
                reason : "Deletion failed from unBanStudent"
            }
        } else {
            return {
                success : true
            }
        }

    } catch (err){
        console.log("Error from  unBanStudent " , err.message);
        return {
            success: false,
            reason: "Database error while unbanning student"
        }
    }
    
}


async function getAllBannedByMeModel(bannerId) {
    try{
        let query = 'SELECT * FROM Banned_Students WHERE banned_by = $1';

        let result = await pool.query(query , [bannerId]);

        if (result.rowCount === 0){
            return {
                success : true,
                data : ''
            }
        }

        return {
            success : true,
            data : result.rows
        }

    } catch (err){
        console.log("Error while getAllBannedBy " , err.message);
        return {
            success : false,
            reason : "Error while getAllBannedBy"
        }
    }
    
}


module.exports = { banStudent , unBanStudent  , getAllBannedByMeModel };
// inorder to ban a student someone needs to be a staff
// when u unban a student delete the whole row from the banned students

// given the id number this model will check the banned table

const { pool } = require('./connect');

async function isStudentBanned(id) {
    try {
        let query = `SELECT * FROM Banned_Students WHERE id_number = $1`;

        let result = await pool.query(query, [id]);

        if (result.rowCount > 0) {
            // means the student is banned
            return {
                success: true,
                isStudentBanned: true

                // isStudentBanned = true means then he is banned
            }
        }

        return {
            success: true,
            isStudentBanned: false
        }

    } catch (err) {
        console.log("Error while isStudentBanned from model layer", err.message);
        return {
            success: false,
            reason: "Error while isStudentBanned"
        }
    }

}

// if success = false and reason = null means the student is not Banned
module.exports = { isStudentBanned }
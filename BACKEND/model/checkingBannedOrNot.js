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


async function isStudentIdAndIdNumMatching(sentInfo) {
    try{
        let { userId, idNumber } = sentInfo;

        let res = await pool.query(`SELECT id_number FROM Users WHERE id = $1` , [userId]);

        if (res.rowCount === 0){
            return {
                success : false ,
                reason : "Student Id doesn't exist"
            }
        }

        let idNumberFromDb = res.rows[0]?.id_number;

        // console.log(idNumberFromDb)

        if (idNumberFromDb.toLowerCase() === idNumber.toLowerCase()){
            return {
                success : true
            }
        }

        return {
            success : false ,
            reason : "Id number is mismatched"
        }

    

    } catch (err){
        console.log("Error while isStudentIdAndIdNumMatching from model layer" , err.message);
        return {
            success: false,
            reason: "Error while isStudentIdAndIdNumMatching"
        }
    }
    
}

// if success = false and reason = null means the student is not Banned
module.exports = { isStudentBanned ,  isStudentIdAndIdNumMatching}
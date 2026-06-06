const { pool } = require('./connect.js');
const crypto = require('crypto');

async function InvalidateRefreshToken( tokenHash ) {
    try{
        // this is the token's hash (token_hash column)
        let result = await pool.query("UPDATE refreshToken SET isValid = false  WHERE token_hash = $1" , [tokenHash]);

        if (result.rowCount === 0){
            return {
                success : false,
                reason : "DataBase Update problem"
            }
        }

        return {
            success : true
        }

    } catch (err){
        console.log("Error from InvalidateRefreshToken " , err.message);
        return {
            success : false,
            reason : "internal server error"
        }
    }    
}

// InvalidateRefreshToken('7687c78e-ca16-4431-9c78-60ad2a222171')


module.exports = { InvalidateRefreshToken }
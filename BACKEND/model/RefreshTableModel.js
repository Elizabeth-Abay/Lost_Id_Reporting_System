const { pool } = require('./connect.js');


async function retrieveRefTokenInfo(hashedTokenInfo) {
    try{
        let result = await pool.query('SELECT user_id , user_role , isValid FROM refreshToken WHERE token_hash = $1' , [hashedTokenInfo]);

        let infoSelected = result.rows[0];

        if (!infoSelected) {
            return {
                success : false,
                reason : "Refresh token not found"
            }
        }

        return {
            success : true,
            data : infoSelected
        }

    } catch (err){
        console.log(err.message)
        return {
            success : false,
            reason : "The hashed Token info is incorrect"
        }
    }
    
}

module.exports = { retrieveRefTokenInfo }
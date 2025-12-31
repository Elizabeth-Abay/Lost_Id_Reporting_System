const { pool } = require('./connect.js');

// when user logs in
// check the email and password match
// password needs to be hashed when u send it

async function givenEmailSelectPassword(sentInfo) {
    try {
        // sentInfo = { email }
        let { email } = sentInfo;
        let result = await pool.query('SELECT * FROM verified_users WHERE email = $1', [email]);

        let userSelected = result.rows[0];

        if (userSelected) {
            let password = userSelected?.password_hashed;
            let id = userSelected?.id;
            let role = userSelected?.role

            return {
                success: true,
                data: {
                    password,
                    id,
                    role
                }
            }
        } else {
            // if no user exists
            return {
                success: false,
                reason: "check email or password"
            }

        }

    } catch (err) {
        console.log("EmailAndPasswordCorrectForLogIn : ", err.message);
        return {
            success: false,
            reason: "error while EmailAndPasswordCorrectForLogIn"
        }
    }

}


module.exports = { givenEmailSelectPassword }
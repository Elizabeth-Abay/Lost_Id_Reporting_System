const { pool } = require('./connect.js')

// so now u write the sql query using pool.query()
// note when u create a user u dont want to have the same email from verified

async function checkEmailIsVerifiedBefore(email) {
    try {
        let result = await pool.query('SELECT * FROM Users WHERE email = $1', [email])

        

        //  if result is null - no user exists so return true

        // console.log(result.rows.length); - will tell u actually how many users are there with that email = 0
        if (result.rowCount === 0) {
            return {
                success: true
            }
        }

        else {
            return {
                success: false,
                reason: "duplicate email"
            }
        }

    } catch (err) {
        console.log("checkEmailIsVerifiedBefore error : ", err.message)
        return {
            success: false,
            reason: "error while checkEmailIsVerifiedBefore"
        }
    }

}


// checkEmailIsVerifiedBefore('elizabethabay21@gmail.com');

async function createPendingUser(userInformation) {
    try {
        // userInformation = { name , email , password_hashed , otp_hashed}
        console.log("createPendingUser called with " , userInformation)
        let { id_number, email, password_hashed, otp_hashed, role  , name , department} = userInformation;

        let isUserDuplicateEmail = await checkEmailIsVerifiedBefore(email);
        console.log("checkEmailIsVerifiedBefore " , isUserDuplicateEmail)
        // here successs means u can go on to create
        // then this will mean there wont be 2 users with the same email

        if (isUserDuplicateEmail?.success) {
            let userPending = await pool.query(
                'INSERT INTO pendingUsers(id_number , email , password , role , otp_hashed , name , department) VALUES( $1 , $2 , $3 , $4 , $5 , $6 , $7)',
                [id_number, email, password_hashed, role , otp_hashed , name , department]
            );

            if (userPending.rowCount === 0){
                return {
                    success : false,
                    reason : "User not created"
                }
            }

            
            console.log("User is created")
            return {
                success: true
                // data : userPending -i dont need to send the user information
            }
        }
        else if (!isUserDuplicateEmail.success && isUserDuplicateEmail.reason === "duplicate email") {
            // there is no error but the email is duplicated
            return {
                success: false,
                reason: "email Duplicated"
            }
        }


    } catch (err) {
        console.log("createPendingUser error : ", err.message);
        return {
            success: false,
            reason: "error while createPendingUser"
        }

    }


}

async function checkTheOTPmatches(sentInfo) {
    try {
        // sentInfo = {email , OTP}
        let { email, OTP_hashed } = sentInfo;
        // console.log(sentInfo)

        // this func will return the id so that the backend can delete the user
        // if not matched then it returns null

        // check if the otp matches from the email and if it does delete
        // otp will be sent in hashed form


        let result = await pool.query('SELECT * FROM pendingUsers WHERE email = $1', [email]);
        // if the user clicked sign up many times and then result will be the whole thing

        // console.log(result.rowCount)

        let returned = result.rows[0];
        // this will always be the first one


        if (!returned) {
            return {
                success: false,
                reason: "email invalid"
            }
        }

        

        // check if hashed OTP and database's OTP match
        if (OTP_hashed.trim() === returned.otp_hashed.trim()) {
            // console.log(returned.id);
            return {
                success: true,
                data: {
                    id: returned.id,
                    role: returned.role
                }
            }
        }

        else {
            return {
                success: false,
                reason: "Unmatched OTP"
            }
        }
    } catch (error) {
        console.log("checkTheOTPmatches error : ", error.message)
        return {
            success: false,
            reason: "error while checkTheOTPmatches"

        }
    }

}

// checkTheOTPmatches({email : 'elizabethabay21@gmail.com' , OTP : '3JqdLs#W'})


async function deleteUserFromPendingState(sentInfo) {
    try {
        let { id } = sentInfo;
        let result = await pool.query('DELETE FROM pendingUsers WHERE id = $1', [id]);

        // console.log("Result from the deleteUserFromPendingState", result)

        return {
            success: true
        }
    } catch (err) {
        console.log("deleteUserFromPendingState error : ", err.message)
        return {
            success: false,
            reason: "error while deleteUserFromPendingState"
        };
    }
}

// so whenever u use this check the returned object's isError attribute
// so the model of communication is if it is a silent job : success only will be returned
// if it needs data send {success , data}
// if it failes {success , reason}


async function puttingInfoIntoRefTokenInfo(sentInfo) {
    try {
        let { userId, hashedTokenInfo, role } = sentInfo;
        // console.log({ id , userId }   , "from puttingInfoIntoRefTokenInfo")
        let res = await pool.query('INSERT INTO refreshToken(user_id , token_hash , user_role) VALUES ($1, $2, $3)', [userId, hashedTokenInfo, role]);

        if (!res){
            return {
                success : false,
                reason : "Couldn't put information into the database"
            }

        }

        return {
            success: true
        }

    } catch (err) {
        console.log("puttingInfoIntoRefTokenInfo error : ", err.message);
        return {
            success: false,
            reason: "error while puttingInfoIntoRefTokenInfo"
        }
    }

}


async function updateOTP(sentInfo) {
    try {
        // sentInfo = { email , OTP }
        let { email, OTP } = sentInfo;
        let result = await pool.query('UPDATE pendingUsers SET otpHashed = $2 WHERE email = $1', [email, OTP]);

        if (result.rowCount === 0) {
            // then nothing got updated so return unsuccessful
            return {
                success: false,
                reason: "Couldn't find the row"
            }
        } else {
            // then the row was properly updated so return success
            return {
                success: true,
            }
        }
        // since email is unique there are only 2 things either updated or not


    } catch (err) {
        // errors thrown by the database will be caught here
        console.log(err.message);
        return {
            success: false,
            reason: "Error while updateOTP"
        }


    }

}


module.exports = { checkEmailIsVerifiedBefore, createPendingUser, checkTheOTPmatches, deleteUserFromPendingState, puttingInfoIntoRefTokenInfo , updateOTP }
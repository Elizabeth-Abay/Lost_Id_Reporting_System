// So here the plan is to use the OOP principles to build 2 classes
// One for sign up 
// One for log in and sign Out
// and instantiate and export objects from the two classes

const { givenEmailSelectPassword } = require('../model/userLogInModel.js');
const { createAccessToken, createRefreshToken } = require('./AccessAndRefreshTokenGen.js');

const { InvalidateRefreshToken } = require('../model/userSignOutModel.js');

const { sendingOTPEmail } = require('./EmailAndAssociatedThings.js');



const bcrypt = require('bcrypt'); // to hash the password for sign up and log in

const otpGenerator = require('otp-generator'); // generate otp for sign up

const crypto = require('crypto'); // quick hashing for the otp and useful for generating a string for the refresh token
// const { v4: uuidv4 } = require('uuid'); // generate random strings for refresh tokens

const EventEmitter = require('events'); // emit and listen for events for when user sign up to send emails






// to talk with the database u need a function defined from the model
const { createPendingUser, checkTheOTPmatches, deleteUserFromPendingState, updateOTP } = require('../model/userSignUpModel.js')
const { welcomingUsersUponSignUp } = require('../events/userSignUpListener.js');





class SignUpHandler extends EventEmitter {

    constructor() {
        super();
        this.on('user_created', welcomingUsersUponSignUp);
        // setting up thie listener
        // console.log(signUpEventListener);
    };

    async userSignUp(sentInfo) {
        try {
            // sentInfo = { id_number ,  role , email , password }
            // this is the function that will put the user inside the database
            console.log("userSignUp is called with ", sentInfo)

            // hash the password 
            let saltgen = await bcrypt.genSalt();
            let hashedPw = await bcrypt.hash(sentInfo.password, saltgen);
            // when u hash a password bcrypt generates a random salt and gives u the slowly hashed pw + salt


            // create otp 
            let OTP = otpGenerator.generate(
                6, {
                digits: true,
                upperCaseAlphabets: true,
                lowerCaseAlphabets: true
            }
            ); // the otp has 8 digits and has got all the object's types

            console.log("OTP generated ", OTP);



            // hash the otp
            // while hashing the otp u dont need slow hashing algorithms bc it is short-lived
            // so use crypto with faster hashing algo
            let hashedOTP = crypto.createHash('sha1').update(OTP).digest('hex');
            // hash the otp with sha1 algo and create the hash with hexadecimal representation


            // request the model to insert the user into pending
            let userPending = await createPendingUser({
                name : sentInfo.name,
                id_number: sentInfo.id_number,
                email: sentInfo.email,
                password_hashed: hashedPw,
                otp_hashed: hashedOTP,
                role: sentInfo.role,
                department : sentInfo.department
            });

            // console.log(OTP);
            // console.log("Hello")

            // console.log(userPending)
            if (userPending.success) {
                console.log("event is emitted")

                // and then once the user has entered into the 
                // database then emit an event to notify listeners to send the email


                // this part will send a welcome email upon sign up
                this.emit('user_created', {
                    email: sentInfo.email,
                })

                // and also send the otp
                let res = await sendingOTPEmail({ email: sentInfo.email, OTP })

                if (res.success) {
                    return {
                        success: true
                    }
                } 
                
                return {
                    success : false,
                    reason : "Error while sending email"
                }


            }

            return userPending;

        } catch (err) {
            console.log("signUpService.userSignUp error : ", err.message)
            return {
                success: false,
                reason: "error while signUpService.userSignUp"
            }
        }

        // console.log("Is it correct ie is user inserted properly userSignUpService line 66 " , isItCorrect)

    }


    // emit events bc it needs to resend the email
    // this layer talks to the model to update the otp hashed
    async resendOtp(sentInfo) {
        try {
            // sentInfo = { email }
            let { email } = sentInfo;
            // then regenerate the OTP hash it and update it and then emit the event
            let OTP = otpGenerator.generate(
                6, {
                digits: true,
                upperCaseAlphabets: true,
                lowerCaseAlphabets: true
            }
            );
            let hashedOTP = crypto.createHash('sha1').update(OTP).digest('hex');
            // digest vs to String 
            // digest means finalize the hash
            // toString means convert to string it wont finalize the hash

            // then go to the model and update the hashed otp

            sentInfo.OTP = hashedOTP;

            let updatedUserOTP = await updateOTP(sentInfo);

            // console.log("updatedUserOTP " , updatedUserOTP)
            console.log("updatedUserOTP", updatedUserOTP)

            if (updatedUserOTP.success) {
                // then resend the email

                let otpSender = await sendingOTPEmail({ email, OTP });
                console.log(otpSender)

                if (otpSender.success) {
                    return {
                        success: true
                    }
                }
                // this can only return success or throw an error

            } else {
                return {
                    success: false,
                    reason: updatedUserOTP.reason
                }
            }

        } catch (err) {
            console.log("Error from resendOtp", err.message)
            return {
                success: false,
                reason: err.message
            }
        }
    }


    async ValidateOTPandGenerateTokens(sentInfo) {
        try {
            // sentInfo = { email , OTP }  ** the otp is sent unhashed

            let { email, OTP } = sentInfo;

            // hash the otp
            let OTP_hashed = crypto.createHash('sha1').update(OTP).digest('hex');


            let doesOTPMatch = await checkTheOTPmatches({ email, OTP_hashed });
            console.log("doesOTPMatch result ", doesOTPMatch);

            if (doesOTPMatch.success) {
                let dataReceived = doesOTPMatch.data;
                // first delete OTP info from pending user
                let verified = await deleteUserFromPendingState({ id: dataReceived.id });
                // then go on and generate access and refresh tokens

                if (verified.success) {
                    // Default role to "user" - you may want to retrieve this from database in the future
                    let role = dataReceived.role; 
                    let randomString = crypto.randomBytes(64).toString("hex"); // Generate random string for refresh token

                    let accessToken = createAccessToken({ userId: dataReceived.id, role });

                    let refreshToken = await createRefreshToken({ userId: dataReceived.id, randomString, role });

                    return {
                        success: true,
                        data: {
                            accessToken: accessToken.data,
                            refreshToken: refreshToken.data,
                            role 
                        }
                    }

                }

                else {
                    return {
                        success: false,
                        reason: "Couldn't delete the user from pending state"
                    }
                }
            }

            else {
                // ie the otp dont match or internal server error response 
                // determined after uk the reason in the controller
                return doesOTPMatch;
            }
        } catch (err) {
            console.log("ValidateOTPandGenerateTokens error", err.message);
            return {
                success: false,
                reason: "error while ValidateOTPandGenerateTokens"
            }
        }

    }
}



class UserLogInSignOut {
    constructor() { }


    async SignOut(sentInfo) {
        try {
            // sentInfo = {refreshToken}
            // when user signs out we just invalidate the refresh token from the backend
            let { randomString } = sentInfo;
            // first decode the refresh token to get the randomString, then hash it to get token_hash

            let tokenHash = crypto.createHash("sha256").update(randomString).digest("hex");

            let result = await InvalidateRefreshToken(tokenHash);

            if (result.success) {
                return {
                    success: true,
                }
            } else {
                return {
                    success: false,
                    reason: "Error from InvalidateRefreshToken in the model"
                }
            }

        } catch (err) {
            console.log("Error from UserLogInLogOutSignOut.SignOut ", err.message);
            return {
                success: false,
                reason: "Error while UserLogInLogOutSignOut.SignOut"
            }
        }
    }

    async LogIn(sentInfo) {
        try {
            // sentInfo = {email , password} ** password is unhashed
            let { email, password } = sentInfo;



            // then receive the password from the model
            let passwordHased = await givenEmailSelectPassword({ email });
            // we first need to check if the user belongs to the correct email


            if (passwordHased.success) {
                // ie the request was successful
                // compare the password given with the hashed version
                let passwordsMatch = await bcrypt.compare(password, passwordHased.data.password);
                console.log("passwordsMatch", passwordsMatch);

                if (passwordsMatch) {
                    // generate and send the access and refresh token
                    let userId = passwordHased.data.id;
                    let role = passwordHased.data.role; // role comes from the database not from the user 
                    // Default role to "user" - you may want to retrieve this from database in the future
                    let randomString = crypto.randomBytes(64).toString("hex"); // Generate random string for refresh token

                    let accessToken = createAccessToken({ userId, role });
                    let refreshToken = await createRefreshToken({ userId, randomString, role });

                    return {
                        success: true,
                        data: {
                            accessToken: accessToken.data,
                            refreshToken: refreshToken.data,
                            role
                        }
                    }

                } else {
                    // passwords dont match
                    return {
                        success: false,
                        reason: "password or email mismatch"
                    }
                }


            } else {
                // the request failed during database retrieval
                return passwordHased;
            }
        } catch (err) {
            console.log("UserLogInLogOutSignOut.LogIn Error :  ", err);
            return {
                success: false,
                reason: "Error while UserLogInLogOutSignOut.LogIn "
            }
        }


    }
}



let LogInLogOutSignOutHandler = new UserLogInSignOut();


let signUpService = new SignUpHandler();

module.exports = { LogInLogOutSignOutHandler, signUpService }


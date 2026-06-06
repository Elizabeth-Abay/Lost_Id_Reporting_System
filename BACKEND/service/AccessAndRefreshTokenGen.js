const jwt = require('jsonwebtoken');

const dotenv = require('dotenv');

const path = require('path');

const crypto = require('crypto');
// crypto used to create hashed version of the random string


const { retrieveRefTokenInfo } = require('../model/RefreshTableModel.js')

dotenv.config({ path: path.resolve(__dirname, '../../.env') })


let { puttingInfoIntoRefTokenInfo } = require('../model/userSignUpModel.js')



// we use jwt.sign(object , secret_key) - *** this will return the toke
// to store the object's payload in the token
// so u will have a middleware for ur requests to check if the
// user's token is signed by the server or not
// accessTokens have 3 parts :
// Header.Payload.Signature
// Header - tells the algo and type
// Payload - tells the actual info u want to send
// Signature - is like for a lookup when jwt.verify(token ,  secret)
// then it will take the header and payload and hash them with the secret u
//  provide and checks if it is same with Signature
// bc jwt tokens they are encoded not encrypted u can parse and see the inside info
// using
// const token = "YOUR.JWT.TOKEN";
// const payload = JSON.parse(
//     Buffer.from(token.split('.')[1], 'base64').toString()
// );
// console.log(payload);



function createAccessToken(sentInfo) {
    try {
        // bc the server needs to do the same thing when user logs in
        // params for access token - userId and expiration date
        // First send the refresh token
        // Then get the userId and role from the refreshtokens table 
        // THen generate

        // sentInfo = {userId , role}
        // expiration date for an access token is - 1 hr = 3600 seconds
        // JWT exp expects seconds since epoch, not milliseconds
        let expirationTime = 3600; // 1hr in seconds

        let currently = Math.floor(Date.now() / 1000); // Convert to seconds
        // expire after 1 hr so 

        sentInfo.exp = currently + expirationTime


        let accessToken = jwt.sign(sentInfo, process.env.ACCESS_TOKEN_SECRET);
        // the ACCESS_TOKEN_SECRET is generated from crypto by this function 
        // crypto.randomBytes(64).toString("hex") and they are secret

        return {
            success: true,
            data: accessToken
        };


    } catch (err) {
        console.log("createAccessToken error : ", err.message);
        return {
            success: false,
            reason: "error while createAccessToken"
        }
    }

}

async function createRefreshToken(sentInfo) {
    try {
        // sentInfo = { randomString , userId , role }
        // it is sthg that is done repeatedly 
        // when u create a refresh token u need to have - just send the random string to the client 
        // but when generate a ref token u need to know who it belongs to thus userId 
        // u also need a separate table to store refresh token info
        // refresh token expires in 20 days

        // one user single account but on diff devices how is that possible

        // console.log("sentInfo for the refresh token generator function : ", sentInfo.randomString)
        // let id = uuidv4(); // this will be the id of the ref token
        // sentInfo.id = id;  // no id is req bc we will store the random string and that will be used to identify the user

        // by default they need to have their exp date set to avoid looking at the db before invalidating them
        let twenty_days_from_now = 20 * 24 * 60 * 60;
        let hashedTokenInfo = crypto.createHash("sha256").update(sentInfo.randomString).digest("hex");
        let role = sentInfo.role;

        let sentInfoToDataBase = {
            userId : sentInfo.userId,
            hashedTokenInfo,
            role
        }; // this is what we send to the db

        let sentToBeSigned = {
            exp : Date.now() / 1000 + twenty_days_from_now ,
            randomString : sentInfo.randomString ,  // then use that to get userID and invalid or valid
            // so backend can hash it and get the info abt the ref token when generating access token to retrieve the info 
            // from the database
        }; // this is what we send to the client


        let result = await puttingInfoIntoRefTokenInfo(sentInfoToDataBase);

        if (result.success) {
            // then return the token for the user 
            let refreshToken = jwt.sign(sentToBeSigned , process.env.REFRESH_TOKEN_SECRET);

            return {
                success: true,
                data: refreshToken
            }
        }

        else {
            // ie there is error so res.send 500 internal server error
            return {
                success: false,
                reason: "couldn't create refresh token"
            }
        }

    } catch (err) {
        console.log("error while createRefreshToken : ", err.message);
        return {
            success: false,
            reason: "error while createRefreshToken"
        }
    }

}



async function givenRefGenerateAccess(sentInfo) {
    // this needs to be called with the decodedRefresh
    // sentInfo = {exp ,randomString ,role}
    // so first hash the randomString and use that as a way to access the table row
    let { randomString } =  sentInfo
    let hashedTokenInfo = crypto.createHash("sha256").update(randomString).digest("hex");

    let result = await retrieveRefTokenInfo(hashedTokenInfo);

    if (result.success){
        // then the hashed information has been found
        let dataReceived = result.data;

        if (!dataReceived.is_valid){
            // ie the token is invalid
            return {
                success : false,
                reason : "Invalid Ref Token"
            }
        } else {
            // ie if the token is valid
            // then proceed to generate the access token
            let sentInfo = {
                userId : dataReceived.user_id , 
                role : dataReceived.user_role
            }

            let result2 = createAccessToken(sentInfo);
            // bc the creation of access token happens immediately

            if (result2.success){
                // then return the access Token
                return {
                    success : true,
                    data : result2.data
                }
            } else{
                // ie u cldnt generate the access token
                return {
                    success : false,
                    reason : "Couldn't generate the accessToken"
                }
            }
        } 
    } else {
        // If retrieving token info failed
        return {
            success: false,
            reason: result.reason || "Invalid refresh token"
        };
    }

    // then send that to the model and access 
    // if the hash is correct then we receive all the validity information...
    

    
}

module.exports = { createAccessToken, createRefreshToken , givenRefGenerateAccess }
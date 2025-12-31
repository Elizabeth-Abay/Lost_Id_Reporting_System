// when the user signs up 
// this file checks all the neccessary info is present before sending it to the service layer
// so to sign up the front end sends : username , email , password(make sure u confirmed the front-end info)
// and also enforces the express-rate-limiter 



const jwtDecode = require('jwt-decode');

const { signUpService } = require('../service/userLogInSignUpSignOutService.js');

const { LogInLogOutSignOutHandler } = require('../service/userLogInSignUpSignOutService.js');




let healthChecker = (req, res) => {
    res.send('Hello from the Server Side ## userSignUpLogInRouter')
}


let signUpFunction = async (req, res) => {
    try {
        // first check if all the info is present
        let sentInfo = req.body;
        // sentInfo = { username , email , password }
        console.log("Front End sent info ", sentInfo)
        let isSomeThingWrong = false;
        let emailRegExp = new RegExp("^[a-zA-Z0-9!#$%&*+/=?^_`{|}~'-]+(\\.[a-zA-Z0-9!#$%&*+/=?^_`{|}~'-]+)*@(yahoo|outlook|gmail)\\.com$");


        if (!sentInfo.username || !sentInfo.email || !sentInfo.password) {
            // then there is an error - missing required fields
            isSomeThingWrong = true;
        }

        // Check email format - if email exists but doesn't match pattern, mark as wrong
        if (sentInfo.email && !emailRegExp.test(sentInfo.email)) {
            isSomeThingWrong = true;
        }
        // in the regexp true - correct email false - wrong email

        if (isSomeThingWrong) {
            // then return immediately
            res.status(400).send("Make sure you are inputting all the required information in the correct format");
            return;
        }

        // else 
        // then do the user creation process    
        let user = await signUpService.userSignUp({
            username: sentInfo.username,
            email: sentInfo.email,
            password: sentInfo.password
        })
        // user will be true(created successfully) or false(already exists) 


        console.log(user)
        if (user.success) {
            res.status(201).json({ userCreated: true });
        }
        else if (user.success === false && user.reason === "email Duplicated" || user.reason === 'error while createPendingUser') {
            res.status(400).json({ userCreated: false, reason: "User Already Exists" })
        }

        else {
            // means error happened internally
            res.status(500).send("Internal server error");
            // res.send("User already exists.");
        }


    } catch (err) {
        console.log(err.message);
        res.status(500).json({ error: "Internal server error" });
    }

}




let verifyOtpFunction = async (req, res) => {
    try {
        // req.body =  { email , OTP }
        let { email, OTP } = req.body

        let result = await signUpService.ValidateOTPandGenerateTokens({ email, OTP })
        // if you receive an error now it means the user doesn't exist at all

        if (result.success) {
            // then send the access and refresh token
            res.status(200).json({
                accessToken: result.data.accessToken,
                refreshToken: result.data.refreshToken,
            })
        } else {
            res.status(400).json({ reason: result.reason })
        }
    } catch (err) {
        console.log("Error while verifyOtp : ", err.message);
        res.status(500).json({ error: "Internal server error" });
    }


};

// after this 2 requests all next requests will need to 
// have their access tokens verified by a middleware function
// to access the tokens - header
// authorization : "Bearer Token" - split it and access the actual token
// middleware runs jwt.verify(token , secret key , callback)
// middleware shall check if the accesstoken is expired too



// when u get refresh token 
// 1st check signed by u
// go to db and check if it is not expired and still valid
// then require access token
// if it is not proper then make them log in again to have a new refresh token
// upon logout to keep table from being bloated delete the ref token


// user logging in
let logInFunction = async (req, res) => {
    try {
        // when users login they input their email and password for the site
        // then check that matches and generate a new access and refresh token
        // in req.body = {email , password}
        let { email, password } = req.body;

        let result = await LogInLogOutSignOutHandler.LogIn({ email, password });

        if (result.success) {
            res.status(200).json(result.data);
        }
        else {
            // ie the email or passwords dont match
            res.status(400).json({ reason: result.reason })
        }

    } catch (err) {
        console.log("Error from /logIn route ", err.message);
        res.status(500).json({ error: "Internal server error" });
    }
}


// user logging out
let signOutFunction = async (req, res) => {
    // when user logs out make the homepage on and also delete the access and refresh token from the local storage
    // and invalidate the refresh token
    // req.body = { refreshToken };
    // using jwt-decode
    try {
        // when the user signs out send the refreshToken
        let { refreshToken } = req.body;

        let result = await LogInLogOutSignOutHandler.SignOut({ refreshToken });
        // controller sends the refreshToken , service layer - decodes it , model - does the actual invalidation

        if (result.success) {
            res.status(200).json({ message: "Sign out successful" });
        } else {
            // unsuccessful
            res.status(400).json({ error: result.reason || "Sign out failed" }); // ie it is due to the request
        }

    } catch (err) {
        console.log("Error from /signOut route ", err.message);
        res.status(500).json({ error: "Internal server error" });
    }

}






module.exports = {
    healthChecker,
    signUpFunction,
    verifyOtpFunction,
    logInFunction,
    signOutFunction
}



const express = require('express');

//   *** when using specific routes then enforce rate limiter on the routes file
//   *** the password strength needs to be confirmed in the front end

const rateLimiter = require('express-rate-limit');
// this is a library used to limit how many times a single ip can use ur api end point
// so that hackers won't be able to exhaust the server by sending the same request again and again


const { healthChecker,signUpFunction , verifyOtpFunction , logInFunction , signOutFunction } = require('../controller/userSignUp.js');

const { GivenRefTokenGenAccessToken } = require('../controller/givenRefGenerateAccessToken.js');
const { CheckHealth } = require('../middleware/ForGeneratingAccessTokenFromRefToken.js');


let rateLimiterForSignUp = rateLimiter({
    windowMs: 1 * 60 * 1000, // this is for 1 min window expressed in milliseconds
    max: 5, // within 1 minutes a single ip can have 5 requests for signing up and logging in
    message: "You have exhausted your attempt to log-in/sign-up try again later"
    // the front-end will accept this message and display it nicely
})


const LogInAndSignUpRouter = express.Router();

LogInAndSignUpRouter.use(rateLimiterForSignUp); // since this is used for logging in and sign up we use it for the whole app


// if route is user/ - get then check the health
LogInAndSignUpRouter.get('/' , healthChecker);


// remember the user is using a /user/signUp - for this service
LogInAndSignUpRouter.post('/signUp' , signUpFunction);

LogInAndSignUpRouter.post('/verifyOtp' , verifyOtpFunction );

LogInAndSignUpRouter.post('/logIn' , logInFunction );

LogInAndSignUpRouter.post('/signOut' , signOutFunction );

LogInAndSignUpRouter.post('/generateAccessToken' ,  CheckHealth , GivenRefTokenGenAccessToken);
// the middleware first checks if the ref token is correct and then sets the decodedRefresh as a request prop





module.exports = { LogInAndSignUpRouter }
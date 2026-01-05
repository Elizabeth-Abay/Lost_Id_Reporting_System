// this is a listener for the user signing up
// this listener will receive {username : sentInfo.username,email : sentInfo.email ,otp : OTP}
// so the purpose of this is to send the email to the user notifying the otp
// u define the event listener function here and export it to the service layer to listen to it

const nodeMailer = require('nodemailer');

const dotenv = require('dotenv');
const path = require('path');

dotenv.config({
    path : path.resolve(__dirname , '../../.env')
})



// const  { signUpService } = require('../service/userSignUpService.js')
// this taught me abt circular dependency ie when u require a file that file will get executed first so in 
// this case the ../service/userSignUpService.js does require the listener first but when u require without exporting 
// the listener first then it will cause an error


// const EventEmitter = require('events');  an event created by a single object needs to be listened by that same obj
// thus we shall write the listener function here and send it to the service


let emailTransporter = nodeMailer.createTransport({
    host: 'smtp.gmail.com', // means the emails i send live here 
    port: 587, // use this port to send out the emails
    secure: false,
    auth: {
        user: process.env.EMAIL,
        pass: process.env.EMAIL_PASSWORD // is the password for the app to be able to send 
        // emails through the provided email not ur actual email password
    },
    tls: { rejectUnauthorized: false } // bypass certificate validation  for development only reverse this once through dev't
})



async function sendingOTPEmail(emailInfo) {
    try {
        // if an error is thrown in here then it will be caught by the caller function
        // console.log("User_created is listened up")
        // then send the email
        // { email , OTP}
        let { email, OTP } = emailInfo;

        let emailSentOut = {
            from: `LOST ID REPORT`,
            to: email,
            subject: 'OTP verification',
            html: `<b>OTP IS ${OTP} </b>`
        }

        let result = await emailTransporter.sendMail(emailSentOut);
        // this returns a promise 
        // resolve - then email will be sent
        // error thrown then thrown error will be caught by the caller 
        // unless an error happens then successful


        console.log("result from emailTransporter " , result)
        return {
            success: true // this is for a consistent format
        }
    } catch (err){
        console.log("Error while sending emails")
        console.log(err.message)
        return {
            success : false,
            reason : "Error from sendingOTPEmail"
        }
    }
    

}



module.exports = { sendingOTPEmail }





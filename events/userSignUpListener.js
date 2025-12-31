// this is a listener for the user signing up
// this listener will receive {username : sentInfo.username,email : sentInfo.email ,otp : OTP}
// so the purpose of this is to send the email to the user notifying the otp


const nodeMailer = require('nodemailer');

// const  { signUpService } = require('../service/userSignUpService.js')
// this taught me abt circular dependency ie when u require a file that file will get executed first so in 
// this case the ../service/userSignUpService.js does require the listener first but when u require without exporting 
// the listener first then it will cause an error


// const EventEmitter = require('events');  an event created by a single object needs to be listened by that same obj
// thus we shall write the listener function here and send it to the service


let emailTransporter = nodeMailer.createTransport({
    host : 'smtp.gmail.com', // means the emails i send live here 
    port : 587, // use this port to send out the emails
    secure : false,
    auth : {
        user : process.env.EMAIL ,
        pass : process.env.EMAIL_PASSWORD // is the password for the app to be able to send 
        // emails through the provided email not ur actual email password
    },
    tls: { rejectUnauthorized: false } // bypass certificate validation  for development only reverse this once through dev't
})

async function signUpEventListener(emailInfo) {
    // console.log("User_created is listened up")
    // then send the email
    // {username , email , OTP}
    let {username , email , OTP} = emailInfo;

    let emailSentOut = {
        from : `VyBE App`,
        to : email ,
        subject : 'OTP verification',
        text : `Hello ${username} Your OTP is ${OTP}`,
        html : `<b>OTP IS ${OTP} </b>`
    }

    emailTransporter.sendMail(emailSentOut , (err , info) => {
        if (err){
            console.log("Error happened while sending email to user , " , err.message)
        }
    })


}

console.log("signUpEventListener" , typeof signUpEventListener );

module.exports = { signUpEventListener }




